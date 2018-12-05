/*
tls contains certificate and TLS tools
*/
package tls

import (
	"log"
	"os"
)

var logger = log.New(os.Stdout, "[tls] ", 0)
