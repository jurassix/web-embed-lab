import ColluderClient from  './ColluderClient.js'

const InitAction = 'wf-init'
const RunTestAction = 'wf-run-test'

if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

function handleRuntimeMessage(request, sender, sendResponse) {
	console.log('Panel received Runtime message', request, sender, sendResponse)
}
browser.runtime.onMessage.addListener(handleRuntimeMessage)

// Request that the background script insert content.js into the inspected window
browser.runtime.sendMessage({
	action: InitAction,
	tabId: browser.devtools.inspectedWindow.tabId
})

const contextDOM = document.querySelector('.context')
const focusDOM = document.querySelector('.focus')

const runTestButton = document.createElement('button')
contextDOM.appendChild(runTestButton)
runTestButton.innerText = 'Run test'
runTestButton.addEventListener('click', ev => {
	browser.runtime.sendMessage({
		action: RunTestAction,
		tabId: browser.devtools.inspectedWindow.tabId
	})
})

const colluderClient = new ColluderClient('wss://localhost:8082/ws', (...params) =>  {
	console.log('Client message',  ...params)
})

colluderClient.open().then(() => {
	console.log('Client opened')
}).catch((...params) => {
	console.error('Client failed', ...params)
})
