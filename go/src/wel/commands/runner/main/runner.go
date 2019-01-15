package main

import (
	"log"
	"os"

	"wel/services/host"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

func main() {

	if len(os.Args) != 2 {
		printHelp()
		return
	}

	host.RunHTTP(443, os.Args[1])
}

func printHelp() {
	logger.Println("usage: runner <formulas directory>")
	logger.Println("Example: runner ./examples/page-formulas/")
}
