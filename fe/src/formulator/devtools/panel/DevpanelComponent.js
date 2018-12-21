import * as ui from './ui.js'
import Communicator from './Communicator.js'

// Message types for the remote Colluder service
const ColluderMessageTypes = {
	Connected: 'Connected',
	UnknownMessageType: 'Unknown-Message-Type',
	ToggleSession: 'Toggle-Session',
	QuerySessionState: 'Query-Session-State',
	SessionState: 'Session-State',
	WebSocketOpened: 'WebSocket-Opened',
	WebSocketClosed: 'WebSocket-Closed',
	ProxyConnectionState: 'Proxy-Connection-State', // the colluder open and closes HTTP forward proxied connections
	ProxyConnectionRequest: 'Proxy-Connection-Request' // the colluder sends when a proxied request is started
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

		this._connectionsComponent = new ConnectionsComponent({
			communicator: this._communicator
		}).appendTo(this.el)

		this._communicator.sendInit()
		this._communicator.sendColluderMessage({
			'type': ColluderMessageTypes.QuerySessionState
		})
	}

	_handleColluderMessage(message){
		switch(message['type']){
			case ColluderMessageTypes.Connected:
				break
			case ColluderMessageTypes.WebSocketOpened:
				this._communicator.sendColluderMessage({
					'type': ColluderMessageTypes.QuerySessionState
				})
				break
			case ColluderMessageTypes.UnknownMessageType:
				console.error('DevpanelComponent received notice that colluder does not recognize a message', message)
				break
			//default:
				//console.log('DevpanelComponent received colluder message type', message)
		}
	}
}

class ControlComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('section control-component')

		this._headingEl = document.createElement('h2')
		this._headingEl.innerText = 'Controls'
		this.el.appendChild(this._headingEl)

		this._toggleSessionButtonComponent = new ui.ButtonComponent({
			text: 'Toggle Capture'
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

		this._headingEl = document.createElement('h2')
		this._headingEl.innerText = 'State'
		this.el.appendChild(this._headingEl)

		this._connectedComponent = new ui.KeyValueComponent({
			key: 'WebSocket'
		}).appendTo(this)

		this._capturingComponent = new ui.KeyValueComponent({
			key: 'Capturing'
		}).appendTo(this)
	}

	_handleColluderMessage(eventName,  message){
		switch(message['type']){
			case ColluderMessageTypes.WebSocketOpened:
				this._connectedComponent.value = 'open'
				break
			case ColluderMessageTypes.WebSocketClosed:
				this._connectedComponent.value = 'closed'
				break
			case ColluderMessageTypes.SessionState:
				this._connectedComponent.value = 'open'
				this._capturingComponent.value = message.Capturing ? 'true' : 'false'
				break
		}
	}
}

class ConnectionsComponent extends ui.Component {
	constructor(options={}){
		super(options)
		this.el.addClass('section connections-component')
		this._connectionComponents = new Map() // host -> ConnectionComponent

		this._headingEl = document.createElement('h2')
		this._headingEl.innerText = 'Connections'
		this.el.appendChild(this._headingEl)

		this._connectionsEl = document.createElement('table')
		this._connectionsEl.setAttribute('class', 'connections-el')
		this.el.appendChild(this._connectionsEl)

		this._tableHeadingsRow = document.createElement('tr')
		this._connectionsEl.appendChild(this._tableHeadingsRow)
		const hostEl = document.createElement('th')
		hostEl.innerText = 'Host'
		this._tableHeadingsRow.appendChild(hostEl)
		const countEl = document.createElement('th')
		countEl.innerText = 'Current'
		this._tableHeadingsRow.appendChild(countEl)
		const requestsEl = document.createElement('th')
		requestsEl.innerText = 'Requests'
		this._tableHeadingsRow.appendChild(requestsEl)

		this.options.communicator.addListener(Communicator.ReceivedColluderMessageEvent, this._handleColluderMessage.bind(this))
	}

	clear(){
		this._connectionsEl.innerHTML = ''
		this._connectionsEl.appendChild(this._tableHeadingsRow)
		this._connectionComponents.clear()
	}

	_getOrCreateConnectionComponent(host){
		let connectionComponent = this._connectionComponents.get(host)
		if(!connectionComponent){
			connectionComponent = new ConnectionComponent({
				host: host,
				count: 0,
				requests: 0
			})
			this._connectionComponents.set(host, connectionComponent)
			this._connectionsEl.appendChild(connectionComponent.el)
		}
		return connectionComponent
	}

	_handleColluderMessage(eventName,  message){
		switch(message['type']){
			case ColluderMessageTypes.WebSocketClosed:
				this.clear()
				break
			case ColluderMessageTypes.SessionState:
				this.clear()
				for(let hostCount of message.HostCounts){
					var connectionComponent = this._getOrCreateConnectionComponent(hostCount.Host)
					connectionComponent.count = hostCount.Count
					connectionComponent.requests = hostCount.Requests
				}
				break
			case ColluderMessageTypes.ProxyConnectionState:
				var connectionComponent = this._getOrCreateConnectionComponent(message.Host)
				if(message.Open){
					connectionComponent.count = connectionComponent.count + 1 
				} else {
					connectionComponent.count = connectionComponent.count - 1
				}
				break
			case ColluderMessageTypes.ProxyConnectionRequest:
				var requestedConnectionComponent = this._getOrCreateConnectionComponent(message.Host)
				requestedConnectionComponent.requests = requestedConnectionComponent.requests + 1
		}
	}
}

class ConnectionComponent extends ui.Component {
	constructor(options={}){
		super(Object.assign({
			el: document.createElement('tr')
		}, options))
		this.el.addClass('connection-component')

		this._count = 0
		this._requests = 0

		this._hostEl = document.createElement('td')
		this._hostEl.setAttribute('class', 'host-el')
		this._hostEl.innerText = options.host + ':' || '---:'
		this.el.appendChild(this._hostEl)

		this._countEl = document.createElement('td')
		this._countEl.setAttribute('class', 'count-el')
		this._countEl.innerText = `${this._count}`
		this.el.appendChild(this._countEl)

		this._requestsEl = document.createElement('td')
		this._requestsEl.setAttribute('class', 'requests-el')
		this._requestsEl.innerText = `${this._requests}`
		this.el.appendChild(this._requestsEl)
	}

	get count(){ return this._count }
	set count(val) {
		this._count = Math.max(0, val)
		this._countEl.innerText = `${this._count}`
	}

	get requests(){ return this._requests }
	set requests(val) {
		this._requests = Math.max(0, val)
		this._requestsEl.innerText = `${this._requests}`
	}
}

export default DevpanelComponent
