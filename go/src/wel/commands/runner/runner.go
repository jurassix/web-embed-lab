package runner

import (
	"log"
	"os"
)

var logger = log.New(os.Stdout, "[runner] ", 0)
