package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"wel/commands/runner"
	"wel/experiments"
	"wel/services/host"

	"github.com/logrusorgru/aurora"
	"github.com/sclevine/agouti"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

var runnerPort int64 = 9090

var browserstackURL = "http://hub-cloud.browserstack.com/wd/hub"
var browserstackUserVar = "BROWSERSTACK_USER"
var browserstackAPIKeyVar = "BROWSERSTACK_API_KEY"
var frontEndDistPathVar = "FRONT_END_DIST"

/*
The runner command runs an experiment, using Selenium to run test probes in page formulas.
*/
func main() {
	_, success := run()
	if success {
		logger.Println(aurora.Green("*PASSED*"))
		os.Exit(0)
	} else {
		logger.Println(aurora.Red("*FAILED*"))
		os.Exit(1)
	}
}

/*
run does the work of running the experiment
The returned string is either empty or a JSON string with test results
The returned bool is true if all tests were run and passed
*/
func run() (string, bool) {
	/*
		Read the path of the front end dist directory
	*/
	frontEndDistPath := os.Getenv(frontEndDistPathVar)
	if frontEndDistPath == "" {
		logger.Println("Environment variable", frontEndDistPathVar, "is required")
		return "", false
	}

	if len(os.Args) == 3 {
		// Run in developer host mode
		host.RunHTTP(runnerPort, frontEndDistPath, os.Args[1], os.Args[2], "")
	} else if len(os.Args) != 5 {
		printHelp()
		return "", false
	}

	/*
		Read the WebDriver configuration
	*/
	browserstackUser := os.Getenv(browserstackUserVar)
	browserstackAPIKey := os.Getenv(browserstackAPIKeyVar)
	if browserstackUser == "" || browserstackAPIKey == "" {
		logger.Println("Environment variables", browserstackUserVar, "and", browserstackAPIKeyVar, "are required")
		return "", false
	}

	/*
		Read and parse the experiment definition
	*/
	experimentPath := os.Args[3]
	experimentFile, err := os.Open(experimentPath)
	if err != nil {
		logger.Println("Error opening experiment JSON:", experimentPath, ":", err)
		printHelp()
		return "", false
	}
	defer experimentFile.Close()
	experiment, err := experiments.ParseExperiment(experimentFile)
	if err != nil {
		logger.Println("Error parsing experiment JSON:", experimentPath, ":", err)
		printHelp()
		return "", false
	}

	if len(experiment.TestRuns) == 0 {
		logger.Println("Experiment has not defined any test-runs:", experimentPath)
		return "", false
	}

	/*
		Start the page formula host
	*/
	go func() {
		host.RunHTTP(runnerPort, frontEndDistPath, os.Args[1], os.Args[2], os.Args[4])
	}()

	/*
		Set up the ngrok tunnel
	*/
	ngrokController := runner.NewNgrokController()
	err = ngrokController.Start(runnerPort)
	if err != nil {
		logger.Println("Could not start ngrok", err)
		return "", false
	}
	defer ngrokController.Stop()

	var tunnels *runner.NgrokTunnels = nil
	tryCount := 0
	pageHostURL := ""
	for {
		if tryCount > 100 {
			logger.Println("Could not read ngrok process")
			return "", false
		}
		tryCount += 1
		// wait for ngrok to start or fail
		time.Sleep(100 * time.Millisecond)
		if ngrokController.Command == nil {
			continue
		}
		if ngrokController.Command.ProcessState != nil {
			logger.Println("ngrok process ended")
			return "", false
		}
		tunnels, err = runner.FetchNgrokTunnels()
		if err != nil {
			continue
		}
		if len(tunnels.Tunnels) == 2 {
			if tunnels.Tunnels[0].Protocol == "https" {
				pageHostURL = tunnels.Tunnels[0].PublicURL
			} else if tunnels.Tunnels[1].Protocol == "https" {
				pageHostURL = tunnels.Tunnels[1].PublicURL
			} else {
				logger.Println("No ngrok tunnel is https")
				return "", false
			}
			break
		}
	}

	/*
		For each test run defined in the experiment:
			For each browser in the test run:
				Open a WebDriver connection
				For each page formula:
					Tell the host to host the page formula
					Tell the browser to open the correct host URL
					Run the specified test probes and collect results
	*/
	gatheredResults := []*runner.ProbeResults{}
	gatheredReturnValues := []string{}

	for index, testRun := range experiment.TestRuns {
		logger.Println(aurora.Bold("Test Run #"), aurora.Bold(index))
		if len(testRun.PageFormulas) == 0 || len(testRun.TestProbes) == 0 || len(testRun.Browsers) == 0 {
			logger.Println("Invalid Test Run:", testRun)
			return "", false
		}

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
			for key, value := range browserConfiguration {
				capabilities[key] = value
			}
			page, err := agouti.NewPage(browserstackURL, []agouti.Option{agouti.Desired(capabilities)}...)
			if err != nil {
				logger.Println("Failed to open selenium:", err)
				return "", false
			}
			defer page.Destroy() // Close the WebDriver session

			hasNavigated := false // true after the WebDriver session has navigated once

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

				// Navigate the browser to the right URL
				if hasNavigated {
					err = page.Reset()
					if err != nil {
						logger.Println("Failed to reset page", err)
						return "", false
					}
				}
				err = page.Navigate(pageHostURL + controlResponse.InitialPath)
				if err != nil {
					logger.Println("Failed to navigate to hosted page formula", err)
					return "", false
				}
				hasNavigated = true

				// Run the tests
				logger.Printf("Testing '%v' on '%v':", pageFormulaConfig.Name, browserName)
				var returnValue string
				script := fmt.Sprintf(`
					return JSON.stringify(
						runWebEmbedLabProbes(
							%s,
							%s
						)
					);`, testsJSON, string(probeBasis))
				page.RunScript(script, map[string]interface{}{}, &returnValue)
				probeResults := &runner.ProbeResults{}
				err = json.Unmarshal([]byte(returnValue), probeResults)
				if err != nil {
					logger.Println("Error parsing probes result", err, returnValue)
					return "", false
				} else {
					for testName, result := range *probeResults {
						if result.Passed() {
							logger.Println(testName+":", aurora.Green("passed"))
						} else {
							logger.Println(testName+":", aurora.Red("failed"))
							if basis, ok := controlResponse.ProbeBasis[testName]; ok == true {
								logger.Println("Expected:", basis)
							}
							logger.Println("Received:", aurora.Red(result))
						}
					}
					gatheredResults = append(gatheredResults, probeResults)
					gatheredReturnValues = append(gatheredReturnValues, returnValue)
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

func printHelp() {
	logger.Println("usage: runner <formulas dir> <probes dir> <experiment json> <embed script>")
	logger.Println("Example: runner ./examples/page-formulas/ ./examples/test-probes/ ./examples/experiments/hello-world.json ./examples/embed_scripts/no-op.js\n")
	logger.Println("usage (development mode): runner <formulas dir> <probes dir>")
	logger.Println("Example: runner ./examples/page-formulas/ ./examples/test-probes/")
}

/*
Copyright 2019 FullStory, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
