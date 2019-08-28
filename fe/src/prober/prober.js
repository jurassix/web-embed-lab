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

/**
Returns a promise that resolves after a set time
@param {number} milliseconds - the time to wait before resolving
*/
window.__welWaitFor = function(milliseconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, milliseconds)
	})
}

/**
Test a probed value against a basis value, possibly relative to a baseline value

@param {number | string} probeValue - the probed value
@param {number | string | object | array} basisValue - the test probe basis
@param {number | string } baselineValue - the optional baseline for the basis value
@returns {bool} true if probeValue is within basis description (exact match, within range, possibly relative to baseline values)
*/
window.__welValueMatches = function(probeValue, basisValue = undefined, baselineValue = undefined) {
	if (typeof probeValue === 'number') {
		return window.__welNumericValueMatches(probeValue, basisValue, baselineValue)
	}
	if (typeof probeValue === 'string') {
		return window.__welStringValueMatches(probeValue, basisValue, baselineValue)
	}
	console.error('Unknown probe value type:', typeof probeValue, probeValue, basisValue, baselineValue)
	return false
}

window.__welStringValueMatches = function(probeValue, basisValue = undefined, baselineValue = undefined) {
	if (typeof probeValue !== 'string') {
		console.error('Attempted string match for non-string probe value:', probeValue, basisValue, baselineValue)
		return false
	}
	// Test against basisValue is null and baselineValue is a string
	if (typeof baselineValue === 'string') {
		if (basisValue === null) {
			return probeValue === baselineValue
		}
	} else if (typeof baselineValue !== 'undefined') {
		console.error('Attempted string match for non-string baseline value:', probeValue, basisValue, baselineValue)
		return false
	}

	return probeValue === basisValue
}

window.__welNumericValueMatches = function(probeValue, basisValue = undefined, baselineValue = undefined) {
	if (typeof probeValue !== 'number') {
		console.log('Attempted numeric match for non-numberic probe value:', probeValue, basisValue, baselineValue)
		return false
	}
	// Subtract baseline if necessary
	if (typeof baselineValue === 'number') {
		probeValue = probeValue - baselineValue
	} else if (typeof baselineValue !== 'undefined') {
		console.error('Error testing non-numeric baseline value', probeValue, basisValue, baselineValue)
		return false
	}

	if (typeof basisValue === 'number') {
		return probeValue === basisValue
	} else if (Array.isArray(basisValue)) {
		return window.__welRangeValueMatches(probeValue, basisValue)
	}
	console.error('Error: testing against unsupported basis type', probeValue, basisValue, baselineValue)
	return false
}

window.__welRangeValueMatches = function(probeValue, range) {
	if (Array.isArray(range) === false) {
		console.error('Range is not an array: ' + range)
		return false
	}
	if (range.length !== 2) {
		console.error('Range does not have two elements: ' + range)
		return false
	}
	const result = probeValue >= range[0] && probeValue <= range[1]
	if (result === false) {
		console.error('Range [' + range + '] does not match: ' + probeValue)
	}
	return result
}

patchXMLHttpRequest()
patchFetch()
document.addEventListener('DOMContentLoaded', initProber)

console.log('WEL Test prober loaded')
