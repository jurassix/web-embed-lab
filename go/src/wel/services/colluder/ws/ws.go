package ws

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/nu7hatch/gouuid"
)

var logger = log.New(os.Stdout, "[ws] ", 0)

/*
WebSocketService holds references to an HTTP services that can upgrade to WebSockets
*/
type WebSocketService struct {
	Port     int64
	CertPath string // file path to a TLS cert PEM
	KeyPath  string // file path to a TLs key PEM
	Handler  *WebSocketHandler
}

var WebSocketPath = "/ws"

func NewWebSocketService(port int64, certPath string, keyPath string) *WebSocketService {
	return &WebSocketService{
		Port:     port,
		CertPath: certPath,
		KeyPath:  keyPath,
		Handler:  NewWebSocketHandler(),
	}
}

func (service *WebSocketService) Run() {

	mux := http.NewServeMux()

	// Handle WebSocket connections at /ws
	mux.Handle(WebSocketPath, service.Handler)

	// Handle root requests for easy testing and so there is a URL load balancer tests can hit without attempting upgrade to WebSocket
	mux.HandleFunc("/", func(responseWriter http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/" {
			http.NotFound(responseWriter, request)
			return
		}
		io.WriteString(responseWriter, "<html>This is only a WebSocket service</html>")
	})

	logger.Println("Listening on", service.Port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", service.Port), service.CertPath, service.KeyPath, mux))
}

func UUID() string {
	u4, _ := uuid.NewV4()
	return u4.String()
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
