import * as ui from './ui.js'
import Communicator from './Communicator.js'

// Message types for the remote Colluder service
const ColluderMessageTypes = {
	Connected: 'Connected',
	UnknownMessageType: 'Unknown-Message-Type',
	ToggleSession: 'Toggle-Session',
	SessionState: 'Session-State',
	WebSocketOpened: 'WebSocket-Opened',
	WebSocketClosed: 'WebSocket-Closed'
}

/**
The UI component for the entire WebExtension devpanel
*/
class DevpanelComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('devpanel-component')

		this._communicator = new Communicator()
		this._communicator.addListener(Communicator.ReceivedColluderMessageEvent, (eventName, message) => {
			this._handleColluderMessage(message)
		})

		this._controlComponent = new ControlComponent({
			communicator: this._communicator
		}).appendTo(this.el)

		this._stateComponent = new StateComponent({
			communicator: this._communicator
		}).appendTo(this.el)

		this._logComponent = new LogComponent({
			communicator: this._communicator
		}).appendTo(this.el)

		this._communicator.sendInit()
	}

	_handleColluderMessage(message){
		switch(message['type']){
			case ColluderMessageTypes.Connected:
				break
			case ColluderMessageTypes.UnknownMessageType:
				console.error('DevpanelComponent received notice that colluder does not recognize a message', message)
				break
			//default:
			//	console.log('DevpanelComponent received unknown colluder message type', message)
		}
	}
}

class ControlComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('section control-component')

		this._toggleSessionButtonComponent = new ui.ButtonComponent({
			text: 'Toggle Session'
		}).appendTo(this)
		this._toggleSessionButtonComponent.addListener(ui.ButtonComponent.ClickedEvent, (eventName, event, component) => {
			this.options.communicator.sendColluderMessage({
				type: ColluderMessageTypes.ToggleSession
			})
		})
	}
}

class StateComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('section state-component')
		this.options.communicator.addListener(Communicator.ReceivedColluderMessageEvent, this._handleColluderMessage.bind(this))

		this._connectedComponent = new ui.KeyValueComponent({
			key: 'Connected'
		}).appendTo(this)
	}

	_handleColluderMessage(eventName,  message){
		switch(message['type']){
			case ColluderMessageTypes.WebSocketOpened:
				console.log('WS Opened')
				this._connectedComponent.value = 'open'
				break
			case ColluderMessageTypes.WebSocketClosed:
				console.log('WS Closed')
				this._connectedComponent.value = 'closed'
				break
		}
	}
}

class LogComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('section log-component')
	}
}


export default DevpanelComponent
