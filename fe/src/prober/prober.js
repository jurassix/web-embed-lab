// patchXMLHttpRequests uses these variables
let rawXHROpen = null
let rawFetch = null

// the URL root for the rewritten absolute URLs from rewriteAbsoluteURL
const absoluteURLRoot = '/__wel_absolute/'

// See end of file for initialization calls

function initProber() {
	if (typeof window.__welProbes !== 'object') {
		console.error('Prober loaded but there are no tests in __welProbes')
		return
	}
}

/**
Monkey patches the XMLHttpRequest to intercept requests to absolute URLs:
	https://foo.com/one/two/three.jpg
	is changed to
	/__wel_absolute/foo.com/one/two/three.jpg
If not absolute, return the unchanged url
*/
function patchXMLHttpRequest() {
	if (rawXHROpen !== null) return // Already patched
	rawXHROpen = XMLHttpRequest.prototype.open
	XMLHttpRequest.prototype.open = function() {
		arguments[1] = rewriteAbsoluteURL(arguments[1])
		return rawXHROpen.apply(this, arguments)
	}
}

function patchFetch() {
	if (rawFetch !== null) return // Already patched
	rawFetch = window.fetch
	window.fetch = function() {
		arguments[0] = rewriteAbsoluteURL(arguments[0])
		return rawFetch.apply(this, arguments)
	}
}

/**
runWebEmbedLabProbes establishes baseline values of the page formula when loaded without the target embed script
@param {Array(string)} a list of test names to run. If tests is null or of length 0 then all tests are run.
*/
window.runWebEmbedLabBaseline = async function(testNames = null) {
	console.log('Establishing baseline')
	const results = {}
	if (typeof window.__welProbes !== 'object') {
		results.error = 'Failed to find probes for baseline'
		return results
	}
	if (testNames === null || testNames.length === 0) {
		testNames = []
		for (const key in window.__welProbes) {
			if (window.__welProbes.hasOwnProperty(key) === false) continue
			testNames.push(key)
		}
	}
	for (const key of testNames) {
		try {
			results[key] = await window.__welProbes[key].gatherBaselineData()
		} catch (err) {
			results[key] = {
				success: false,
				error: '' + err
			}
		}
	}
	console.log('Established baseline')
	return results
}

/**
runWebEmbedLabProbes runs the tests names by testNames
@param {Array(string)} testNames - a list of test names to run. If tests is null or of length 0 then all tests are run.
@param {Object} basis - the values tests use for baseline and comparison tests
*/
window.runWebEmbedLabProbes = async function(testNames = null, basis = {}, baselineData = {}) {
	console.log('Running probes')
	const results = {}
	if (typeof window.__welProbes !== 'object') {
		results.error = 'Failed to find probes'
		return results
	}
	if (testNames === null || testNames.length === 0) {
		testNames = []
		for (const key in window.__welProbes) {
			if (window.__welProbes.hasOwnProperty(key) === false) continue
			testNames.push(key)
		}
	}
	for (const key of testNames) {
		try {
			results[key] = await window.__welProbes[key].probe(basis[key] || {}, baselineData[key] || {})
		} catch (err) {
			results[key] = {
				passed: false,
				error: '' + err
			}
		}
	}
	console.log('Ran probes')
	return results
}

// Performance data received from the prober-extension via posted window message
window._welPerformanceData = []
window._welHeapMemoryData = []

function handleWindowMessage(event) {
	if (!event.data || !event.data.action) return
	switch (event.data.action) {
		case 'update-performance':
			window._welPerformanceData.push(event.data)
			console.log('new performance data: ' + event.data.subAction)
			break
		case 'update-heap-memory':
			window._welHeapMemoryData.push(event.data)
			console.log('new heap memory: ' + JSON.stringify(event.data))
			break
		case 'relay-to-background':
			break
		default:
			console.error('Unknown window event action', event)
	}
}
// Listen for posted window messages from the prober-extension
window.addEventListener('message', handleWindowMessage)

/**
If absolute, return the URL as a relative URL for the page formula host:
	https://foo.com/one/two/three.jpg
	is changed to
	/__wel_absolute/foo.com/one/two/three.jpg
If not absolute, return the unchanged url
*/
function rewriteAbsoluteURL(url) {
	if (!url) return url
	if (typeof url !== 'string') return url
	if (url.startsWith('http://')) {
		return absoluteURLRoot + url.substring(7)
	} else if (url.startsWith('https://')) {
		return absoluteURLRoot + url.substring(8)
	} else if (url.startsWith('//')) {
		return absoluteURLRoot + url.substring(2)
	} else {
		return url
	}
}

window.__welWaitFor = function(milliseconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, milliseconds)
	})
}

patchXMLHttpRequest()
patchFetch()
document.addEventListener('DOMContentLoaded', initProber)

console.log('WEL Test prober loaded')
