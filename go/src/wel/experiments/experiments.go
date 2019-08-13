package experiments

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

var logger = log.New(os.Stdout, "[proxy] ", 0)

/*
TestProbe holds the name (and eventually configuration data) for a JS test that can be run in a hosted page formula
*/
type TestProbe struct {
	Name string `json:"name"`
	//ProbeBasis formulas.ProbeBasis
}

/*
PageFormulaConfiguration holds a reference (and eventually configuration data) for a page formula
The Name references the name of the directory that holds the formula.json file.
*/
type PageFormulaConfiguration struct {
	Name string `json:"name"`
	//TemplateData
}

/*
TestRun holds references to page formulas and test probes that should be run on a set of browsers
The Experiment holds configurations for everything and the `runner` performs the test runs using those configurations.
*/
type TestRun struct {
	PageFormulas []string `json:"page-formulas"` // Names of page formulas
	TestProbes   []string `json:"test-probes"`   // Names of test probes
	Browsers     []string `json:"browsers"`      // Names of browsers
}

/*
Experiment pulls together a set of page formulas, test probes, and browser configurations.

An experiment is handed to the runner process which will:
- host the page formulas
- inject the test probes
- use WebDriver to perform the test runs
*/
type Experiment struct {
	Name                      string                     `json:"name"`
	PageFormulaConfigurations []PageFormulaConfiguration `json:"page-formulas"`
	TestProbes                []TestProbe                `json:"test-probes"`
	BrowserConfigurations     []map[string]interface{}   `json:"browser-configurations"`
	TestRuns                  []TestRun                  `json:"test-runs"`
}

func NewExperiment() *Experiment {
	return &Experiment{
		Name:                      "",
		PageFormulaConfigurations: []PageFormulaConfiguration{},
		TestProbes:                []TestProbe{},
		BrowserConfigurations:     []map[string]interface{}{},
		TestRuns:                  []TestRun{},
	}
}

func (experiment Experiment) IsRunnable() (bool, string) {
	if len(experiment.TestRuns) == 0 {
		return false, "Experiment has not defined any test-runs"
	}
	for _, testRun := range experiment.TestRuns {
		if len(testRun.PageFormulas) == 0 || len(testRun.TestProbes) == 0 || len(testRun.Browsers) == 0 {
			return false, fmt.Sprintf("Invalid Test Run: %s", testRun)
		}

		for _, browserName := range testRun.Browsers {
			_, ok := experiment.GetBrowserConfiguration(browserName)
			if ok == false {
				return false, fmt.Sprintf("Unknown browser: %s", browserName)
			}
		}

		for _, pageFormulaName := range testRun.PageFormulas {
			_, ok := experiment.GetPageFormulaConfiguration(pageFormulaName)
			if ok == false {
				return false, fmt.Sprintf("Unknown page formula: %s", pageFormulaName)
			}
		}
	}
	return true, ""
}

func (experiment Experiment) GetBrowserConfiguration(name string) (map[string]interface{}, bool) {
	for _, browserConfiguration := range experiment.BrowserConfigurations {
		bcName, ok := browserConfiguration["name"]
		if ok == true && name == bcName {
			return browserConfiguration, true
		}
	}
	return map[string]interface{}{}, false
}

func (experiment Experiment) GetPageFormulaConfiguration(name string) (*PageFormulaConfiguration, bool) {
	for _, configuration := range experiment.PageFormulaConfigurations {
		if name == configuration.Name {
			return &configuration, true
		}
	}
	return nil, false
}

/*
ParseExperiment reads a JSON file and returns an Experiment struct
*/
func ParseExperiment(inputFile *os.File) (*Experiment, error) {
	experiment := NewExperiment()
	data, err := ioutil.ReadAll(inputFile)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, experiment)
	if err != nil {
		return nil, err
	}
	return experiment, nil
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
