package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"wel/commands"
	"wel/experiments"
	"wel/services/host"
	"wel/tunnels"

	"github.com/logrusorgru/aurora"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

var pageHostPort int64 = 9190

/*
The runner command runs an experiment, using Selenium to run test probes in page formulas.
*/
func main() {
	err := commands.SetupEnvironment()
	if err != nil {
		commands.PrintEnvUsage()
		logger.Println(aurora.Red("*FAILED*"))
		os.Exit(1)
	}

	if run() {
		logger.Println(aurora.Green("*PASSED*"))
		os.Exit(0)
	} else {
		logger.Println(aurora.Red("*FAILED*"))
		os.Exit(1)
	}
}

/*
run does the work of running the experiment
The returned bool is true if all tests were run and passed
*/
func run() bool {
	/*
		Read the path of the front end dist directory
	*/
	frontEndDistPath := os.Getenv(commands.FrontEndDistPathVar)
	if frontEndDistPath == "" {
		logger.Println("Environment variable", commands.FrontEndDistPathVar, "is required")
		return false
	}

	if len(os.Args) == 3 {
		logger.Println("Developer mode on port", pageHostPort)
		host.RunHTTP(pageHostPort, frontEndDistPath, os.Args[1], os.Args[2], "")
	} else if len(os.Args) == 4 {
		logger.Println("Embed mode on port", pageHostPort)
		host.RunHTTP(pageHostPort, frontEndDistPath, os.Args[1], os.Args[2], os.Args[3])
	} else if len(os.Args) != 5 && len(os.Args) != 6 {
		printHelp()
		return false
	}

	/*
		Read the WebDriver configuration
	*/
	browserstackUrl := os.Getenv(commands.BrowserstackUrlVar)
	browserstackUser := os.Getenv(commands.BrowserstackUserVar)
	browserstackAPIKey := os.Getenv(commands.BrowserstackAPIKeyVar)
	if browserstackUser == "" || browserstackAPIKey == "" || browserstackUrl == "" {
		logger.Println("Browserstack environment variables are required")
		return false
	}

	ngrokAuthToken := os.Getenv(commands.NgrokAuthTokenVar)
	if ngrokAuthToken == "" {
		logger.Println("Ngrok auth token is required")
		return false
	}

	formulasPath := os.Args[1]
	probesPath := os.Args[2]
	embedScriptPath := os.Args[3]
	experimentPath := os.Args[4]
	soloPageFormulaName := ""
	if len(os.Args) == 6 {
		soloPageFormulaName = os.Args[5]
	}

	/*
		Read and parse the experiment definition
	*/
	experimentFile, err := os.Open(experimentPath)
	if err != nil {
		logger.Println("Error opening experiment JSON:", experimentPath, ":", err)
		printHelp()
		return false
	}
	defer experimentFile.Close()
	experiment, err := experiments.ParseExperiment(experimentFile)
	if err != nil {
		logger.Println("Error parsing experiment JSON:", experimentPath, ":", err)
		printHelp()
		return false
	}
	ok, runnableErrorMessage := experiment.IsRunnable()
	if ok == false {
		logger.Println("Experiment is not runnable:", runnableErrorMessage)
		return false
	}

	/*
		Split out experiments by browser configuration
	*/
	perBrowserExperiments := []*experiments.Experiment{}
	for _, browserConfig := range experiment.BrowserConfigurations {
		bcName, ok := browserConfig["name"]
		if ok == false {
			logger.Println("Non-named browser config", browserConfig)
			return false
		}
		splitExperiment, ok := experiment.SplitOutBrowser(bcName.(string))
		if ok == false {
			logger.Println("Could not split browser config", bcName)
			return false
		}
		if soloPageFormulaName != "" {
			if _, ok := splitExperiment.GetPageFormulaConfiguration(soloPageFormulaName); ok == false {
				continue
			}
		}

		perBrowserExperiments = append(perBrowserExperiments, splitExperiment)
	}

	if len(perBrowserExperiments) == 0 {
		logger.Println("Found no valid browser / page formula combinations")
		return false
	}

	/*
		Set up the ngrok tunnels
	*/
	tunnelConfigs := []tunnels.TunnelConfig{}
	for index, _ := range perBrowserExperiments {
		tunnelConfigs = append(tunnelConfigs, tunnels.TunnelConfig{
			Port:     pageHostPort + int64(index),
			Protocol: "http",
		})
	}
	ngrokController := tunnels.NewNgrokController()
	err = ngrokController.StartAll(tunnelConfigs, ngrokAuthToken)
	if err != nil {
		logger.Println("Could not start ngrok", err)
		return false
	}
	defer ngrokController.Stop()

	/*
		Find the ngrok tunnels
	*/
	ngrokTunnels, err := ngrokController.WaitForNgrokTunnels("https", len(perBrowserExperiments))
	if err != nil {
		logger.Println("Error", err)
		return false
	}

	updateReceiver := make(chan experiments.CollectorUpdate)

	for index, experiment := range perBrowserExperiments {
		// Spin up host
		go func(pageHostPort int64, frontEndDistPath string, formulasPath string, probesPath string, embedScriptPath string) {
			host.RunHTTP(
				pageHostPort,
				frontEndDistPath,
				formulasPath,
				probesPath,
				embedScriptPath,
			)
		}(
			ngrokTunnels.Tunnels[index].LocalPort(),
			frontEndDistPath,
			formulasPath,
			probesPath,
			embedScriptPath,
		)

		experimentConfig := experiments.ExperimentConfig{
			BrowserstackURL:    browserstackUrl,
			BrowserstackUser:   browserstackUser,
			BrowserstackAPIKey: browserstackAPIKey,
			FrontEndDistPath:   frontEndDistPath,
			PublicPageHostURL:  ngrokTunnels.Tunnels[index].PublicURL,
			PageHostPort:       ngrokTunnels.Tunnels[index].LocalPort(),
		}

		// Spin up experiment run
		go func(experiment *experiments.Experiment, experimentConfig experiments.ExperimentConfig, updateReceiver chan experiments.CollectorUpdate) {
			bcName, _ := experiment.BrowserConfigurations[0]["name"]
			// Gather the baseline data without the target embed script
			baselineData, err := experiments.GatherExperimentBaseline(
				experiment,
				&experimentConfig,
				soloPageFormulaName,
			)
			if err != nil || len(baselineData) == 0 {
				logger.Println("Error gathering baseline", err, len(baselineData))
				updateReceiver <- experiments.CollectorUpdate{
					Browser: bcName.(string),
					Partial: false,
					Results: []experiments.RunResult{
						experiments.RunResult{
							PageFormula: "Baseline",
							Test:        "All",
							Basis:       map[string]interface{}{},
							Baseline:    map[string]interface{}{},
							Result: experiments.ProbeResult{
								"passed": false,
							},
							Log: fmt.Sprintf("Error gathering baseline: %v", err),
						},
					},
				}
				return
			}
			experiments.RunExperimentTests(
				experiment,
				&experimentConfig,
				baselineData,
				soloPageFormulaName,
				updateReceiver,
			)
		}(experiment, experimentConfig, updateReceiver)
	}

	failureLog, err := ioutil.TempFile(os.TempDir(), "wel-failures-")
	if err != nil {
		logger.Println("Could not open failure log", err)
		return false
	}
	defer failureLog.Close()
	logger.Println("Writing any failures to ", failureLog.Name())

	completedCount := 0
	passedCount := 0
	failed := false
	for update := range updateReceiver {
		if update.Partial {
			if update.Passed() {
				passedCount += 1
				for _, result := range update.Results {
					logger.Println(aurora.Green("Passed:"), fmt.Sprintf("%v / %v / %v", update.Browser, result.PageFormula, result.Test))
				}
			} else {
				failed = true
				for _, result := range update.Results {
					logger.Println(aurora.Red("Failed:"), fmt.Sprintf("%v / %v / %v", update.Browser, result.PageFormula, result.Test))
					if _, err = failureLog.Write([]byte(fmt.Sprintf("****\nFailed: %v / %v / %v\n\n", update.Browser, result.PageFormula, result.Test))); err != nil {
						logger.Println("Could not write failure header", err)
					}
					if _, err = failureLog.Write([]byte(fmt.Sprintf("Baseline:\n%s\n\n", marshal(result.Baseline)))); err != nil {
						logger.Println("Could not write failure baseline", err)
					}
					if _, err = failureLog.Write([]byte(fmt.Sprintf("Basis:\n%s\n\n", marshal(result.Basis)))); err != nil {
						logger.Println("Could not write failure basis", err)
					}
					if _, err = failureLog.Write([]byte(fmt.Sprintf("Received:\n%s\n\n", marshal(result.Result)))); err != nil {
						logger.Println("Could not write failure result", err)
					}
					if _, err = failureLog.Write([]byte(fmt.Sprintf("Log:\n%v\n\n", result.Log))); err != nil {
						logger.Println("Could not write failure log", err)
					}
				}
			}
		} else {
			completedCount += 1
			if len(perBrowserExperiments) == completedCount {
				break
			}
		}
	}

	if failed == false {
		os.Remove(failureLog.Name())
	}

	return failed == false
}

func marshal(data map[string]interface{}) []byte {
	result, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		logger.Println("Error marshalling", err)
		return []byte("Error")
	}
	return result
}

func printHelp() {
	logger.Println("usage (experiment mode): runs the experiment")
	logger.Println(aurora.Bold("runner <formulas dir> <probes dir> <embed script> <experiment json>"))
	logger.Println("Example:")
	logger.Println("runner ../pf/ ./examples/test-probes/ ./examples/embed_scripts/no-op.js ./examples/experiments/external-experiment.json\n")

	logger.Println("usage (single page formula experiment mode): runs only one page formula in the experiment")
	logger.Println(aurora.Bold("runner <formulas dir> <probes dir> <embed script> <experiment json> <page formula name>"))
	logger.Println("Example:")
	logger.Println("runner ../pf/ ./examples/test-probes/ ./examples/embed_scripts/no-op.js ./examples/experiments/external-experiment.json transmutable-light\n")

	logger.Println("usage (development mode): runs the page formula host")
	logger.Println(aurora.Bold("runner <formulas dir> <probes dir>"))
	logger.Println("Example:")
	logger.Println("runner ../pf/ ./examples/test-probes/\n")

	logger.Println("usage (embed mode): runs the page formula host with an embed script")
	logger.Println(aurora.Bold("runner <formulas dir> <probes dir> <embed script>"))
	logger.Println("Example:")
	logger.Println("runner ../pf/ ./examples/test-probes/ ./examples/embed_scripts/no-op.js")
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
