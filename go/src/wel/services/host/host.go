/*
Host serves page formulas to browsers during an experiment.
*/
package host

import (
	"fmt"
	"log"
	"net/http"
	"os"

	weltls "wel/tls"
)

var logger = log.New(os.Stdout, "[host] ", 0)

func RunHTTP(port int64, formulasPath string) {

	mux := http.NewServeMux()

	// Serve page formulas
	formulaHost, err := NewFormulaHost(formulasPath)
	if err != nil {
		log.Fatal(fmt.Sprintf("Error starting formula host: %v", err))
	}
	mux.Handle("/", formulaHost)

	// TODO: Serve JS for in-page services

	// TODO: Serve test probes

	// TODO: Receive control messages to switch page formulas and probes

	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", port), weltls.LocalhostCertPath, weltls.LocalhostKeyPath, mux))
}
