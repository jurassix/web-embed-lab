package main

import (
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/logrusorgru/aurora"

	"wel/commands"
	"wel/inspect"
)

var logger = log.New(os.Stdout, "[baseline] ", 0)

func main() {
	err := commands.SetupEnvironment()
	if err != nil {
		commands.PrintEnvUsage()
		logger.Println(aurora.Red("*FAILED*"))
		os.Exit(1)
	}

	/*
		Read the WebDriver configuration
	*/
	browserstackUrl := os.Getenv(commands.BrowserstackUrlVar)
	browserstackUser := os.Getenv(commands.BrowserstackUserVar)
	browserstackAPIKey := os.Getenv(commands.BrowserstackAPIKeyVar)
	if browserstackUser == "" || browserstackAPIKey == "" || browserstackUrl == "" {
		logger.Println(aurora.Red("Browserstack environment variables are required"))
		os.Exit(1)
	}

	/*
		Find the front end dist so we can load the WebExtension
	*/
	frontEndDistPath := os.Getenv(commands.FrontEndDistPathVar)
	if frontEndDistPath == "" {
		logger.Println(aurora.Red("Environment variable " + commands.FrontEndDistPathVar + " is required"))
		os.Exit(1)
	}

	if len(os.Args) != 2 {
		printHelp()
		os.Exit(1)
	}

	targetParam := strings.TrimSpace(os.Args[1])
	targetURL, err := url.Parse(targetParam)
	if err != nil {
		logger.Println(aurora.Red("Unable to parse target URL: " + targetParam))
		printHelp()
		os.Exit(1)
	}
	if targetURL.IsAbs() == false {
		logger.Println(aurora.Red("Unable to parse target absolute URL: " + targetParam))
		printHelp()
		os.Exit(1)
	}

	config := inspect.Config{
		BrowserstackURL:    browserstackUrl,
		BrowserstackUser:   browserstackUser,
		BrowserstackAPIKey: browserstackAPIKey,
		FrontEndDistPath:   frontEndDistPath,
		TargetURL:          targetURL,
	}

	data, err := inspect.GatherPerformanceData(&config)
	if err != nil {
		logger.Println(aurora.Red("Error gathering performance data:"), err)
		os.Exit(1)
	}

	logger.Println("Data:")
	data.Print()
}

func printHelp() {
	logger.Println("usage:")
	logger.Println(aurora.Bold("baseline <target absolute URL>"))
	logger.Println("Example: Note the absolute URL (includes https:// or http://)")
	logger.Println("baseline \"https://example.com/\"")
}
