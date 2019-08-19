

/**
PerformanceProbe is a test probe that tests data in window._welPerformanceData
*/
class PerformanceProbe {
	constructor() {
		console.log('Performance probe constructed')
	}

	/**
	@return {Object} data collected when the target embed script *is not* loaded
	@return {Object.success} true if the data collection was successful
	@return {Object.performanceData}
	*/
	async gatherBaselineData(){
		console.log('Performance baseline')
		if(!window._welPerformanceData){
			return {
				success: false,
				error: 'No performance data was found'
			}
		}

		return {
			success: true,
			performanceData: window._welPerformanceData[window._welPerformanceData.length - 1]
		}
	}

	/**
	@return {object} the results of the probe
	@return {Object.passed}
	@return {Object.performanceData}
	*/
	async probe(basis, baseline) {
		console.log('Probing performance')
		const result = {
			description: ''
		}

		if(window._welPerformanceData){
			result.performanceData = window._welPerformanceData[window._welPerformanceData.length - 1]
		} else {
			result.performanceData = null
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
			const individualPass = this._testPerformanceKey(key, basis[key])
			if(individualPass.passed === false){
				passed = false
				if(individualPass.description){
					result.description += individualPass.description + ' '
				}
			}
		}

		result.passed = passed

		return result
	}

	_testPerformanceKey(key, basis={}){
		const value =this._latestPerformanceValue(key)
		if(value === null) {
			console.error('Invalid performance key: ' + key)
			return { passed: false, description: 'Invalid performance key: ' + key }
		}

		let subtractionValue = 0
		if(typeof basis.subtract === 'string'){
			subtractionValue =this._latestPerformanceValue(basis.subtract)
			if(subtractionValue === null){
				console.error('Invalid subtract basis: ' + key + ' ' + basis.subtract)
				return { passed: 'Invalid subtract basis: ' + key + ' ' + basis.subtract }
			}
		}

		if(typeof basis.range !== 'undefined'){
			if(this._matchesRange(basis.range, value - subtractionValue)){
				return { passed: true }
			} else {
				return {
					passed: false,
					description: '' + (value - subtractionValue) + ' is not in range ' + basis.range
				}
			}

		}

		return { passed: true }
	}

	_matchesRange(range, value){
		if(Array.isArray(range) === false) {
			console.error('Range is not an array: ' + range)
			return false
		}

		if(range.length !== 2){
			console.error('Range does not have two elements: ' + range)
			return false
		}

		const result = value >= range[0] && value <= range[1]
		if(result === false){
			console.error('Range ("' + range + '") does not match: ' + value)
		}
		return result
	}

	_latestPerformanceValue(key){
		const data =this._latestPerformanceData()
		if (data === null) return null
		for(let metric of data.metrics){
			if(metric.name === key) return metric.value
		}
		return null
	}

	_latestPerformanceData(){
		if(!window._welPerformanceData) return null
		return window._welPerformanceData[window._welPerformanceData.length - 1]
	}

	_latestEmbedScriptHeapMemory(){
		if(!window._welHeapMemoryData) return null
		return window._welHeapMemoryData[window._welHeapMemoryData.length - 1].embedScriptMemory
	}

	_logPerformanceData(index=-1, name=null){
		if(!window._welPerformanceData){
			console.error('No performance data found')
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
}

window.__welProbes["performance"] = new PerformanceProbe();
