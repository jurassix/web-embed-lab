package main

import (
	"log"
	"os"
	"time"

	weltls "wel/tls"

	"wel/services/colluder"
	"wel/services/proxy"
)

var logger = log.New(os.Stdout, "[colluder] ", 0)

func main() {
	logger.Println("Starting")

	os.Mkdir(proxy.StreamsDirPath, 0777)
	os.Mkdir(colluder.DistDirPath, 0777)

	err := weltls.ReadOrGenerateCa()
	if err != nil {
		logger.Printf("Could not read or generate TLS certs: %s", err)
		return
	}

	go colluder.RunHTTP(8081)
	go colluder.RunWS(8082)
	go proxy.Run(8080)

	for {
		time.Sleep(time.Hour)
	}
}
