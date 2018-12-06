/*
The colluder service works with colluder scripts run in a developer's browser by the Formulator WebExtension.
*/
package colluder

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"wel/services/colluder/ws"
	weltls "wel/tls"
)

var DistDirPath = "fe/dist"

var logger = log.New(os.Stdout, "[colluder] ", 0)

func RunHTTP(port int64) {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(DistDirPath)))
	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", port), weltls.LocalhostCertPath, weltls.LocalhostKeyPath, mux))
}

func RunWS(port int64) {
	wsService := ws.NewWebSocketService(port, weltls.LocalhostCertPath, weltls.LocalhostKeyPath)
	wsService.Run()
}
