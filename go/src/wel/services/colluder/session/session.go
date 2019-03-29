package session

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"path"
	"time"
)

var logger = log.New(os.Stdout, "[session] ", 0)

var CapturesDirPath = "captures"
var CapturesFilesDirName = "files"
var TimelineFileName = "timeline.json"

var CurrentCaptureSession *CaptureSession = nil

/*
HostCount tracks the number of current connections for a host as well as the number of requests made through the connection
*/
type HostCount struct {
	Host     string
	Count    int
	Requests int
}

/*
CaptureSession holds state while the colluder captures information from a browsing session.
*/
type CaptureSession struct {
	Capturing     bool
	DirectoryPath string
	NumRequests   int
	NextFileId    int // A counter used when generating file names
	HostCounts    []*HostCount
	Timeline      *Timeline
}

func NewCaptureSession(hostname string) (*CaptureSession, error) {
	capturePath, err := createCaptureDirectory()
	if err != nil {
		return nil, err
	}
	return &CaptureSession{
		Capturing:     true,
		DirectoryPath: capturePath,
		NumRequests:   0,
		NextFileId:    101, // start at a non-zero number
		HostCounts:    make([]*HostCount, 0),
		Timeline:      NewTimeline(hostname),
	}, nil
}

func (session *CaptureSession) WriteTimeline() error {
	if session.Timeline.Ended == -1 {
		session.Timeline.Ended = time.Now().Unix()
	}
	data, err := session.Timeline.JSON()
	if err != nil {
		return err
	}

	filePath := path.Join(session.DirectoryPath, TimelineFileName)
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()
	file.Write(data)
	logger.Printf("Wrote Timeline: %v", filePath)
	return nil
}

func (session *CaptureSession) GetOrCreateHostCount(host string) (int, *HostCount) {
	for i, hostCount := range session.HostCounts {
		if hostCount.Host == host {
			return i, hostCount
		}
	}
	hostCount := &HostCount{
		host,
		0,
		0,
	}
	session.HostCounts = append(session.HostCounts, hostCount)
	return len(session.HostCounts) - 1, hostCount
}

func (session *CaptureSession) IncrementHostCount(host string) {
	_, hostCount := session.GetOrCreateHostCount(host)
	hostCount.Count = hostCount.Count + 1
}

func (session *CaptureSession) DecrementHostCount(host string) {
	_, hostCount := session.GetOrCreateHostCount(host)
	hostCount.Count = hostCount.Count - 1
}

func (session *CaptureSession) IncrementHostRequests(host string) {
	_, hostCount := session.GetOrCreateHostCount(host)
	hostCount.Requests = hostCount.Requests + 1
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
