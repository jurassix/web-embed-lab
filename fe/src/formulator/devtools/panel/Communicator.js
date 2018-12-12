import { EventHandler } from './EventHandler.js'

if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

// Intra-browser message actions
const InitAction = 'wf-init'
const ReceivedColluderMessageAction = 'wf-received-colluder-message'
const SendColluderMessage = 'wf-send-colluder-message'
const SendWindowMessage = 'wf-send-window-message'

/**
Communicator handles messages between the devpanel and the background script
*/
class Communicator extends EventHandler {
	constructor(){
		super()
		// Listen for messages from the background script
		browser.runtime.onMessage.addListener(this._handleRuntimeMessage.bind(this))
	}

	sendInit(){
		browser.runtime.sendMessage({
			action: InitAction,
			tabId: browser.devtools.inspectedWindow.tabId
		})
	}

	sendColluderMessage(message){
		browser.runtime.sendMessage({
			action: SendColluderMessage,
			message: message,
			tabId: browser.devtools.inspectedWindow.tabId
		})
	}

	sendWindowMessage(message){
		browser.runtime.sendMessage({
			action: SendWindowMessage,
			message: message,
			tabId: browser.devtools.inspectedWindow.tabId
		})
	}

	_handleRuntimeMessage(request, sender, sendResponse) {
		if(request.action == undefined){
			console.error('Communicator received unknown request format', request)
			return
		}
		switch(request.action){
			case ReceivedColluderMessageAction:
				this._handleColluderMessage(request.message)
				break
			default:
				console.error('Communicator received unknown action:',  request.action, request)
		}
	}

	_handleColluderMessage(message){
		if(message['type'] === undefined){
			console.error('Communicator received uknown colluder message format:', message)
			return
		}
		this.trigger(Communicator.ReceivedColluderMessageEvent, message)
	}
}

Communicator.ReceivedColluderMessageEvent = 'communicator-received-colluder-message'
	
export default Communicator
