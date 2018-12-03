if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

function handleRuntimeMessage(data, sender, sendResponse) {
	switch (data.action) {
		case window.ContentConstants.RunTestAction:
			console.log('run test here')
			break
		case window.ContentConstants.SomeAction:
			window.postMessage(data, '*')
			break
	}
}

function injectScript(url) {
	const script = document.createElement('script')
	script.setAttribute('src', url)
	document.body.appendChild(script)
}

function handleWindowMessage(event) {
	console.log('content handling window runtime message', event)
	switch (event.data.action) {
		case window.ContentConstants.RunTestAction:
			console.log('Moo')
			break
		case window.ContentConstants.SomeAction:
			browser.runtime.sendMessage({
				action: ContentConstants.PutKSSAction,
				kss: event.data.kss
			})
			break
	}
}

// Prevent redefinition on page change
if (window.ContentConstants === undefined) {
	window.ContentConstants = {
		SomeAction: 'wf-some-action',
		RunTestAction: 'wf-run-test'
	}
	window.addEventListener('message', handleWindowMessage)
	browser.runtime.onMessage.addListener(handleRuntimeMessage)
	injectScript('http://127.0.0.1:8080/test-probes.js')
}
