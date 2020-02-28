let attachedTabId = null

const EmbedScriptPath = '/__wel_embed.js'

let latestPerfData = null

// The handler for messages from the content.js script
function handleRuntimeMessage(data, sender, sendResponse) {
	if (!data.action) {
		console.log('Unknown runtime message', data, sender)
		return
	}
	switch (data.action) {
		case 'window-to-background':
			if (data.subAction === 'snapshot-heap') {
				sendHeapSnapshotInfo('window-request')
			} else if (data.subAction === 'request-performance') {
				chrome.tabs.sendMessage(attachedTabId, {
					action: 'latest-performance',
					metrics: latestPerfData
				})
			} else {
				console.error('Unknown sub-action on runtime message: ' + JSON.stringify(data))
			}
			break
		default:
			console.error('Unknown runtime action', data)
	}
}

async function attachDebugger(tabId) {
	return new Promise((resolve, reject) => {
		try {
			if (attachedTabId !== null) {
				resolve(false)
				return
			}
			attachedTabId = tabId
			chrome.debugger.attach({ tabId: tabId }, '1.0', () => {
				if (typeof chrome.runtime.lastError !== 'undefined') {
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
			if (typeof chrome.runtime.lastError === 'undefined') {
				resolve(...args)
			} else {
				console.error('Debugger last error: ', chrome.runtime.lastError)
				reject(chrome.runtime.lastError)
			}
		})
	})
}

function waitFor(milliseconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, milliseconds)
	})
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

async function getPerformanceMetrics() {
	if (performanceEnabled === false) return null
	return await sendDebuggerCommand('Performance.getMetrics')
}

async function sendPerformanceInfo(subAction) {
	if (performanceEnabled == true) {
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'background-message',
			message: 'Performance enabled: ' + subAction
		})
	} else {
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'background-message',
			message: 'Performance disabled: ' + subAction
		})
	}

	if (performanceEnabled === false) {
		return
	}
	const perfMetrics = await getPerformanceMetrics()
	chrome.tabs.sendMessage(attachedTabId, {
		action: 'update-performance',
		subAction: subAction,
		metrics: perfMetrics.metrics
	})
	latestPerfData = perfMetrics.metrics
}

async function sendHeapSnapshotInfo(subAction) {
	try {
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'heap-memory-status',
			subAction: 'starting'
		})

		// Try to clear out memory and GC a bit to create less variance in size (requires Chrome 75+)
		await sendDebuggerCommand('Memory.simulatePressureNotification', { level: 'critical' })
		await sendDebuggerCommand('HeapProfiler.collectGarbage')
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'heap-memory-status',
			subAction: 'cleared'
		})

		/*
		const result = await sendDebuggerCommand('HeapProfiler.takeHeapSnapshot', { reportProgress: false })
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'heap-memory-status',
			subAction: 'took-snapshot'
		})
		*/

		console.log('sampling')

		sendDebuggerCommand('HeapProfiler.getSamplingProfile')
			.then(samplingProfile => {
				console.log('sampled', samplingProfile)
				chrome.tabs.sendMessage(attachedTabId, {
					action: 'heap-memory-status',
					subAction: 'sampled'
				})

				const embedScriptMemory = calculateEmbedScriptMemory(samplingProfile.profile.head)
				const sampleTotalMemory = sumHeapSamplesSizes(samplingProfile.profile.samples)
				chrome.tabs.sendMessage(attachedTabId, {
					action: 'update-heap-memory',
					subAction: subAction,
					embedScriptMemory: embedScriptMemory,
					sampleTotalMemory: sampleTotalMemory
				})
			})
			.catch(e => {
				console.error('Error snapshotting 1', e)
				chrome.tabs.sendMessage(attachedTabId, {
					action: 'heap-snapshot-error',
					error: '' + e
				})
			})
	} catch (e) {
		console.error('Error snapshotting 2', e)
		chrome.tabs.sendMessage(attachedTabId, {
			action: 'heap-snapshot-error',
			error: '' + e
		})
	}
}

function calculateEmbedScriptMemory(frame) {
	let total = 0
	if (frame.callFrame.url.endsWith(EmbedScriptPath)) {
		total += frame.selfSize
	}
	if (!frame.children) return
	for (let i = 0; i < frame.children.length; i++) {
		total += calculateEmbedScriptMemory(frame.children[i])
	}
	return total
}

function logCallFrames(frame, depth = 0) {
	const prefix = ''
	for (let i = 0; i < depth; i++) {
		prefix + '\t'
	}
	console.log(prefix + frame.callFrame.url)
	if (!frame.children) return
	for (let i = 0; i < frame.children.length; i++) {
		logCallFrames(frame.children[i], depth + 1)
	}
}

function sumHeapSamplesSizes(samples) {
	let size = 0
	for (let i = 0; i < samples.length; i++) {
		size += samples[i].size
	}
	return size
}

const childFrameIds = new Set()

const ignoredEventMethods = new Set([
	'DOM.documentUpdated',
	'Debugger.scriptParsed',
	'HeapProfiler.addHeapSnapshotChunk',
	'HeapProfiler.lastSeenObjectId',
	'HeapProfiler.heapStatsUpdate',
	'HeapProfiler.reportHeapSnapshotProgress',
	'Page.frameClearedScheduledNavigation',
	'Page.frameResized',
	'Page.frameScheduledNavigation',
	'Page.frameRequestedNavigation',
	'Page.navigatedWithinDocument',
	'Page.frameDetached',
	'Page.frameNavigated'
])

async function handleDebuggerEvent(source, method, params) {
	if (ignoredEventMethods.has(method)) return

	if (method === 'Inspector.detached') {
		attachedTabId = null
		performanceEnabled = false
		return
	}
	if (method === 'Page.frameAttached') {
		// Keep track of attached child frames
		if (params.parentFrameId) {
			childFrameIds.add(params.frameId)
			return
		}
		return
	}
	if (method === 'Page.frameStartedLoading') {
		if (childFrameIds.has(params.frameId)) return
		await sendDebuggerCommand('HeapProfiler.startTrackingHeapObjects')
		await enablePerformance()
		await sendPerformanceInfo('frame-started-loading')
		return
	}
	if (method === 'Page.frameStoppedLoading') {
		if (childFrameIds.has(params.frameId)) return

		await sendPerformanceInfo('frame-stopped-loading')
		await disablePerformance()

		return
	}
	if (method === 'Page.domContentEventFired') {
		await sendPerformanceInfo('dom-content')
		return
	}
	if (method === 'Page.loadEventFired') {
		await sendPerformanceInfo('load')
		return
	}

	console.log('unhandled event:', source.tabId, method, params)
}

async function handleInitAction(tabId) {
	try {
		chrome.tabs.executeScript(tabId, {
			file: '/content/content.js'
		})
	} catch (e) {
		console.error('Could not execute content script', err, tabId)
		return
	}
	try {
		if ((await attachDebugger(tabId)) === false) {
			// probably already attached or it's a chrome:// URL
			return
		}
	} catch (e) {
		console.error('Error attaching debugger', e)
		return
	}
	try {
		await sendDebuggerCommand('Debugger.enable')
		await sendDebuggerCommand('Page.enable')
		await sendDebuggerCommand('DOM.enable')
		await sendDebuggerCommand('HeapProfiler.enable')
		await sendDebuggerCommand('HeapProfiler.startSampling')
		await sendDebuggerCommand('HeapProfiler.startTrackingHeapObjects')
	} catch (e) {
		console.error('Error sending debugger setup commands', e)
	}
}

function initScript() {
	if (!chrome) {
		console.error('This script does not work in browsers other than Chrome. :^( ')
		return
	}
	chrome.webNavigation.onCommitted.addListener(ev => {
		handleInitAction(ev.tabId)
	})
	chrome.debugger.onEvent.addListener(handleDebuggerEvent)
	chrome.runtime.onMessage.addListener(handleRuntimeMessage)
}

try {
	initScript()
} catch (e) {
	console.error('Could not init background script', e)
}
