package proxy

import (
	"bytes"
	"io"
	"io/ioutil"
	"net/http"
	"strconv"
)

func handleHTTP(writer http.ResponseWriter, clientRequest *http.Request, proxyServer *ProxyServer) {
	host := clientRequest.URL.Host
	if !hasPort.MatchString(host) {
		host += ":80"
	}
	logger.Println("Service HTTP", host)

	if !clientRequest.URL.IsAbs() {
		http.Error(writer, "This is a proxy server that not respond to non-proxy requests.", 500)
		return
	}

	targetResponse, err := proxyServer.Transport.RoundTrip(clientRequest)
	if err != nil {
		logger.Printf("Cannot read response from server %v", err)
		return
	}
	defer targetResponse.Body.Close()

	// Set the relayed headers
	for key, values := range targetResponse.Header {
		for _, value := range values {
			writer.Header().Add(key, value)
		}
	}

	if targetResponse.ContentLength > 0 {
		writer.WriteHeader(targetResponse.StatusCode)
		if _, err := io.CopyN(writer, targetResponse.Body, targetResponse.ContentLength); err != nil {
			logger.Printf("Error copying to client: %s", err)
		}
	} else if targetResponse.ContentLength < 0 {
		// The server didn't supply a content length so we calculate one
		body, err := ioutil.ReadAll(targetResponse.Body)
		if err != nil {
			logger.Printf("Cannot read a body: %v", err)
			return
		}
		writer.Header().Add("Content-Length", strconv.Itoa(int(len(body))))
		writer.WriteHeader(targetResponse.StatusCode)
		if _, err := io.Copy(writer, bytes.NewReader(body)); err != nil {
			logger.Printf("Error copying to client: %s", err)
		}
	}
}
