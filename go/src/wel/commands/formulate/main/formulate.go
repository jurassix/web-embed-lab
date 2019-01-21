package main

import (
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"os"
	"path"
	"regexp"
	"strconv"
	"strings"

	"wel/formulas"
	"wel/services/colluder/session"
	"wel/services/host"
)

var logger = log.New(os.Stdout, "[formulate] ", 0)

func main() {
	if len(os.Args) != 3 {
		printHelp()
		return
	}

	// Check that the capture path has the expected files and directories
	capturePath := os.Args[1]
	captureStat, err := os.Stat(capturePath)
	if err != nil {
		logger.Printf("Could not find capture path: \"%v\"", capturePath)
		return
	}
	if captureStat.IsDir() == false {
		logger.Printf("Did not find a capture directory: %v", capturePath)
		return
	}

	timelinePath := path.Join(capturePath, session.TimelineFileName)
	timelineStat, err := os.Stat(timelinePath)
	if err != nil {
		logger.Printf("Could not find timeline: \"%v\"", timelinePath)
		return
	}
	if timelineStat.IsDir() {
		logger.Printf("Found a dir where the timeline should be: \"%v\"", timelinePath)
		return
	}
	timelineFile, err := os.Open(timelinePath)
	if err != nil {
		logger.Printf("Could not open timeline: \"%v\"", timelinePath)
		return
	}
	defer timelineFile.Close()

	timeline, err := session.ParseTimeline(timelineFile)
	if err != nil {
		logger.Printf("Could not parse timeline: \"&v\"", timelinePath)
	}

	htmlRequests := timeline.FindRequestsByMimetype("text/html")
	if len(htmlRequests) == 0 {
		logger.Printf("There were no HTML requests, aborting")
		return
	}

	// Load the files into a map keyed on their ID #s
	filesPath := path.Join(capturePath, session.CapturesFilesDirName)
	filesStat, err := os.Stat(filesPath)
	if err != nil {
		logger.Printf("Could not find files dir: \"%v\"", filesPath)
		return
	}
	if filesStat.IsDir() == false {
		logger.Printf("Did not find a files directory: %v", filesPath)
		return
	}
	fileMap, err := mapFileIDs(filesPath)
	if err != nil {
		logger.Println("Could not map file IDs", err)
		return
	}

	// Set up the destination formula directories
	formulaPath := os.Args[2]
	if os.MkdirAll(formulaPath, 0777) != nil {
		logger.Printf("Could not find or create formula path: \"%v\"", formulaPath)
		return
	}
	formulaInfoPath := path.Join(formulaPath, formulas.FormulaInfoFileName)
	formulaStaticPath := path.Join(formulaPath, formulas.StaticDirName)
	if os.MkdirAll(formulaStaticPath, 0777) != nil {
		logger.Printf("Could not find or create formula static path: \"%v\"", formulaStaticPath)
		return
	}
	formulaTemplatePath := path.Join(formulaPath, formulas.TemplateDirName)
	if os.MkdirAll(formulaTemplatePath, 0777) != nil {
		logger.Printf("Could not find or create formula template path: \"%v\"", formulaTemplatePath)
		return
	}

	formula := formulas.NewPageFormula()

	// Create routes from timeline requests
	createTemplateRoutes(formula, htmlRequests, fileMap, "html", formulaTemplatePath, filesPath)
	createStaticRoutes(formula, timeline.FindRequestsByMimetype("text/css"), fileMap, "css", formulaStaticPath, filesPath)
	createStaticRoutes(formula, timeline.FindRequestsByMimetype("image/"), fileMap, "image", formulaStaticPath, filesPath)
	createStaticRoutes(formula, timeline.FindRequestsByMimetype("application/x-javascript"), fileMap, "js", formulaStaticPath, filesPath)

	// Write the formula info to JSON
	formulaInfo, err := formula.JSON()
	if err != nil {
		logger.Println("Could not marshal formula JSON", err)
		return
	}
	err = ioutil.WriteFile(formulaInfoPath, formulaInfo, 0644)
	if err != nil {
		logger.Println("Could not write formula info", err)
		return
	}
}

func printHelp() {
	logger.Println("usage: formulate <source capture directory> <formula destination directory>")
	logger.Println("Example: formulate ./captures/2018-12-28-5C266D4F-1C03/ ./formulas/spiffy-formula/")
}

func createTemplateRoutes(
	formula *formulas.PageFormula,
	requests []session.Request,
	fileMap map[int]os.FileInfo,
	fileExtension string,
	formulaTemplatePath string,
	filesPath string,
) {
	// Write HTML templates and create their routes
	for _, request := range requests {
		if request.StatusCode != 200 {
			continue
		}

		regex := goRegexpForURL(request.URL)
		if regex == "^/favicon.ico$" {
			continue
		}

		sourceInfo, ok := fileMap[request.OutputFileId]
		if ok != true {
			logger.Println("No such file ID", request.OutputFileId)
			continue
		}

		var templateFileName string
		if len(fileExtension) > 0 {
			templateFileName = fmt.Sprintf("%v.%v", request.OutputFileId, fileExtension)
		} else {
			templateFileName = fmt.Sprintf("%v", request.OutputFileId)
		}
		err := copyFile(
			path.Join(formulaTemplatePath, templateFileName),
			path.Join(filesPath, sourceInfo.Name()),
			request.ContentEncoding,
		)
		if err != nil {
			logger.Println("Could not copy template", err)
			continue
		}

		if fileExtension == "html" {
			err = injectProbes(path.Join(formulaTemplatePath, templateFileName))
			if err != nil {
				logger.Println("Could not inject JS probe", templateFileName, err)
			}
		}

		route := formulas.NewRoute(templateFileName, regex, formulas.TemplateRoute, fmt.Sprintf("/%v/%v", formulas.TemplateDirName, templateFileName))
		logger.Println("Template route", route.Path, templateFileName)
		formula.Routes = append(formula.Routes, *route)
	}
}

/*
Writes a probe script element at the top of the `head` HTML element
*/
func injectProbes(templatePath string) error {
	templateBytes, err := ioutil.ReadFile(templatePath)
	if err != nil {
		return err
	}

	// Find the <head>
	headPattern := regexp.MustCompile(`(<head[^>]*>)`)
	location := headPattern.FindIndex(templateBytes)
	if location == nil {
		return errors.New("No head element was found: " + templatePath)
	}

	newTemplate := fmt.Sprintf(
		"%v\n<script src='%v'></script>\n<script src='%v'></script>\n%v",
		string(templateBytes[0:location[1]]),
		host.ProbesURL,
		host.ProberURL,
		string(templateBytes[location[1]+1:]),
	)

	err = ioutil.WriteFile(templatePath, []byte(newTemplate), 0666)
	if err != nil {
		return err
	}
	return nil
}

func createStaticRoutes(
	formula *formulas.PageFormula,
	requests []session.Request,
	fileMap map[int]os.FileInfo,
	fileExtension string,
	formulaStaticPath string,
	filesPath string,
) {
	for _, request := range requests {
		if request.StatusCode != 200 {
			continue
		}
		sourceInfo, ok := fileMap[request.OutputFileId]
		if ok != true {
			logger.Println("No such file ID", request.OutputFileId)
			continue
		}

		var staticFileName string
		if len(fileExtension) > 0 {
			staticFileName = fmt.Sprintf("%v.%v", request.OutputFileId, fileExtension)
		} else {
			staticFileName = fmt.Sprintf("%v", request.OutputFileId)
		}

		err := copyFile(
			path.Join(formulaStaticPath, staticFileName),
			path.Join(filesPath, sourceInfo.Name()),
			request.ContentEncoding,
		)
		if err != nil {
			logger.Println("Could not copy", err)
			continue
		}
		regex := goRegexpForURL(request.URL)
		route := formulas.NewRoute(staticFileName, regex, formulas.StaticRoute, fmt.Sprintf("/%v/%v", formulas.StaticDirName, staticFileName))
		if len(request.ContentType) > 0 {
			route.Headers["Content-Type"] = request.ContentType
		}
		logger.Println("Static route", route.Path, staticFileName)
		formula.Routes = append(formula.Routes, *route)
	}
}

func goRegexpForURL(url string) string {
	if strings.HasPrefix(url, "http://") {
		url = url[7:]
	} else if strings.HasPrefix(url, "https://") {
		url = url[8:]
	}
	lastIndex := strings.LastIndex(url, "/")
	if lastIndex == -1 {
		return "^/$"
	}
	firstIndex := strings.Index(url, "/")
	if firstIndex == lastIndex {
		return fmt.Sprintf("^%v$", url[lastIndex:])
	}
	url = url[firstIndex:]
	return fmt.Sprintf("^%v$", url)
}

func copyFile(destination string, source string, contentEncoding string) error {
	sourceFile, err := os.Open(source)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destinationFile, err := os.OpenFile(destination, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer destinationFile.Close()

	if contentEncoding == "gzip" {
		gzipReader, err := gzip.NewReader(sourceFile)
		if err != nil {
			return err
		}
		defer gzipReader.Close()
		_, err = io.Copy(destinationFile, gzipReader)
	} else {
		_, err = io.Copy(destinationFile, sourceFile)
	}
	return err
}

func mapFileIDs(filesPath string) (map[int]os.FileInfo, error) {
	fileInfos, err := ioutil.ReadDir(filesPath)
	if err != nil {
		return nil, err
	}
	results := make(map[int]os.FileInfo, 0)
	for _, fileInfo := range fileInfos {
		if fileInfo.IsDir() {
			continue
		}
		id, err := parseIDFromFileName(fileInfo.Name())
		if err != nil {
			logger.Println("Unrecognized file name (no ID)", fileInfo.Name())
			continue
		}
		results[id] = fileInfo
	}
	return results, nil
}

func parseIDFromFileName(name string) (int, error) {
	lastIndex := strings.LastIndex(name, "-")
	if lastIndex == -1 {
		return -1, errors.New(fmt.Sprintf("No dashes in name: %v", name))
	}
	id, err := strconv.ParseInt(name[lastIndex+1:], 10, 32)
	if err != nil {
		return -1, err
	}
	return int(id), nil
}
