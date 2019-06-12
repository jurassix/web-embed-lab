if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		window.browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

function handleRuntimeMessage(data, sender, sendResponse) {
	console.log('Handling runtime message', data, sender, sendResponse)
}

function handleWindowMessage(event) {
	console.log('Handling window message', event)
}

window.addEventListener('message', handleWindowMessage)
browser.runtime.onMessage.addListener(handleRuntimeMessage)

console.log("Prober extension content script loaded")
