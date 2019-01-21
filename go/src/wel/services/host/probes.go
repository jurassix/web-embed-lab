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
