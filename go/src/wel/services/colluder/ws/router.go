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
	case ToggleSessionType:
		if session.CurrentCaptureSession == nil {
			var err error
			session.CurrentCaptureSession, err = session.NewCaptureSession()
			if err != nil {
				logger.Printf("Error toggling on", err)
			}
			session.CurrentCaptureSession.Capturing = true
			logger.Printf("Toggling on: %v", session.CurrentCaptureSession.DirectoryPath)
			return []string{clientUUID}, NewSessionStateMessage(session.CurrentCaptureSession), nil
		} else {
			logger.Printf("Toggling off: %v", session.CurrentCaptureSession.DirectoryPath)
			session.CurrentCaptureSession.Capturing = false
			statusMessage := NewSessionStateMessage(session.CurrentCaptureSession)
			session.CurrentCaptureSession = nil
			return []string{clientUUID}, statusMessage, nil
		}
	default:
		logger.Printf("Unknown message type: %s", clientMessage)
		return []string{clientUUID}, NewUnknownMessageTypeMessage(clientMessage.MessageType()), nil
	}
}
