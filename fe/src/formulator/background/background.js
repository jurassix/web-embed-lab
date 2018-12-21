if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

/**

Information flows like so:
devpanel <-> background.js <-> content.js <-> target-page-colluder.js 

content.js is where messages to the colluder service are sent and received over WebSockets. Incoming colluder messages are generally relayed to the background.js that relays them to the devpanel's Communicator instance. 

*/

const InitAction = 'wf-init'
const ReceivedColluderMessage = 'wf-received-colluder-message'
const SendColluderMessage = 'wf-send-colluder-message'
const SendWindowMessage = 'wf-send-window-message'

function handleRuntimeMessage(request, sender, sendResponse) {
	if (sender.url === browser.runtime.getURL('/devtools/panel/panel.html')) {
		handlePanelRuntimeMessage(request, sender, sendResponse)
	} else {
		handleTabRuntimeMessage(request, sender, sendResponse)
	}
}
browser.runtime.onMessage.addListener(handleRuntimeMessage)

function handleTabRuntimeMessage(request, sender, sendResponse) {
	if (typeof request.action === undefined) {
		console.error('Unknown tab message format', request, sender, sendResponse)
		return
	}
	switch (request.action) {
		case ReceivedColluderMessage:
			browser.runtime.sendMessage(request)
			break
		default:
			console.error('Background received unknown tab action', request.action, request, sender)
	}
}

function handlePanelRuntimeMessage(request, sender, sendResponse) {
	if (typeof request.action === undefined) {
		console.error('Unknown panel request', request, sender, sendResponse)
		return
	}
	switch (request.action) {
		case SendColluderMessage:
		case SendWindowMessage:
			relayActionToTab(request)
			break
		case InitAction:
			handleInitAction(request)
			break
		default:
			console.error('Background received unknown action from panel', request)
	}
}

function relayActionToTab(request) {
	browser.tabs.sendMessage(request.tabId, request)
}

function handleInitAction(request) {
	browser.tabs.executeScript(request.tabId, {
		file: '/content/content.js'
	})
}

browser.webNavigation.onDOMContentLoaded.addListener(ev => {
	// Request that the background script insert content.js into the inspected window
	handleInitAction({
		tabId: ev.tabId
	})
})
