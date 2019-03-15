package experiments

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

/*
TestProbe holds the indentifier and basis (aka config) for a JS test run in a hosted page formula
*/
type TestProbe struct {
	Name string `json:"name"`
	//ProbeBasis formulas.ProbeBasis
}

type PageFormulaConfiguration struct {
	Name string `json:"name"`
}

/*
Experiment pulls together a set of page formulas, test probes, and browser configurations.

An experiment is handed to the runner process which will:
- host the page formulas
- inject the test probes
- use WebDriver to run tests on specific browsers.
*/
type Experiment struct {
	PageFormulaConfigurations []PageFormulaConfiguration `json:"page-formulas"`
	TestProbes                []TestProbe                `json:"test-probes"`
	BrowserConfigurations     []map[string]string        `json:"browser-configurations"`
}

func NewExperiment() *Experiment {
	return &Experiment{
		PageFormulaConfigurations: make([]PageFormulaConfiguration, 0),
		TestProbes:                make([]TestProbe, 0),
		BrowserConfigurations:     make([]map[string]string, 0),
	}
}

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
