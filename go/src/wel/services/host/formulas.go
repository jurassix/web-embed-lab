package host

import (
	"errors"
	"io/ioutil"
	"net/http"
	"os"
	"path"

	"wel/formulas"
)

type FormulaHost struct {
	FormulasPath   string
	CurrentFormula string
	PageFormulas   map[string]*formulas.PageFormula
}

func NewFormulaHost(formulasPath string) (*FormulaHost, error) {
	formulasStat, err := os.Stat(formulasPath)
	if err != nil {
		return nil, err
	}
	if formulasStat.IsDir() == false {
		return nil, errors.New("Formulas path does not lead to a directory")
	}

	files, err := ioutil.ReadDir(formulasPath)
	if err != nil {
		return nil, err
	}

	host := &FormulaHost{
		FormulasPath:   formulasPath,
		CurrentFormula: "",
		PageFormulas:   map[string]*formulas.PageFormula{},
	}

	for _, file := range files {
		if file.IsDir() == false {
			continue
		}
		infoPath := path.Join(formulasPath, file.Name(), formulas.FormulaInfoFileName)
		infoStat, err := os.Stat(infoPath)
		if err != nil {
			logger.Printf("Found no %v", infoPath)
			continue
		}
		if infoStat.IsDir() {
			logger.Printf("Found a dir at %v", infoPath)
			continue
		}
		infoFile, err := os.Open(infoPath)
		if err != nil {
			logger.Printf("Could not open %v", infoPath)
			continue
		}
		pageFormula, err := formulas.ParsePageFormulaInfo(infoFile)
		if err != nil {
			logger.Printf("Could not parse %v: %v", file.Name(), err)
			continue
		}
		host.PageFormulas[file.Name()] = pageFormula
	}

	logger.Println("Page formulas", host.PageFormulas)

	return host, nil
}

func (host *FormulaHost) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	// TODO
	writer.Write([]byte("Hi there"))
}
