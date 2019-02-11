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
