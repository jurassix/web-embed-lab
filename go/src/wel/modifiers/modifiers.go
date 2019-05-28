package modifiers

import (
	"compress/gzip"
	"io/ioutil"
	"log"
	"os"
	"regexp"
)

var logger = log.New(os.Stdout, "[modifiers] ", 0)

var regexpCache = map[string]*regexp.Regexp{}

/*
User the regexpCache to get or create a compiled Regexp
*/
func getRegexp(regex string) (*regexp.Regexp, error) {
	compiledRegexp, ok := regexpCache[regex]
	var err error = nil
	if ok == false {
		compiledRegexp, err = regexp.Compile(regex)
		if err != nil {
			return nil, err
		}
		regexpCache[regex] = compiledRegexp
	}
	return compiledRegexp, nil
}

func replaceFirst(value string, regex *regexp.Regexp, replacement string) string {
	replacedFirst := false
	return string(regex.ReplaceAllFunc([]byte(value), func(input []byte) []byte {
		if replacedFirst {
			return input
		}
		replacedFirst = true
		return regex.ReplaceAll(input, []byte(replacement))
	}))
}

/*
Replacement holds regexp strings to modify data
*/
type Replacement struct {
	Selector    string `json:"selector"`
	Replacement string `json:"replacement,omitempty"`
	All         bool   `json:"all,omitempty"` // if false, replace only the first match
}

/*
Runs the regexp replacements on value
Returns value, nil or "", error if there is a regexp compilation failure
*/
func (replacement Replacement) Replace(value string) (string, error) {
	selectorRegexp, err := getRegexp(replacement.Selector)
	if err != nil {
		return "", err
	}
	if replacement.All {
		return selectorRegexp.ReplaceAllString(value, replacement.Replacement), nil
	} else {
		return replaceFirst(value, selectorRegexp, replacement.Replacement), nil
	}
}

/*
Modifer holds a list of regex filename matchers and Replacements to apply to the file data
*/
type FileModifier struct {
	MimeTypeSelectors []string      `json:"mime-type-selectors"`
	FileNameSelectors []string      `json:"file-name-selectors"`
	Replacements      []Replacement `json:"replacements"`
}

/*
Returns true if any of the Modifier's MimeTypeSelectors matches mimeType
*/
func (modifier *FileModifier) MatchesMimeType(mimeType string) (bool, error) {
	for _, selector := range modifier.MimeTypeSelectors {
		selectorRegex, err := getRegexp(selector)
		if err != nil {
			return false, err
		}
		return selectorRegex.Find([]byte(mimeType)) != nil, nil
	}
	return false, nil
}

/*
Returns true if any of the Modifier's FileNameSelectors matches fileName
*/
func (modifier *FileModifier) MatchesFileName(fileName string) (bool, error) {
	for _, selector := range modifier.FileNameSelectors {
		selectorRegex, err := getRegexp(selector)
		if err != nil {
			return false, err
		}
		return selectorRegex.Find([]byte(fileName)) != nil, nil
	}
	return false, nil
}

func (modifier *FileModifier) ModifyString(contents string) (string, error) {
	var err error = nil
	for _, replacement := range modifier.Replacements {
		contents, err = replacement.Replace(contents)
		if err != nil {
			return "", err
		}
	}
	return contents, nil
}

func (modifier *FileModifier) ModifyFile(fileName string, gzipped bool) error {

	var contents []byte
	var err error

	if gzipped {
		sourceFile, err := os.Open(fileName)
		if err != nil {
			return err
		}
		gzipReader, err := gzip.NewReader(sourceFile)
		if err != nil {
			sourceFile.Close()
			return err
		}
		contents, err = ioutil.ReadAll(gzipReader)
		gzipReader.Close()
		sourceFile.Close()
		if err != nil {
			return err
		}
	} else {
		contents, err = ioutil.ReadFile(fileName)
		if err != nil {
			return err
		}
	}

	modifiedContents, err := modifier.ModifyString(string(contents))
	if err != nil {
		return err
	}

	err = os.Truncate(fileName, 0)
	if err != nil {
		return err
	}

	if gzipped == false {
		return ioutil.WriteFile(fileName, []byte(modifiedContents), 0644)
	}

	file, err := os.OpenFile(fileName, os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	gzipWriter := gzip.NewWriter(file)
	defer func() {
		err = gzipWriter.Close()
		if err != nil {
			logger.Println("Could not close a gzip writer", err)
		}
		file.Close()
	}()
	_, err = gzipWriter.Write([]byte(modifiedContents))
	if err != nil {
		logger.Println("Error writing gzip", err)
		return err
	}
	return nil
}
