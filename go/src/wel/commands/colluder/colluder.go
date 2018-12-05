/*
The cli package implements a Command Line Interface for the Web Extension Lab's host used while drafting page formulas.
*/
package colluder

import (
	"log"
	"os"
)

var logger = log.New(os.Stdout, "[colluder] ", 0)
