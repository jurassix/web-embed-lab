package host

import (
	"errors"
	"html/template"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"regexp"

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

	var firstName = ""

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
		defer func() {
			infoFile.Close()
		}()
		pageFormula, err := formulas.ParsePageFormulaInfo(infoFile)
		if err != nil {
			logger.Printf("Could not parse %v: %v", file.Name(), err)
			continue
		}
		host.PageFormulas[file.Name()] = pageFormula
		if firstName == "" {
			firstName = file.Name()
		}
	}

	if len(host.PageFormulas) == 0 {
		return nil, errors.New("Read no page formulas")
	}
	host.CurrentFormula = firstName

	return host, nil
}

func (host *FormulaHost) MatchRoute(path string) *formulas.Route {
	if host.CurrentFormula == "" {
		return nil
	}
	for _, route := range host.PageFormulas[host.CurrentFormula].Routes {
		matched, err := regexp.MatchString(route.Path, path)
		if err != nil {
			logger.Printf("Error in regexp \"%v\": %v", route.Path, err)
			return nil
		}
		if matched {
			return &route
		}
	}
	return nil
}

func (host *FormulaHost) ServeHTTP(writer http.ResponseWriter, request *http.Request) {
	route := host.MatchRoute(request.URL.Path)
	if route == nil {
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("No route"))
		return
	}
	switch route.Type {
	case formulas.TemplateRoute:
		host.handleTemplateRoute(route, writer, request)
	default:
		logger.Println("Unknown route", route.Type)
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("Unknown route"))
	}
}

func (host *FormulaHost) handleTemplateRoute(route *formulas.Route, writer http.ResponseWriter, request *http.Request) {
	routeTemplate, err := template.ParseFiles(path.Join(host.FormulasPath, host.CurrentFormula, "template", route.Value))
	if err != nil {
		logger.Println("Template error", err)
		writer.WriteHeader(http.StatusInternalServerError)
		writer.Write([]byte("Template error"))
		return
	}
	err = routeTemplate.Execute(writer, route.Parameters)
	if err != nil {
		logger.Println("Template execution error", err)
	}
}
