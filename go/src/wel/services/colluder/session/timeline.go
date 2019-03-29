package session

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strings"
	"time"
)

/*
Request holds a record of a request to a remote service for use in a Timeline
*/
type Request struct {
	Timestamp       int64  `json:"timestamp"`
	URL             string `json:"url"`
	StatusCode      int    `json:"status-code"`
	ContentType     string `json:"content-type"`
	ContentEncoding string `json:"content-encoding"`
	OutputFileId    int    `json:"output-file-id"`
}

/*
Timeline holds a time series of Requests made using a CaptureSession
*/
type Timeline struct {
	Started  int64     `json:"started"`
	Ended    int64     `json:"ended"`
	Requests []Request `json:"requests"`
	Hostname string    `json:"hostname"`
}

func NewTimeline(hostname string) *Timeline {
	return &Timeline{
		Started:  time.Now().Unix(),
		Ended:    -1,
		Hostname: hostname,
	}
}

func ParseTimeline(inputFile *os.File) (*Timeline, error) {
	timeline := &Timeline{}
	data, err := ioutil.ReadAll(inputFile)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, timeline)
	if err != nil {
		return nil, err
	}
	return timeline, nil
}

func (timeline *Timeline) AddRequest(requestURL string, statusCode int, contentType string, contentEncoding string, outputFileId int) {
	timeline.Requests = append(timeline.Requests, Request{
		Timestamp:       time.Now().Unix(),
		URL:             requestURL,
		StatusCode:      statusCode,
		ContentType:     contentType,
		ContentEncoding: contentEncoding,
		OutputFileId:    outputFileId,
	})
}

func (timeline *Timeline) FindRequestsByMimetype(mimetype string) []Request {
	results := make([]Request, 0)

	for _, request := range timeline.Requests {
		if strings.HasPrefix(request.ContentType, mimetype) {
			results = append(results, request)
		}
	}

	return results
}

func (timeline *Timeline) JSON() ([]byte, error) {
	return json.Marshal(timeline)
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
