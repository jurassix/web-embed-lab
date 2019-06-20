function handleTabRuntimeMessage(request, sender, sendResponse) {
	console.log('BG tab runtime message', request, sender, sendResponse)
}

function relayActionToTab(request) {
	chrome.tabs.sendMessage(request.tabId, request)
}

let attachedTabId = null

async function attachDebugger(tabId) {
	return new Promise((resolve, reject) => {
		try {
			if (attachedTabId !== null) {
				resolve(false)
				return
			}
			attachedTabId = tabId
			chrome.debugger.attach({ tabId: tabId }, '1.0', () => {
				if(typeof chrome.runtime.lastError !== 'undefined'){
					attachedTabId = null
					resolve(false, chrome.runtime.lastError)
					return
				}
				resolve(true)
			})
		} catch (e) {
			console.error('Could not attach debugger', e)
			attachedTabId = null
			resolve(false)
		}
	})
}

async function detachDebugger(tabId) {
	return new Promise((resolve, reject) => {
		if (attachedTabId === null || attachedTabId !== tabId) {
			resolve(false)
			return
		}
		attachedTabId = null
		chrome.debugger.detach({ tabId: tabId }, (...args) => {
			if (typeof chrome.runtime.lastError === 'undefined') {
				resolve(true)
				return
			}
			console.error('Error detaching debugger', chrome.runtime.lastError)
			resolve(false, chrome.runtime.lastError)
		})
	})
}

async function sendDebuggerCommand(command, parameters = {}) {
	return new Promise((resolve, reject) => {
		if (attachedTabId === null) {
			reject()
			return
		}
		chrome.debugger.sendCommand({ tabId: attachedTabId }, command, parameters, (...args) => {
			resolve(...args)
		})
	})
}

function waitFor(milliseconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, milliseconds)
	})
}

let samplingMemory = false

async function sampleMemory(milliseconds) {
	if (attachedTabId === null) return null
	if (samplingMemory) {
		console.log('Already sampling memory')
		return null
	}
	samplingMemory = true
	await sendDebuggerCommand('Memory.startSampling')
	await waitFor(milliseconds)
	await sendDebuggerCommand('Memory.stopSampling')
	const samplingProfile = await sendDebuggerCommand('Memory.getSamplingProfile')
	samplingMemory = false
	console.log('samplingProfile', samplingProfile)
	return samplingProfile.profile
}

let performanceEnabled = false

async function enablePerformance() {
	if (attachedTabId === null) return false
	if (performanceEnabled) return true
	performanceEnabled = true
	await sendDebuggerCommand('Performance.enable')
	return true
}

async function disablePerformance() {
	if (attachedTabId === null) return false
	if (performanceEnabled === false) return true
	await sendDebuggerCommand('Performance.disable')
	performanceEnabled = false
	return true
}

async function getPerformanceMetrics(milliseconds) {
	if (performanceEnabled === false) return null
	return await sendDebuggerCommand('Performance.getMetrics')
}

async function getMemoryInfo() {
	if (attachedTabId === null) return null
	const samplingProfile = await sampleMemory(5000) // TODO make this responsive
	return {
		samplingProfile: samplingProfile
	}
}

async function sendPerformanceInfo() {
	if(performanceEnabled === false){
		return
	}
	const perfMetrics = await getPerformanceMetrics()
	chrome.tabs.sendMessage(attachedTabId, {
		action: 'update-performance',
		metrics: perfMetrics.metrics
	})
}

async function sendMemoryInfo() {
	const memoryInfo = await getMemoryInfo()
	if (memoryInfo === null) return false
	chrome.tabs.sendMessage(attachedTabId, {
		action: 'update-memory',
		memory: memoryInfo
	})
	return true
}

const childFrameIds = new Set()

const ignoredEventMethods = new Set([
	'Page.frameResized'
])

async function handleDebuggerEvent(source, method, params) {
	if(ignoredEventMethods.has(method)) return
	if(method === 'Page.frameAttached'){
		// Keep track of attached child frames
		if(params.parentFrameId) {
			childFrameIds.add(params.frameId)
		}
		return
	}
	if(method === 'Page.frameStartedLoading'){
		if(childFrameIds.has(params.frameId)) return
		console.log('enabled performance', source.tabId, params)
		await enablePerformance()
		return
	}
	if (method === 'Inspector.detached') {
		console.log('Debugger detached')
		attachedTabId = null
		performanceEnabled = false
		samplingMemory = false
		return
	}
	if (method === 'Page.frameStoppedLoading') {
		if(childFrameIds.has(params.frameId)){
			return
		}
		await sendPerformanceInfo()
		await disablePerformance()
		console.log('sent performance info', source, method, params)
		return
	}
	console.log('unhandled event:', source.tabId, method, params)
}

function handleRuntimeMessage(request, sender, sendResponse) {
	console.log('BG runtime message', request, sender, sendResponse)
}

async function handleInitAction(request) {
	try {
		chrome.tabs.executeScript(request.tabId, {
			file: '/content/content.js'
		})
	} catch (e) {
		console.error('Could not execute content script', err, request)
		return
	}
	if (window.chrome) {
		try {
			if ((await attachDebugger(request.tabId)) === false) {
				// probably already attached or it's a chrome:// URL
				return
			}
		} catch (e) {
			console.error('Error attaching debugger', e)
			return
		}
		console.log('Attached debugger')
		try {
			await sendDebuggerCommand('Page.enable')
			await sendDebuggerCommand('DOM.enable')
		} catch (e) {
			console.error('Error sending debugger setup commands', e)
		}
	}
}


function initScript(){
	if(!chrome){
		console.error('This script does not work in browsers other than Chrome. :^( ')
		return
	}
	chrome.runtime.onMessage.addListener(handleRuntimeMessage)
	chrome.debugger.onEvent.addListener(handleDebuggerEvent)
	chrome.webNavigation.onDOMContentLoaded.addListener(ev => {
		handleInitAction({
			tabId: ev.tabId
		})
	})
}

try {
	initScript()	
} catch (e) {
	console.error('Could not init background script')
}
