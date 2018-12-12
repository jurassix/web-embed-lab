package session

import (
	"fmt"
	"math/rand"
	"os"
	"path"
	"time"
)

var CapturesDirPath = "captures"
var CapturesFilesDirName = "files"

var CurrentCaptureSession *CaptureSession = nil

/*
CaptureSession holds state while the colluder captures information from a browsing session.
*/
type CaptureSession struct {
	Capturing     bool
	DirectoryPath string
	NumRequests   int
	NextFileId    int // A counter used when generating file names
}

func NewCaptureSession() (*CaptureSession, error) {
	capturePath, err := createCaptureDirectory()
	if err != nil {
		return nil, err
	}
	return &CaptureSession{
		Capturing:     false,
		DirectoryPath: capturePath,
		NumRequests:   0,
		NextFileId:    101, // start at a non-zero number
	}, nil
}

func (session *CaptureSession) OpenCaptureFile() (file *os.File, id int, err error) {
	now := time.Now()
	fileId := session.NextFileId
	session.NextFileId += 1
	fileName := fmt.Sprintf("%X-%X-%d", now.UnixNano(), rand.Int()%(1024*20), fileId)
	filePath := path.Join(session.DirectoryPath, CapturesFilesDirName, fileName)
	file, err = os.Create(filePath)
	return file, fileId, err
}

func createCaptureDirectory() (directoryPath string, err error) {
	now := time.Now()
	formattedDate := fmt.Sprintf("%d-%d-%d-%X", now.Year(), now.Month(), now.Day(), now.Unix())
	directoryPath = path.Join(CapturesDirPath, fmt.Sprintf("%v-%X", formattedDate, rand.Int()%(1024*20)))
	// We go ahead and make the files path to prep for proxy file snapping
	filesPath := path.Join(directoryPath, CapturesFilesDirName)
	err = os.MkdirAll(filesPath, 0777)
	return directoryPath, err
}
