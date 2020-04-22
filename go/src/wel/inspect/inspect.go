package inspect

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	"github.com/logrusorgru/aurora"
	"github.com/sclevine/agouti"

	"net/url"
)

var logger = log.New(os.Stdout, "[baseline] ", 0)

type Config struct {
	BrowserstackURL    string
	BrowserstackUser   string
	BrowserstackAPIKey string
	FrontEndDistPath   string
	TargetURL          *url.URL
}

type PerformanceData struct {
	Action  string                   `json:action`
	Metrics []map[string]interface{} `json:metrics`
}

func (data PerformanceData) Print() {
	logger.Println("Action:", data.Action)
	for _, metric := range data.Metrics {
		name, nameOk := metric["name"]
		value, valueOk := metric["value"]
		if nameOk == false || valueOk == false {
			logger.Println("Badly formed metric", metric)
			continue
		}
		logger.Println(name, ":", value)
	}
}

func ParsePerformanceData(rawJSON []byte) (*PerformanceData, error) {
	data := PerformanceData{}
	err := json.Unmarshal(rawJSON, data)
	if err != nil {
		return nil, err
	}
	return &data, nil
}

type ScriptResult struct {
	Success         bool             `json:success`
	PerformanceData *PerformanceData `json:performanceData`
}

func GatherPerformanceData(config *Config) (*PerformanceData, error) {
	page, err := openPage(config)
	if err != nil {
		return nil, err
	}
	defer page.Destroy() // Close the WebDriver session

	// Warm up the WebExtension
	err = page.Navigate("https://github.com/fullstorydev/web-embed-lab/")
	if err != nil {
		return nil, err
	}

	// Load the target page
	err = page.Navigate(config.TargetURL.String())
	if err != nil {
		return nil, err
	}
	time.Sleep(5 * time.Second)

	var returnValue string
	page.RunAsyncScript(TestScript, &returnValue)

	scriptResult := ScriptResult{}
	err = json.Unmarshal([]byte(returnValue), &scriptResult)
	if err != nil {
		return nil, err
	}

	return scriptResult.PerformanceData, nil
}

/*
openPage opens a WebDriver connection to Chrome
Returns (page, error)
*/
func openPage(config *Config) (*agouti.Page, error) {
	// Load the prober-extension
	extensionPath := config.FrontEndDistPath + "prober-extension/prober-extension.xpi"
	crxBytes, err := ioutil.ReadFile(extensionPath)
	if err != nil {
		logger.Println(aurora.Red(fmt.Sprintf("Error reading extension (%v): %v", extensionPath, err)))
		return nil, err
	}

	capabilities := agouti.NewCapabilities()
	capabilities["browserstack.user"] = config.BrowserstackUser
	capabilities["browserstack.key"] = config.BrowserstackAPIKey
	capabilities["browserstack.console"] = "verbose"
	capabilities["browserstack.seleniumLogs"] = "true"
	capabilities["chromeOptions"] = map[string][][]byte{
		"extensions": {crxBytes},
	}

	capabilities["name"] = "WEL inspect: " + config.TargetURL.String()
	// Inspect always uses the latest Chrome
	capabilities["os"] = "Windows"
	capabilities["osVersion"] = "10"
	capabilities["browserName"] = "Chrome"
	capabilities["resolution"] = "1024x768"
	capabilities["browserstack.console"] = "verbose"

	page, err := agouti.NewPage(config.BrowserstackURL, []agouti.Option{agouti.Desired(capabilities)}...)
	if err != nil {
		return nil, err
	}

	return page, nil
}
