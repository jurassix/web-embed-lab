/*
The colluder provides a forward HTTP proxy so that it can sniff traffic and inject collusion JS into target pages.
*/
package proxy

import (
	"bufio"
	"bytes"
	"crypto/tls"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"

	weltls "wel/tls"
)

var (
	hasPort     = regexp.MustCompile(`:\d+$`)
	httpsRegexp = regexp.MustCompile(`^https:\/\/`)
	tlsConfigs  = make(map[string]*tls.Config)
)

// TODO: HANDLE WEBSOCKETS

func hijackConnect(req *http.Request, clientConn net.Conn, proxyServer *ProxyServer) {
	host := req.URL.Host
	if !hasPort.MatchString(host) {
		host += ":80"
	}
	logger.Println("Hijacking", host)

	tlsConfig, ok := tlsConfigs[host]
	if ok == false {
		config, err := weltls.NewTlsConfig(host)
		if err != nil {
			logger.Printf("Could not sign for %v: %v", host, err)
			return
		}
		tlsConfig = config
		tlsConfigs[host] = config
	}

	clientConn.Write([]byte("HTTP/1.0 200 OK\r\n\r\n"))

	// Set up a MITM TLS connection to the client
	rawClientTls := tls.Server(clientConn, tlsConfig)
	if err := rawClientTls.Handshake(); err != nil {
		logger.Printf("Cannot handshake client requesting %v: %v", req.Host, err)
		return
	}
	defer rawClientTls.Close()
	clientTlsReader := bufio.NewReader(rawClientTls)

	// Now loop while handling requests
	for !isEof(clientTlsReader) {
		clientReq, err := http.ReadRequest(clientTlsReader)
		if err != nil {
			logger.Printf("Error reading request %v %v", req.Host, err)
			return
		}
		clientReq.RemoteAddr = req.RemoteAddr
		if !httpsRegexp.MatchString(clientReq.URL.String()) {
			clientReq.URL, err = url.Parse("https://" + req.Host + clientReq.URL.String())
		}

		resp, err := proxyServer.Transport.RoundTrip(clientReq)
		if err != nil {
			logger.Printf("Cannot read TLS response from mitm'd server %v", err)
			return
		}
		defer resp.Body.Close()

		text := resp.Status
		statusCode := strconv.Itoa(resp.StatusCode) + " "
		if strings.HasPrefix(text, statusCode) {
			text = text[len(statusCode):]
		}

		// Send the response prelude to the client
		if _, err := io.WriteString(rawClientTls, fmt.Sprintf("%v %v %v\r\n", resp.Proto, statusCode, text)); err != nil {
			logger.Printf("Cannot write HTTP status: %v", err)
			return
		}
		if err := resp.Header.Write(rawClientTls); err != nil {
			logger.Printf("Cannot write header: %v", err)
			return
		}
		if resp.ContentLength > 0 {
			if _, err := io.WriteString(rawClientTls, fmt.Sprintf("Content-Length: %v\r\n\r\n", resp.ContentLength)); err != nil {
				logger.Printf("Cannot write content length: %v", err)
				return
			}
			if _, err := io.CopyN(rawClientTls, resp.Body, resp.ContentLength); err != nil {
				logger.Printf("Error copying to client: %s", err)
			}
		} else if resp.ContentLength < 0 {
			// The server didn't supply a content length so we calculate one
			body, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				logger.Printf("Cannot read a body: %v", err)
				return
			}
			if _, err := io.WriteString(rawClientTls, fmt.Sprintf("Content-Length: %v\r\n\r\n", len(body))); err != nil {
				logger.Printf("Cannot write derived content length: %v", err)
				return
			}
			if _, err := io.Copy(rawClientTls, bytes.NewReader(body)); err != nil {
				logger.Printf("Error copying to client: %s", err)
			}
		}
	}
	logger.Println("Closing", host)
}
