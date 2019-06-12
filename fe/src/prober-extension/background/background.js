if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		window.browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

function handleRuntimeMessage(request, sender, sendResponse) {
	console.log('BG runtime message', request, sender, sendResponse)
}
browser.runtime.onMessage.addListener(handleRuntimeMessage)

function handleTabRuntimeMessage(request, sender, sendResponse) {
	console.log('BG tab runtime message', request, sender, sendResponse)
}

function relayActionToTab(request) {
	browser.tabs.sendMessage(request.tabId, request)
}

async function getMemoryInfo(tabId){
	console.log('Getting memory info', chrome.debugger)
	return new Promise((resolve, reject) => {
		chrome.debugger.attach(
			{ tabId: tabId },
			"1.0",
			(...args) => {
				console.log('debugger attached', ...args)
				chrome.debugger.detach({ tabId: tabId }, () => {
					console.log('debugger detached')
				})
				resolve({
					moo: 'Moooo'
				})

				/*
				THIS IS WHERE I STOPPED. PURGING MEMORY BREAKS THE WORLD
				chrome.debugger.sendCommand(
					{ tabId: tabId },
					'Memory.forciblyPurgeJavaScriptMemory',
					null,
					(...params) => {
						console.log('Purged', ...params)
						resolve({

						})
						chrome.debugger.detach({ tabId: tabId }, () => {
							console.log('detached')
						})
					}
				)
				*/
			}
		)
	})
}

async function sendMemoryInfo(request){
	const memoryInfo = await getMemoryInfo(request.tabId)
	browser.tabs.sendMessage(request.tabId, {
		action: 'update-memory',
		memory: memoryInfo
	})
}

function handleInitAction(request) {
	console.log('Prober extension background init')
	browser.tabs.executeScript(request.tabId, {
		file: '/content/content.js'
	})
	if(window.chrome){
		setTimeout(() => { sendMemoryInfo(request) }, 500)
	}
}

browser.webNavigation.onDOMContentLoaded.addListener(ev => {
	handleInitAction({
		tabId: ev.tabId
	})
})
