package ws

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

const DebugLogType = "Debug-Log" // Used during debugging when the client wants something logged on the back end
const PingType = "Ping"
const AckType = "Ack"
const UnknownMessageType = "Unknown-Message-Type"
const ConnectedType = "Connected"
const ClientDisconnectedType = "Client-Disconnected"

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
