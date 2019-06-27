
function _testPerformanceKey(key, basis={}){
	const value = _latestPerformanceValue(key)
	if(value === null) {
		console.error('Invalid performance key: ' + key)
		return false
	}

	let subtractionValue = 0
	if(typeof basis.subtract === 'string'){
		subtractionValue = _latestPerformanceValue(basis.subtract)
		if(subtractionValue === null){
			console.error('Invalid subtract basis: ' + key + " " + basis.subtract)
			return false
		}
	}

	console.log('perf key: ' + key + " " + basis.range + " " + (value - subtractionValue))

	if(typeof basis.range !== 'undefined'){
		return _matchesRange(basis.range, value - subtractionValue) 
	}

	return true
}

function _matchesRange(range, value){
	if(Array.isArray(range) === false) {
		console.error('Range is not an array: ' + range)
		return false
	}

	if(range.length !== 2){
		console.error('Range does not have two elements: ' + range)
		return false
	}

	return value >= range[0] && value <= range[1]
}

function _latestPerformanceValue(key){
	const data = _latestPerformanceData()
	if (data === null) return null
	for(let metric of data.metrics){
		if(metric.name === key) return metric.value
	}
	return null
}

function _latestPerformanceData(){
	if(!window._welPerformanceData) return null
	return window._welPerformanceData[window._welPerformanceData.length - 1]
}

function _logPerformanceData(index=-1, name=null){
	if(!window._welPerformanceData){
		console.log('No performance data found')
		return
	}
	if(index < 0){
		index = window._welPerformanceData.length - 1
	}
	if(index >= window._welPerformanceData.length){
		console.log('Invalid index', index, 'length is', window._welPerformanceData.length)
		return
	}
	for(let metric of window._welPerformanceData[index].metrics){
		if(name !== null && metric.name !== name) continue
		console.log(metric.name, metric.value)
	}
}

/**
PerformanceProbe is a test probe that tests data in window._welPerformanceData
*/
class PerformanceProbe {
	constructor() {
		console.log('Performance probe constructed')
	}

	/**
	@return {object} the results of the probe
	*/
	probe(basis) {
		console.log('Probing performance')
		const result = {
			performanceData: window._welPerformanceData
		}

		if(!basis) {
			result.passed = true
			return result
		}

		if(!window._welPerformanceData || window._welPerformanceData.length === 0){
			console.error('No performance data')
			result.passed = false
			return result
		}

		let passed = true
		for(let key of Object.keys(basis)) {
			const individualPass = _testPerformanceKey(key, basis[key])
			if(individualPass === false){
				passed = false
			}
		}

		result.passed = passed
		return result
	}
}

window.__welProbes["performance"] = new PerformanceProbe();
