if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

const SomeAction = 'wf-some-action'
const InitAction = 'wf-init'
const RunTestAction = 'wf-run-test'

function handleRuntimeMessage(request, sender, sendResponse) {
	console.log('background handling page runtime message', request, sender, sendResponse)
	if (sender.url === browser.runtime.getURL('/devtools/panel/panel.html')) {
		handlePanelRuntimeMessage(request, sender, sendResponse)
	} else {
		handlePageRuntimeMessage(request, sender, sendResponse)
	}
}
browser.runtime.onMessage.addListener(handleRuntimeMessage)

function handlePageRuntimeMessage(request, sender, sendResponse) {
	if (typeof request.action === undefined) {
		console.error('Unknown page request', request, sender, sendResponse)
		return
	}
	switch (request.action) {
		case SomeAction:
			browser.runtime.sendMessage({
				action: SomeAction
			})
			break
	}
}

function handlePanelRuntimeMessage(request, sender, sendResponse) {
	if (typeof request.action === undefined) {
		console.error('Unknown panel request', request, sender, sendResponse)
		return
	}
	switch (request.action) {
		case SomeAction:
		case RunTestAction:
			relayActionToTab(request)
			break
		case InitAction:
			handleInitAction(request)
			break
		default:
			console.error('unknown action', request)
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
