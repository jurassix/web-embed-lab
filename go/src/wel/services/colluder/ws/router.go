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
		if session.CurrentCaptureSession == nil {
			var err error
			session.CurrentCaptureSession, err = session.NewCaptureSession()
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
