package tunnels

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

var tunnelsURL = "http://localhost:4040/api/tunnels"

/*
TunnelConf the port and protocol used when writing ngrok config files
*/
type TunnelConfig struct {
	Port     int64  // the local destination port
	Protocol string // "http" | "tcp"
}

/*
NgrokTunnel holds an individual tunnel info returned by ngrok from /api/tunnels
*/
type NgrokTunnel struct {
	Name      string                 `json:"name"`
	PublicURL string                 `json:"public_url"`
	Protocol  string                 `json:"proto"`
	Config    map[string]interface{} `json:config`
}

func (tunnel *NgrokTunnel) LocalPort() int64 {
	address, ok := tunnel.Config["addr"]
	if ok == false {
		logger.Println("Could not read ngrok config address", tunnel)
		return -1
	}
	tokens := strings.Split(address.(string), ":")
	if len(tokens) != 3 {
		logger.Println("Could not parse ngrok config address", tokens)
		return -1
	}
	result, err := strconv.ParseInt(tokens[2], 10, 64)
	if err != nil {
		logger.Println("Could not parse ngrok port", tokens)
		return -1
	}
	return result
}

/*
NgrokTunnels holds data returned by ngrok from /api/tunnels
*/
type NgrokTunnels struct {
	Tunnels []NgrokTunnel `json:"tunnels"`
}

func ParseNgrokTunnels(data []byte) (*NgrokTunnels, error) {
	tunnels := &NgrokTunnels{}
	err := json.Unmarshal(data, tunnels)
	if err != nil {
		return nil, err
	}
	return tunnels, nil
}

/*
FetchNgrokTunnels attempts to GET and parse NgrokTunnels from /api/tunnels
*/
func FetchNgrokTunnels() (*NgrokTunnels, error) {
	res, err := http.Get(tunnelsURL)
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	res.Body.Close()
	return ParseNgrokTunnels(body)
}

/*
NGrokController runs the [ngrok](https://ngrok.com/) command line tool in a separate process.
ngrok provides a public HTTPS endpoint with valid certificates that tunnels to a local port.
*/
type NgrokController struct {
	Command    *exec.Cmd
	Context    context.Context
	CancelFunc context.CancelFunc
	Stdout     bytes.Buffer
	Stderr     bytes.Buffer
}

func NewNgrokController() *NgrokController {
	return &NgrokController{
		Command: nil,
		Context: nil,
	}
}

/*
Start will spin off an ngrok process and return without blocking
If the controller has already started and has not been stopped it will return an error
protocol should be "http" or "tcp"
*/
func (controller *NgrokController) Start(port int64, protocol string, authToken string) error {
	return controller.StartAll([]TunnelConfig{
		{
			Port:     port,
			Protocol: protocol,
		},
	}, authToken)
}

func (controller *NgrokController) StartAll(tunnelConfigs []TunnelConfig, authToken string) error {
	if controller.Command != nil {
		return errors.New("Already started")
	}
	path, err := controller.writeConf(tunnelConfigs, authToken)
	if err != nil {
		return err
	}

	controller.Context, controller.CancelFunc = context.WithCancel(context.Background())
	arguments := []string{
		"start",
		"--all",
		"--config",
		fmt.Sprintf("%v", path),
	}
	controller.Command = exec.CommandContext(controller.Context, "ngrok", arguments...)
	controller.Command.Env = os.Environ()
	controller.Stdout = bytes.Buffer{}
	controller.Command.Stdout = &controller.Stdout
	controller.Stderr = bytes.Buffer{}
	controller.Command.Stderr = &controller.Stderr
	go func() {
		controller.Command.Run()
	}()
	return nil
}

/*
Returns (path-to-temp-config-file, error)
*/
func (controller *NgrokController) writeConf(tunnelConfigs []TunnelConfig, authToken string) (string, error) {
	if len(tunnelConfigs) == 0 {
		return "", errors.New("No tunnels defined")
	}
	var config strings.Builder
	config.WriteString(fmt.Sprintf("authtoken: %s\n", authToken))
	config.WriteString("tunnels:\n")
	for index, tunnelConfig := range tunnelConfigs {
		config.WriteString(fmt.Sprintf("  web%d:\n", index))
		config.WriteString(fmt.Sprintf("    proto: %s\n", tunnelConfig.Protocol))
		config.WriteString(fmt.Sprintf("    addr: %d\n", tunnelConfig.Port))
	}

	tmpFile, err := ioutil.TempFile(os.TempDir(), "ngrok-conf-")
	var name = tmpFile.Name()
	if err != nil {
		return "", err
	}
	if _, err = tmpFile.Write([]byte(config.String())); err != nil {
		return "", err
	}
	tmpFile.Close()
	return name, nil
}

/*
Stop will ask to kill the ngrok process.
It will silently do nothing if Start has not been called or Stop has already been called.
*/
func (controller NgrokController) Stop() {
	if controller.Context == nil {
		return
	}
	controller.CancelFunc()
	controller.Context = nil
	controller.Command = nil
}

func (controller *NgrokController) WaitForFirstNgrokTunnel(desiredProtocol string) (*NgrokTunnel, error) {
	ngrokTunnels, err := controller.WaitForNgrokTunnels(desiredProtocol, 1)
	if err != nil {
		logger.Println("Error", err)
		return nil, err
	}
	for _, tunnel := range ngrokTunnels.Tunnels {
		if tunnel.Protocol == desiredProtocol {
			return &tunnel, nil
		}
	}
	return nil, errors.New("Did not find desired tunnel")
}

/*
WaitForNgrokTunnels return the tunnels list and the page host URL of the HTTPS tunnel
desiredProtocol should be "http", "https", or "tcp"
*/
func (controller *NgrokController) WaitForNgrokTunnels(desiredProtocol string, desiredCount int) (*NgrokTunnels, error) {
	var ngrokTunnels *NgrokTunnels = nil
	var err error = nil
	tryCount := 0
	for {
		if tryCount > 100 {
			return nil, errors.New("Could not find ngrok tunnels. Maybe try `killall ngrok`?")
		}
		tryCount += 1
		// wait for ngrok to start or fail
		time.Sleep(100 * time.Millisecond)
		if controller.Command == nil {
			continue
		}
		if controller.Command.ProcessState != nil {
			logger.Println("ngrok stdout", controller.Stdout.String())
			logger.Println("ngrok stderr", controller.Stderr.String())
			return nil, errors.New("ngrok process ended")
		}
		ngrokTunnels, err = FetchNgrokTunnels()
		if err != nil || len(ngrokTunnels.Tunnels) < desiredCount {
			continue
		}
		count := 0
		for _, tunnel := range ngrokTunnels.Tunnels {
			if tunnel.Protocol == desiredProtocol {
				count += 1
			}
		}
		if count >= desiredCount {
			return ngrokTunnels, nil
		}
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
