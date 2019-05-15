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

var DistDirPath = "fe/dist/colluder"
var ColluderProxyPort int = 9080
var ColluderWebPort int64 = 9081
var ColluderWebSocketPort int64 = 9082

var logger = log.New(os.Stdout, "[colluder] ", 0)

var CurrentWebSocketService *ws.WebSocketService = nil

func PrepForCollusion() error {
	os.Mkdir(DistDirPath, 0777)
	return weltls.ReadOrGenerateCa()
}

func RunHTTP(port int64) {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(DistDirPath)))
	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", port), weltls.LocalhostCertPath, weltls.LocalhostKeyPath, mux))
}

func RunWS(port int64) {
	if CurrentWebSocketService != nil {
		return
	}
	CurrentWebSocketService = ws.NewWebSocketService(port, weltls.LocalhostCertPath, weltls.LocalhostKeyPath)
	CurrentWebSocketService.Run()
}

/*
Copyright 2019 FullStory, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
