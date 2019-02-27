package proxy

import (
	"bytes"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"wel/services/colluder/session"
	"wel/services/colluder/ws"
)

func handleHTTP(writer http.ResponseWriter, clientRequest *http.Request, proxyServer *ProxyServer) {
	host := clientRequest.URL.Host
	if !hasPort.MatchString(host) {
		host += ":80"
	}

	if session.CurrentCaptureSession != nil {
		session.CurrentCaptureSession.IncrementHostCount(host)
		defer func() {
			if session.CurrentCaptureSession != nil {
				session.CurrentCaptureSession.DecrementHostCount(host)
			}
		}()
	}

	if broadcastIfPossible(ws.NewProxyConnectionStateMessage(true, host)) {
		defer func() {
			broadcastIfPossible(ws.NewProxyConnectionStateMessage(false, host))
		}()
	}
	broadcastIfPossible(ws.NewProxyConnectionRequestMessage(host))

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

	// If capturing, set up a tee into a capture file
	var bodyReader io.Reader
	var outputFile *os.File = nil
	var outputFileId int = -1
	if targetResponse.ContentLength == 0 || session.CurrentCaptureSession == nil {
		bodyReader = targetResponse.Body
	} else {
		outputFile, outputFileId, err = session.CurrentCaptureSession.OpenCaptureFile()
		if err == nil {
			bodyReader = io.TeeReader(targetResponse.Body, outputFile)
			defer outputFile.Close()
		} else {
			logger.Printf("Could not create an output file %v", err)
			bodyReader = targetResponse.Body
		}
	}

	if session.CurrentCaptureSession != nil {
		session.CurrentCaptureSession.Timeline.AddRequest(
			clientRequest.URL.String(),
			targetResponse.StatusCode,
			targetResponse.Header.Get("Content-Type"),
			targetResponse.Header.Get("Content-Encoding"),
			outputFileId,
		)
	}

	// Set the relayed headers
	for key, values := range targetResponse.Header {
		for _, value := range values {
			writer.Header().Add(key, value)
		}
	}

	if targetResponse.ContentLength > 0 {
		writer.WriteHeader(targetResponse.StatusCode)
		if _, err := io.CopyN(writer, bodyReader, targetResponse.ContentLength); err != nil {
			logger.Printf("Error copying to client: %s", err)
		}
	} else if targetResponse.ContentLength < 0 {
		// The server didn't supply a content length so we calculate one
		body, err := ioutil.ReadAll(bodyReader)
		if err != nil {
			logger.Printf("Cannot read a body: %v", err)
			return
		}
		writer.Header().Add("Content-Length", strconv.Itoa(int(len(body))))
		writer.WriteHeader(targetResponse.StatusCode)
		if _, err := io.Copy(writer, bytes.NewReader(body)); err != nil {
			logger.Printf("Error copying to client: %s", err)
		}
	} else {
		writer.WriteHeader(targetResponse.StatusCode)
	}
}
