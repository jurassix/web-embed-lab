package inspect

var TestScript = `

window._welContentPerfData = []

function hasPerfData() {
	if(!window._welContentPerfData || window._welContentPerfData.length === 0 || !window._welContentPerfData[0].metrics){
		return false
	}
	return true
}

function getPerfData() {
	if (hasPerfData() === false) return null
	return window._welContentPerfData[window._welContentPerfData.length - 1]
}

function welWaitFor(milliseconds) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, milliseconds)
	})
}

function handleWindowMessage(event) {
	if (!event.data || !event.data.action) return
	switch (event.data.action) {
		case 'latest-performance':
			window._welContentPerfData.push(event.data)
			break
		case 'background-message':
		case 'update-heap-memory':
		case 'relay-to-background':
			break
		default:
			console.error('Unknown window event action', event)
	}
}
// Listen for posted window messages from the prober-extension
window.addEventListener('message', handleWindowMessage)

try {
	window.postMessage({ action: 'relay-to-background', subAction: 'request-performance' }, '*')

	const startTime = Date.now()
	while (hasPerfData() === false && Date.now() - startTime < 5000) {
		console.log('Waiting: ' + new Date())
		await welWaitFor(100)
	}

	let results = null
	if(hasPerfData() === false){
		results = {
			success: false,
			error: 'No performance data was found'
		}
	} else {
		results = {
			success: true,
			performanceData: window._welContentPerfData[window._welContentPerfData.length - 1]
		}
	}
	callback(JSON.stringify(results));
} catch (e) {
	console.error('Error running inspect: ' + e);
	let results = {
		'error': 'Error running inspect: ' + e
	}
	callback(JSON.stringify(results));
}
`
