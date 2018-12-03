/*
The colluder service works with colluder scripts run in a developer's browser by the Formulator WebExtension.
*/
package colluder

import (
	"log"
	"net/http"
	"os"
)

var StaticDirPath = "static"

var logger = log.New(os.Stdout, "[colluder] ", 0)

func Run() {
	fs := http.FileServer(http.Dir("static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	//log.Fatal(http.ListenAndServeTLS(":8443", "cert.pem", "key.pem", nil))
}
