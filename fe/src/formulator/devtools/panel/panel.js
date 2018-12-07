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

// Message types for the remote Colluder service
const ColluderMessageTypes = {
	Connected: 'Connected',
	UnknownMessageType: 'Unknown-Message-Type',
	ToggleSession: 'ToggleSession'
}

// Listen for messages from the background script
function handleRuntimeMessage(request, sender, sendResponse) {
	if(request.action == undefined){
		console.error('Panel received unknown request format', request)
		return
	}
	switch(request.action){
		case ReceivedColluderMessageAction:
			handleColluderMessage(request.message)
			break
		default:
			console.error('Panel received unknown action:',  request.action, request)
	}
}
browser.runtime.onMessage.addListener(handleRuntimeMessage)

function handleColluderMessage(message){
	if(message['type'] === undefined){
		console.error('Panel received uknown colluder message format:', message)
		return
	}
	switch(message['type']){
		case ColluderMessageTypes.Connected:
			break
		case ColluderMessageTypes.UnknownMessageType:
			console.error('Panel received notice that colluder does not recognize a message', message)
			break
		default:
			console.log('Panel received unknown colluder message type', message)
	}
}

function sendColluderMessage(message){
	browser.runtime.sendMessage({
		action: SendColluderMessage,
		message: message,
		tabId: browser.devtools.inspectedWindow.tabId
	})
}

// Request that the background script insert content.js into the inspected window
browser.runtime.sendMessage({
	action: InitAction,
	tabId: browser.devtools.inspectedWindow.tabId
})

const contextDOM = document.querySelector('.context')
const focusDOM = document.querySelector('.focus')

const toggleSessionButton = document.createElement('button')
contextDOM.appendChild(toggleSessionButton)
toggleSessionButton.innerText = 'Toggle Session'
toggleSessionButton.addEventListener('click', ev => {
	sendColluderMessage({
		type: ColluderMessageTypes.ToggleSession
	})
})
