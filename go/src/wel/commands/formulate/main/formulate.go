package main

import (
	"log"
	"os"
	"path"

	"wel/services/colluder/session"
)

var logger = log.New(os.Stdout, "[formulate] ", 0)

func main() {
	if len(os.Args) != 3 {
		printHelp()
		return
	}

	capturePath := os.Args[1]
	captureStat, err := os.Stat(capturePath)
	if err != nil {
		logger.Printf("Could not find capture path: \"%v\"", capturePath)
		return
	}
	if captureStat.IsDir() == false {
		logger.Printf("Did not find a capture directory: %v", capturePath)
		return
	}

	formulaPath := os.Args[2]
	if os.MkdirAll(formulaPath, 0777) != nil {
		logger.Printf("Could not find or create formula path: \"%v\"", formulaPath)
		return
	}

	timelinePath := path.Join(capturePath, session.TimelineFileName)
	timelineStat, err := os.Stat(timelinePath)
	if err != nil {
		logger.Printf("Could not find timeline: \"%v\"", timelinePath)
		return
	}
	if timelineStat.IsDir() {
		logger.Printf("Found a dir where the timeline should be: \"%v\"", timelinePath)
		return
	}
	timelineFile, err := os.Open(timelinePath)
	if err != nil {
		logger.Printf("Could not open timeline: \"%v\"", timelinePath)
		return
	}
	defer func() {
		timelineFile.Close()
	}()

	logger.Printf("Formulating %v", capturePath)

	timeline, err := session.ParseTimeline(timelineFile)
	if err != nil {
		logger.Printf("Could not parse timeline: \"&v\"", timelinePath)
	}

	for _, request := range timeline.Requests {
		logger.Printf("Request: %v", request)
	}
}

func printHelp() {
	logger.Println("usage: formulate <source capture directory> <formula destination directory>")
	logger.Println("Example: formulate ./captures/2018-12-28-5C266D4F-1C03/ ./formulas/spiffy-formula/")
}
