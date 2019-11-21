package host

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"regexp"
	"strings"
	"text/template"

	"wel/formulas"
)

type FormulaHost struct {
	FormulasPath   string
	CurrentFormula string
	PageFormulas   map[string]*formulas.PageFormula
	HeadSnippet    string
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
		HeadSnippet:    "<!-- Empty Head Snippet -->",
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

func (host *FormulaHost) SetCurrentFormula(name string) bool {
	for formulaName := range host.PageFormulas {
		if name == formulaName {
			host.CurrentFormula = formulaName
			return true
		}
	}
	return false
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
		if strings.HasPrefix(request.URL.Path, fmt.Sprintf("/%v/", formulas.StaticDirName)) && strings.Contains(request.URL.Path, "..") == false {
			host.handleStaticRequest(writer, request)
			return
		}

		if request.URL.Path == "/manifest.json" {
			writer.WriteHeader(http.StatusOK)
			writer.Write([]byte("{}"))
			return
		}

		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte(fmt.Sprintf(`
<html>
	<body>
		<h1>No route: %v</h1>
		You might try the <a href="%v">initial path</a>.
	</body>
</html>`, request.URL.Path, host.PageFormulas[host.CurrentFormula].InitialPath)))

		return
	}
	switch route.Type {
	case formulas.TemplateRoute:
		host.handleTemplateRoute(route, writer, request)
	case formulas.StaticRoute:
		host.handleStaticRoute(route, writer, request)
	default:
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte(fmt.Sprintf("Unknown route type: %v", request.URL.Path)))
	}
}

func (host *FormulaHost) handleStaticRequest(writer http.ResponseWriter, request *http.Request) {
	blob, blobStat, err := host.openBlob(request.URL.Path)
	if err != nil {
		logger.Println("No static blob", request.URL.Path, err)
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("Blob error"))
		return
	}
	defer func() {
		blob.Close()
	}()

	writer.WriteHeader(http.StatusOK)
	if _, err := io.CopyN(writer, blob, blobStat.Size()); err != nil {
		logger.Printf("Error writing blob: %s", err)
	}
}

func (host *FormulaHost) handleStaticRoute(route *formulas.Route, writer http.ResponseWriter, request *http.Request) {
	blob, blobStat, err := host.openBlob(route.Value)
	if err != nil {
		//logger.Println("No routed static blob", route.Value, err)
		writer.WriteHeader(http.StatusNotFound)
		writer.Write([]byte("Blob error"))
		return
	}
	defer func() {
		blob.Close()
	}()

	for key, value := range route.Headers {
		writer.Header().Add(key, value)
	}
	writer.WriteHeader(http.StatusOK)

	if _, err := io.CopyN(writer, blob, blobStat.Size()); err != nil {
		logger.Printf("Error writing blob: %s", err)
	}
}

func (host *FormulaHost) handleTemplateRoute(route *formulas.Route, writer http.ResponseWriter, request *http.Request) {
	// We change the delimiters because so many web frameworks use the default {{ }}.
	templatePath := path.Join(host.FormulasPath, host.CurrentFormula, route.Value)
	routeTemplate, err := template.New(path.Base(templatePath)).Delims("[![", "]!]").ParseFiles(templatePath)
	if err != nil {
		logger.Println("Template error", err)
		writer.WriteHeader(http.StatusInternalServerError)
		writer.Write([]byte("Template error"))
		return
	}

	// Set up the context by merging the route template data and the formula template data
	context := map[string]string{}
	context["head_snippet"] = host.HeadSnippet
	for k, v := range host.PageFormulas[host.CurrentFormula].TemplateData {
		context[k] = v
	}
	for k, v := range route.Parameters {
		context[k] = v
	}

	err = routeTemplate.Execute(writer, context)
	if err != nil {
		logger.Println("Template execution error", err)
		writer.Write([]byte("Template failure"))
	}
}

func (host *FormulaHost) openBlob(pathValue string) (*os.File, os.FileInfo, error) {
	blobPath := path.Join(host.FormulasPath, host.CurrentFormula, pathValue)
	blobStat, err := os.Stat(blobPath)
	if err != nil {
		return nil, nil, err
	}
	if blobStat.IsDir() {
		return nil, nil, errors.New("Unexpectedly found a directory")
	}
	blob, err := os.Open(blobPath)
	if err != nil {
		return nil, nil, err
	}
	return blob, blobStat, nil
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
