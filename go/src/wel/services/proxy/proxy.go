/*
Proxy exposes a forward HTTP proxy and captures browsing session information so that the Formulator can help the developer create page formulas.
*/
package proxy

import (
	"bufio"
	"crypto/tls"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

var logger = log.New(os.Stdout, "[proxy] ", 0)

var CurrentProxyServer *ProxyServer = nil

func Run(port int) {
	if CurrentProxyServer != nil {
		return
	}
	CurrentProxyServer = NewProxyServer()
	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), CurrentProxyServer))
}

type ProxyServer struct {
	Transport *http.Transport
}

func NewProxyServer() *ProxyServer {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		Proxy:           http.ProxyFromEnvironment,
		IdleConnTimeout: 2 * time.Second,
	}

	return &ProxyServer{transport}
}

/*
ServeHTTP hands CONNECT requests to hijackConnect and plain HTTP requests to handlHTTP
*/
func (proxyServer *ProxyServer) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	if request.Method == "CONNECT" {
		hij, ok := writer.(http.Hijacker)
		if !ok {
			panic("httpserver does not support hijacking")
		}

		clientConn, _, e := hij.Hijack()
		if e != nil {
			panic("Cannot hijack connection " + e.Error())
		}
		hijackConnect(request, clientConn, proxyServer)
	} else {
		handleHTTP(writer, request, proxyServer)
	}
}

func isEof(r *bufio.Reader) bool {
	_, err := r.Peek(1)
	if err == io.EOF {
		return true
	}
	return false
}

func httpError(writer io.WriteCloser, err error) {
	if _, err := io.WriteString(writer, "HTTP/1.1 502 Bad Gateway\r\n\r\n"); err != nil {
		logger.Printf("Error responding to client: %s", err)
	}
	if err := writer.Close(); err != nil {
		logger.Printf("Error closing client connection: %s", err)
	}
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
