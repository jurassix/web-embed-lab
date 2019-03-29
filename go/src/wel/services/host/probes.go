package host

import (
	"errors"
	"io/ioutil"
	"os"
	"path"
	"strings"
)

var ProbeJSFileName = "test.js"

func GenerateProbesScript(probesPath string) (string, error) {
	probesStat, err := os.Stat(probesPath)
	if err != nil {
		return "", err
	}
	if probesStat.IsDir() == false {
		return "", errors.New("Probes path does not lead to a directory")
	}

	probeScripts := []string{"\nwindow.__welProbes = {}\n"}

	files, err := ioutil.ReadDir(probesPath)
	if err != nil {
		return "", err
	}

	for _, file := range files {
		if file.IsDir() == false {
			continue
		}
		jsPath := path.Join(probesPath, file.Name(), ProbeJSFileName)
		jsStat, err := os.Stat(jsPath)
		if err != nil {
			logger.Printf("Found no %v", jsPath)
			continue
		}
		if jsStat.IsDir() {
			logger.Printf("Found a dir at %v", jsPath)
			continue
		}
		js, err := ioutil.ReadFile(jsPath)
		if err != nil {
			logger.Printf("Could not read %v", jsPath)
			continue
		}
		probeScripts = append(probeScripts, string(js))
	}

	return strings.Join(probeScripts, "\n\n"), nil
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
