package tunnels

import (
	"context"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"time"
)

var tunnelsURL = "http://localhost:4040/api/tunnels"

/*
NgrokTunnel holds an individual tunnel info returned by ngrok from /api/tunnels
*/
type NgrokTunnel struct {
	Name      string `json:"name"`
	PublicURL string `json:"public_url"`
	Protocol  string `json:"proto"`
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
func (controller *NgrokController) Start(port int64, protocol string) error {
	if controller.Command != nil {
		return errors.New("Already started")
	}
	controller.Context, controller.CancelFunc = context.WithCancel(context.Background())
	arguments := make([]string, 2)
	arguments[0] = protocol
	arguments[1] = strconv.FormatInt(port, 10)
	controller.Command = exec.CommandContext(controller.Context, "ngrok", arguments...)
	controller.Command.Env = os.Environ()
	go func() {
		controller.Command.Run()
	}()
	return nil
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

/*
WaitForNgrokTunnels return the tunnels list and the page host URL of the HTTPS tunnel
desiredProtocol should be "http", "https", or "tcp"
*/
func (controller *NgrokController) WaitForNgrokTunnels(desiredProtocol string) (*NgrokTunnels, string, error) {
	var ngrokTunnels *NgrokTunnels = nil
	var err error = nil
	tryCount := 0
	for {
		if tryCount > 100 {
			return nil, "", errors.New("Could not read ngrok process")
		}
		tryCount += 1
		// wait for ngrok to start or fail
		time.Sleep(100 * time.Millisecond)
		if controller.Command == nil {
			continue
		}
		if controller.Command.ProcessState != nil {
			return nil, "", errors.New("ngrok process ended")
		}
		ngrokTunnels, err = FetchNgrokTunnels()
		if err != nil || len(ngrokTunnels.Tunnels) == 0 {
			continue
		}
		for _, tunnel := range ngrokTunnels.Tunnels {
			if tunnel.Protocol == desiredProtocol {
				return ngrokTunnels, tunnel.PublicURL, nil
			}
		}
		return nil, "", errors.New("No ngrok tunnel is " + desiredProtocol)
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
