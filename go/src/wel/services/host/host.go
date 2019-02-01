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

// The scripts for the tests
var ProbesURL = "/__wel_probes.js"

// The resources for the prober script that runs the tests
var ProberDistPath = "fe/dist/prober"
var ProberDistURL = "/__wel/prober/"
var ProberURL = fmt.Sprintf("%vprober.js", ProberDistURL)

func RunHTTP(port int64, formulasPath string, probesPath string) {

	probeScript, err := GenerateProbesScript(probesPath)
	if err != nil {
		logger.Println("Could not generate probe script at path", probesPath, err)
		return
	}

	mux := http.NewServeMux()

	// Serve test probes' JS
	mux.HandleFunc(ProbesURL, func(response http.ResponseWriter, request *http.Request) {
		response.Header().Add("Content-Type", "text/javascript")
		response.Write([]byte(probeScript))
	})

	// Serve prober JS that runs the tests
	mux.Handle(ProberDistURL, http.StripPrefix(ProberDistURL, http.FileServer(http.Dir(ProberDistPath))))

	// Serve page formulas
	formulaHost, err := NewFormulaHost(formulasPath)
	if err != nil {
		log.Fatal(fmt.Sprintf("Error starting formula host: %v", err))
	}
	mux.Handle("/", formulaHost)

	// TODO: Receive control messages to switch page formulas and probes

	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", port), weltls.LocalhostCertPath, weltls.LocalhostKeyPath, mux))
}
