/*
This is the script injected by the prober-extension into a hosted formula page
*/

function handleRuntimeMessage(data, sender, sendResponse) {
	if(!data.action) {
		console.error('Unknown runtime message', data, sender)
		return
	}
	switch(data.action){
		case 'update-performance':
		case 'update-heap-memory':
			window.postMessage(data, '*')
			break
		default:
			console.error('Unknown runtime message action: ' + JSON.stringify(data) + ': ' + JSON.stringify(sender))
	}
}

function initContentScript(){
	if(!chrome){
		console.error('The prober extension currently only works in Chrome. :-( ')
		return
	}
	chrome.runtime.onMessage.addListener(handleRuntimeMessage)
	console.log("Prober extension content script loaded")
}

// Init this script at most once in a given window
if(!window._welContentScriptLoaded){
	initContentScript()
	window._welContentScriptLoaded = true
}
