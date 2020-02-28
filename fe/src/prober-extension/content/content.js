/*
This is the script injected by the prober-extension into a hosted formula page
*/

function handleRuntimeMessage(data, sender, sendResponse) {
	if (!data.action) {
		console.error('Unknown runtime message', data, sender)
		return
	}
	switch (data.action) {
		case 'update-performance':
		case 'latest-performance':
		case 'update-heap-memory':
			window.postMessage(data, '*') // This will be caught by prober.js
			break
		case 'background-message':
			console.log('Background message: ' + data.message)
			break
		case 'heap-memory-status':
			console.log('Heap memory status: ' + data.subAction)
			break
		default:
			console.log('Unknown runtime message action: ' + JSON.stringify(data) + ': ' + JSON.stringify(sender))
	}
}

function handleWindowMessage(event) {
	if (!event.data || !event.data.action) {
		return
	}
	switch (event.data.action) {
		case 'relay-to-background':
			event.data.action = 'window-to-background'
			chrome.runtime.sendMessage(event.data)
			break
		//default:
		//	console.log('Unknown window message action in content.js: ' + JSON.stringify(event.data))
	}
}

function initContentScript() {
	if (!chrome) {
		console.error('The prober extension currently only works in Chrome. :-( ')
		return
	}
	chrome.runtime.onMessage.addListener(handleRuntimeMessage)
	window.addEventListener('message', handleWindowMessage)
	console.log('Prober extension content script loaded: ' + document.location.href)
}

// Init this script at most once in a given window
if (!window._welContentScriptLoaded) {
	initContentScript()
	window._welContentScriptLoaded = true
}
