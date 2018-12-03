package main

import (
	"log"
	"os"
	"time"

	"wel/services/colluder"
	"wel/services/proxy"
)

var logger = log.New(os.Stdout, "[colluder] ", 0)

func main() {
	logger.Println("Starting")

	os.Mkdir(proxy.StreamsDirPath, 0777)
	os.Mkdir(colluder.StaticDirPath, 0777)

	go colluder.Run()
	go proxy.Run()

	for {
		time.Sleep(time.Hour)
	}
}
