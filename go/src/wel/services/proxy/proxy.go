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
)

// Where to write the captured stream files
var StreamsDirPath = "streams"

var logger = log.New(os.Stdout, "[proxy] ", 0)

func Run(port int) {
	logger.Println("Listening on", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), NewProxyServer()))
}

type ProxyServer struct {
	Transport *http.Transport
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

		proxyClient, _, e := hij.Hijack()
		if e != nil {
			panic("Cannot hijack connection " + e.Error())
		}
		hijackConnect(request, proxyClient, proxyServer)
	} else {
		handleHTTP(writer, request, proxyServer)
	}
}

func NewProxyServer() *ProxyServer {
	transport := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		Proxy:           http.ProxyFromEnvironment,
	}

	return &ProxyServer{transport}
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
