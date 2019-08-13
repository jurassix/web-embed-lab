package experiments

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"time"

	"wel/services/host"
	"wel/webdriver"

	"github.com/logrusorgru/aurora"
	"github.com/sclevine/agouti"
)

func RunExperiment(
	experiment *Experiment,
	browserstackUser string,
	browserstackAPIKey string,
	frontEndDistPath string,
	pageHostURL string,
	runnerPort int64,
) (string, bool) {

	/*
		For each test run defined in the experiment:
			For each browser in the test run:
				Open a WebDriver connection
				For each page formula:
					Tell the host to host the page formula
					Tell the browser to open the correct host URL
					Run the specified test probes and collect results
	*/
	gatheredResults := []*ProbeResults{}
	gatheredReturnValues := []string{}

	// On Chrome, load the prober-extension
	extensionPath := frontEndDistPath + "prober-extension/prober-extension.xpi"
	crxBytes, err := ioutil.ReadFile(extensionPath)
	if err != nil {
		logger.Println(aurora.Red(fmt.Sprintf("Error reading extension (%v): %v", extensionPath, err)))
		return "", false
	}

	for index, testRun := range experiment.TestRuns {
		logger.Println(aurora.Bold("Test Run #"), aurora.Bold(index))

		// Opening the browser is the slowest part of a test run so open each browser only once
		for _, browserName := range testRun.Browsers {
			// Make sure we have a browser configuration
			browserConfiguration, ok := experiment.GetBrowserConfiguration(browserName)
			if ok == false {
				logger.Println("Unknown browser:", browserName)
				return "", false
			}

			// Open WebDriver connection to the browser
			logger.Println("Connecting to browser:", browserName)
			capabilities := agouti.NewCapabilities()
			capabilities["browserstack.user"] = browserstackUser
			capabilities["browserstack.key"] = browserstackAPIKey
			capabilities["browserstack.console"] = "verbose"
			capabilities["browserstack.seleniumLogs"] = "true"
			capabilities["chromeOptions"] = map[string][][]byte{
				"extensions": {crxBytes},
			}

			for key, value := range browserConfiguration {
				capabilities[key] = value
			}
			page, err := agouti.NewPage(webdriver.BrowserstackURL, []agouti.Option{agouti.Desired(capabilities)}...)
			if err != nil {
				logger.Println("Failed to open selenium:", err)
				return "", false
			}
			defer page.Destroy() // Close the WebDriver session

			hasBrowserLog := false
			logTypes, err := page.LogTypes()
			if err == nil {
				for _, logType := range logTypes {
					if logType == "browser" {
						hasBrowserLog = true
						break
					}
				}
			}

			/*
				Navigate to a blank page.
				This is necessary to let the prober-extension get its hooks into the page so that we can get sample early in loading the page formulas.
			*/
			err = page.Navigate(pageHostURL + host.BlankURL)
			if err != nil {
				logger.Println("Failed to navigate to blank page", err)
				return "", false
			}

			testsJSON, err := json.Marshal(testRun.TestProbes)
			if err != nil {
				logger.Println("Could not serialize tests:", err, testRun.TestProbes)
				return "", false
			}

			for _, pageFormulaName := range testRun.PageFormulas {
				pageFormulaConfig, ok := experiment.GetPageFormulaConfiguration(pageFormulaName)
				if ok == false {
					logger.Println("Unknown page formula:", pageFormulaName)
					return "", false
				}

				// Host the right page formula and parse the test probe basis
				formulaSet, controlResponse, err := host.RequestPageFormulaChange(runnerPort, pageFormulaConfig.Name)
				if err != nil {
					logger.Println("Failed to reach host control API", err)
					return "", false
				}
				if formulaSet == false {
					logger.Println("Failed to host page formula", pageFormulaConfig.Name)
					return "", false
				}
				probeBasis, err := json.Marshal(controlResponse.ProbeBasis)
				if err != nil {
					logger.Println("Failed to unmarshal probe basis", err, controlResponse.ProbeBasis)
					return "", false
				}
				if probeBasis == nil || string(probeBasis) == "null" {
					probeBasis = []byte("{}")
				}

				// Reset the browser
				err = page.Reset()
				if err != nil {
					logger.Println("Failed to reset page", err)
					return "", false
				}
				page.ReadNewLogs("browser")

				// Navigate the browser to the right URL
				logger.Printf("Navigating to %v...", pageFormulaConfig.Name)
				err = page.Navigate(pageHostURL + controlResponse.InitialPath)
				if err != nil {
					logger.Println("Failed to navigate to hosted page formula", err)
					return "", false
				}
				logger.Printf("Initial navigation complete.")

				time.Sleep(5 * time.Second)

				// Run the tests
				logger.Printf("Testing '%v' on '%v':", pageFormulaConfig.Name, browserName)

				var returnValue string
				script := fmt.Sprintf(`
					try {
						let results = await runWebEmbedLabProbes(
							%s,
							%s
						);
						callback(JSON.stringify(results));
					} catch (e) {
						console.error('Error running probes: ' + e);
						let results = {
							'wel-failure': { passed: false, error: 'error running the tests' }
						}
						callback(JSON.stringify(results));
					}
					`, testsJSON, string(probeBasis))
				page.RunAsyncScript(script, &returnValue)

				probeResults := &ProbeResults{}
				err = json.Unmarshal([]byte(returnValue), probeResults)
				if err != nil {
					logger.Println("Error parsing probes result:", err, fmt.Sprintf("\"%v\"", returnValue))
					return "", false
				}
				hasAFail := false
				for testName, result := range *probeResults {
					if result.Passed() {
						logger.Println(testName+":", aurora.Green("passed"))
					} else {
						hasAFail = true
						logger.Println(testName+":", aurora.Red("failed"))
						if basis, ok := controlResponse.ProbeBasis[testName]; ok == true {
							marshalledBasis, err := json.MarshalIndent(basis, "", "\t")
							if err != nil {
								logger.Println(aurora.Red("Expected:"), basis)
							} else {
								logger.Println(aurora.Red("Expected:"), string(marshalledBasis))
							}
						}
						marshalledResult, err := json.MarshalIndent(result, "", "\t")
						if err != nil {
							logger.Println(aurora.Red("Received:"), result)
						} else {
							logger.Println(aurora.Red("Received:"), string(marshalledResult))
						}
					}
				}
				gatheredResults = append(gatheredResults, probeResults)
				gatheredReturnValues = append(gatheredReturnValues, returnValue)

				if hasAFail {
					if hasBrowserLog {
						if logs, err := page.ReadNewLogs("browser"); err != nil {
							logger.Println("Error fetching logs", err)
						} else {
							for _, log := range logs {
								logger.Println("Log:", log.Message)
							}
						}
					} else {
						logger.Println("Browser does not provide logs :-(")
					}
				}
			}
			page.Destroy()
		}
	}

	hasFailure := false
	for _, probeResults := range gatheredResults {
		if probeResults.Passed() == false {
			hasFailure = true
		}
	}
	returnJSON, err := json.MarshalIndent(gatheredResults, "", "\t")
	if err != nil {
		logger.Println("Error serializing gathered results", err)
		return "", hasFailure == false
	}
	return string(returnJSON), hasFailure == false
}
