package formulas

import (
	"encoding/json"
	"io/ioutil"
	"os"
)

/*
Site holds the configuration for a web site to collect, usually as part of a `Capture`
*/
type Site struct {
	Name       string  `json:"name"`
	URL        string  `json:"url"`
	ClosePause float32 `json:"close-pause,omitempty"` // A number of seconds between page load and capture close to give any JS time to work
}

/*
Capture holds the configuration for a browser and a set of sites to capture with the colluder
Usually it's a part of AutoFormulate
*/
type Capture struct {
	BrowserConfiguration map[string]interface{} `json:"browser-configuration"`
	Sites                []Site                 `json:"sites"`
}

/*
Formulation holds the configuration for the conversion of capture data into a page formula
Usually it's a part of AutoFormulate
*/
type Formulation struct {
	CaptureName string `json:"capture-name"`
	FormulaName string `json:"formula-name"`
	// TODO Modifiers
}

/*
AutoFormulate holds configuration info for a run of the `auto-formulate` command line tool
*/
type AutoFormulate struct {
	Captures     []Capture     `json:"captures"`
	Formulations []Formulation `json:"formulations"`
}

func NewAutoFormulate() *AutoFormulate {
	return &AutoFormulate{
		Captures:     []Capture{},
		Formulations: []Formulation{},
	}
}

/*
ParseAutoFormulate reads a JSON file and returns an AutoFormulate struct
*/
func ParseAutoFormulate(inputFile *os.File) (*AutoFormulate, error) {
	autoFormulate := NewAutoFormulate()
	data, err := ioutil.ReadAll(inputFile)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, autoFormulate)
	if err != nil {
		return nil, err
	}
	return autoFormulate, nil
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
