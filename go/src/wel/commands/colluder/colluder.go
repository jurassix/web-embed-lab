/*
The Colluder works with the Formulator to capture a browsing session.
That captured data is then used by the formula cli tool to draft a page formula.
*/
package colluder

import (
	"log"
	"os"
)

var logger = log.New(os.Stdout, "[colluder] ", 0)
