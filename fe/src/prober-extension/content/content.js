function handleRuntimeMessage(data, sender, sendResponse) {
	if(!data.action) {
		console.log('Unknown runtime message', data, sender)
		return
	}
	switch(data.action){
		case 'update-performance':
			console.log('update perf', data)
			break
		default:
			console.log('Unknown runtime message action', data, sender)
	}
}

function handleWindowMessage(event) {
	console.log('Handling window message', event)
}

function initContentScript(){
	if(!chrome){
		console.error('This extension only works in Chrome. :-( ')
		return
	}
	window.addEventListener('message', handleWindowMessage)
	chrome.runtime.onMessage.addListener(handleRuntimeMessage)

	console.log("Prober extension content script loaded")
}

if(!window.welContentScriptLoaded){
	initContentScript()
	window.welContentScriptLoaded = true
} else {
	// don't init this script more than once in a given window
}
