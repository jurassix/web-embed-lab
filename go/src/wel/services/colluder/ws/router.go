package ws

import (
	"wel/services/colluder/session"
)

func RouteClientMessage(clientMessage ClientMessage, clientUUID string) ([]string, ClientMessage, error) {
	switch clientMessage.MessageType() {
	case PingType:
		ping := clientMessage.(*PingMessage)
		return []string{clientUUID}, NewAckMessage(ping.Message), nil
	case ClientDisconnectedType:
		return nil, nil, nil
	case QuerySessionStateType:
		return []string{clientUUID}, NewSessionStateMessage(), nil
	case ToggleSessionType:
		toggle := clientMessage.(*ToggleSessionMessage)
		if session.CurrentCaptureSession == nil {
			var err error
			session.CurrentCaptureSession, err = session.NewCaptureSession(toggle.Hostname)
			if err != nil {
				logger.Printf("Error toggling on", err)
			}
			return []string{clientUUID}, NewSessionStateMessage(), nil
		} else {
			session.CurrentCaptureSession.Capturing = false
			err := session.CurrentCaptureSession.WriteTimeline()
			if err != nil {
				logger.Printf("Error writing timeline %v", err)
			}
			statusMessage := NewSessionStateMessage()
			session.CurrentCaptureSession = nil
			return []string{clientUUID}, statusMessage, nil
		}
	default:
		logger.Printf("Unknown message type: %s", clientMessage)
		return []string{clientUUID}, NewUnknownMessageTypeMessage(clientMessage.MessageType()), nil
	}
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
