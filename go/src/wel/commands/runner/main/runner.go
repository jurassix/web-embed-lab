package main

import (
	"log"
	"os"
	"time"

	"wel/commands/runner"
	"wel/experiments"
	"wel/services/host"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

var runnerPort int64 = 8090

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
		Set up the ngrok tunnel
	*/
	ngrokController := runner.NewNgrokController()
	err = ngrokController.Start(runnerPort)
	if err != nil {
		logger.Println("Could not start ngrok", err)
		os.Exit(1)
		return
	}
	defer ngrokController.Stop()

	logger.Println("Waiting for ngrok tunnels")
	var tunnels *runner.NgrokTunnels = nil
	tryCount := 0
	for {
		if tryCount > 100 {
			logger.Println("Could not read ngrok process")
			os.Exit(1)
		}
		tryCount += 1
		// wait for ngrok to start or fail
		time.Sleep(100 * time.Millisecond)
		if ngrokController.Command == nil {
			continue
		}
		if ngrokController.Command.ProcessState != nil {
			logger.Println("ngrok process ended")
			os.Exit(1)
			return
		}
		tunnels, err = runner.FetchNgrokTunnels()
		if err != nil {
			logger.Println("Error fetching tunnels", err)
			continue
		}
		if len(tunnels.Tunnels) == 2 {
			logger.Println("Found ngrok tunnels")
			logger.Println("\t", tunnels.Tunnels[0].PublicURL)
			logger.Println("\t", tunnels.Tunnels[1].PublicURL)
			break
		}
	}

	/*
		Read the WebDriver configuration and set up the connection
	*/
	// TODO

	/*
		Start the page formula host
	*/
	go func() {
		host.RunHTTP(runnerPort, os.Args[1], os.Args[2], os.Args[4])
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
