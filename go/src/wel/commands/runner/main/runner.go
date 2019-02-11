package main

import (
	"log"
	"os"

	"wel/services/host"
)

var logger = log.New(os.Stdout, "[runner] ", 0)

func main() {

	if len(os.Args) != 3 {
		printHelp()
		return
	}

	host.RunHTTP(443, os.Args[1], os.Args[2])
}

func printHelp() {
	logger.Println("usage: runner <formulas dir> <probes dir>")
	logger.Println("Example: runner ./examples/page-formulas/ ./examples/test-probes/")
}
