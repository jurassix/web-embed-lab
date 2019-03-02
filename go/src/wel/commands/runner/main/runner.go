package main

import (
	"log"
	"os"

	"wel/experiments"
	"wel/services/host"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

func main() {

	if len(os.Args) != 5 {
		printHelp()
		os.Exit(1)
		return
	}

	/*
		Read and parse the experiment definition
	*/
	experimentPath := os.Args[3]
	experimentFile, err := os.Open(experimentPath)
	if err != nil {
		logger.Println("Error opening experiment JSON:", experimentPath, ":", err)
		printHelp()
		os.Exit(1)
		return
	}
	defer experimentFile.Close()
	experiment, err := experiments.ParseExperiment(experimentFile)
	if err != nil {
		logger.Println("Error parsing experiment JSON:", experimentPath, ":", err)
		printHelp()
		os.Exit(1)
		return
	}

	/*
		Read the WebDriver configuration and set up the connection
	*/
	// TODO

	/*
		Start the page formula host
	*/
	go func() {
		host.RunHTTP(443, os.Args[1], os.Args[2], os.Args[4])
	}()

	/*
		For each {browser config, page formula} combination:
		- point the browser at the host
		- run the test probes
	*/
	for _, browserConfiguration := range experiment.BrowserConfigurations {
		// TODO: Spin up browser
		logger.Println("Spinning up", browserConfiguration.BrowserName, "on", browserConfiguration.Device, "version", browserConfiguration.OSVersion)

		for _, pageFormulaConfig := range experiment.PageFormulaConfigurations {
			logger.Println("Hosting page formula:", pageFormulaConfig.Name)
			// TODO: tell the host which page formula to use
			logger.Println("Testing...")
			// TODO: run the tests
		}
	}
}

func printHelp() {
	logger.Println("usage: runner <formulas dir> <probes dir> <experiment json> <embed script>")
	logger.Println("Example: runner ./examples/page-formulas/ ./examples/test-probes/ ./examples/experiments/hello-world.json ./examples/embed_scripts/no-op.js")
}
