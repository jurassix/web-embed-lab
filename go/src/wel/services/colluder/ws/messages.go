package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"wel/services/colluder/session"
)

const DebugLogType = "Debug-Log" // Used during debugging when the client wants something logged on the back end
const PingType = "Ping"
const AckType = "Ack"
const UnknownMessageType = "Unknown-Message-Type"
const ConnectedType = "Connected"
const ClientDisconnectedType = "Client-Disconnected"
const QuerySessionStateType = "Query-Session-State"
const SessionStateType = "Session-State"
const ProxyConnectionStateType = "Proxy-Connection-State"
const ProxyConnectionRequestType = "Proxy-Connection-Request"

const ToggleSessionType = "Toggle-Session"

// All messages passed via WebSocket between the browser and the ws service must be of type ClientMessage
type ClientMessage interface {
	MessageType() string
}

// TypedMessage implements the ClientMessage interface and all other messages include it
type TypedMessage struct {
	Type string `json:"type"`
}

func (message TypedMessage) MessageType() string {
	return message.Type
}

// Ping is a ClientMessage used to test a round trip between the browser and the ws service
type PingMessage struct {
	TypedMessage
	Message string `json:"message"`
}

func NewPingMessage(message string) *PingMessage {
	return &PingMessage{
		TypedMessage{Type: PingType},
		message,
	}
}

// Ack is a ClientMessage used to test a round trip between the browser and the ws service
type AckMessage struct {
	TypedMessage
	Message string `json:"message"`
}

func NewAckMessage(message string) *AckMessage {
	return &AckMessage{
		TypedMessage{Type: AckType},
		message,
	}
}

// Sent when the client first connects to the WebSocket service
type ConnectedMessage struct {
	TypedMessage
	ClientUUID string `json:"clientUUID"`
}

func NewConnectedMessage(clientUUID string) *ConnectedMessage {
	return &ConnectedMessage{
		TypedMessage{Type: ConnectedType},
		clientUUID,
	}
}

type ClientDisconnectedMessage struct {
	TypedMessage
}

func NewClientDisconnectedMessage() *ClientDisconnectedMessage {
	return &ClientDisconnectedMessage{
		TypedMessage{Type: ClientDisconnectedType},
	}
}

// UnknownMessageTypeMessage is sent when an incoming message's type value can not be mapped to a message struct
type UnknownMessageTypeMessage struct {
	TypedMessage
	UnknownType string `json:"unknownType"`
}

func NewUnknownMessageTypeMessage(unknownType string) *UnknownMessageTypeMessage {
	return &UnknownMessageTypeMessage{
		TypedMessage{Type: UnknownMessageType},
		unknownType,
	}
}

// Sent when the formulator asks to toggle session capture
type ToggleSessionMessage struct {
	TypedMessage
}

func NewToggleSessionMessage() *ToggleSessionMessage {
	return &ToggleSessionMessage{
		TypedMessage{Type: ToggleSessionType},
	}
}

// Sent when the proxy opens or closes a connection to a remote service
type ProxyConnectionStateMessage struct {
	TypedMessage
	Open bool
	Host string
}

func NewProxyConnectionStateMessage(open bool, host string) *ProxyConnectionStateMessage {
	return &ProxyConnectionStateMessage{
		TypedMessage{Type: ProxyConnectionStateType},
		open,
		host,
	}
}

// Sent when the proxy handles a client HTTP request inside an open connection
type ProxyConnectionRequestMessage struct {
	TypedMessage
	Host string
}

func NewProxyConnectionRequestMessage(host string) *ProxyConnectionRequestMessage {
	return &ProxyConnectionRequestMessage{
		TypedMessage{Type: ProxyConnectionRequestType},
		host,
	}
}

// Received from clients who want the state of the colluder session
type QuerySessionStateMessage struct {
	TypedMessage
}

func NewQuerySessionStateMessage() *QuerySessionStateMessage {
	return &QuerySessionStateMessage{
		TypedMessage{Type: QuerySessionStateType},
	}
}

// Sent to update the formulator about the state of the capture session
type SessionStateMessage struct {
	TypedMessage
	DirectoryPath string
	Capturing     bool
	NumRequests   int
	HostCounts    []*session.HostCount
}

func NewSessionStateMessage() *SessionStateMessage {
	message := &SessionStateMessage{
		TypedMessage{Type: SessionStateType},
		"",
		false,
		0,
		make([]*session.HostCount, 0),
	}
	if session.CurrentCaptureSession != nil {
		message.DirectoryPath = session.CurrentCaptureSession.DirectoryPath
		message.Capturing = session.CurrentCaptureSession.Capturing
		message.NumRequests = session.CurrentCaptureSession.NumRequests
		message.HostCounts = session.CurrentCaptureSession.HostCounts
	}
	return message
}

// ParseMessageJson takes in a raw string and returns a property typed ClientMessage based on the message.type value
func ParseMessageJson(rawMessage string) (ClientMessage, error) {
	if len(rawMessage) == 0 {
		return nil, errors.New(fmt.Sprintf("Could not parse ws message: %s", rawMessage))
	}
	typedMessage := new(TypedMessage)
	err := json.NewDecoder(strings.NewReader(rawMessage)).Decode(typedMessage)
	if err != nil {
		return nil, err
	}
	var parsedMessage ClientMessage
	switch typedMessage.Type {
	case PingType:
		parsedMessage = new(PingMessage)
	default:
		return typedMessage, nil
	}
	err = json.NewDecoder(strings.NewReader(rawMessage)).Decode(parsedMessage)
	if err != nil {
		return nil, err
	}
	return parsedMessage, nil
}
