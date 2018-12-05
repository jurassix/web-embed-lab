/*
The colluder service works with colluder scripts run in a developer's browser by the Formulator WebExtension.
*/
package colluder

import (
	"log"
	"net/http"
	"os"

	weltls "wel/tls"
)

var DistDirPath = "fe/dist"

var logger = log.New(os.Stdout, "[colluder] ", 0)

func Run() {
	fs := http.FileServer(http.Dir(DistDirPath))
	http.Handle("/", fs)
	log.Fatal(http.ListenAndServeTLS(":8081", weltls.CaCertPath, weltls.CaKeyPath, nil))
}
