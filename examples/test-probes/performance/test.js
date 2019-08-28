

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
			passed: true,
			description: ''
		}

		if(window._welPerformanceData){
			result.performanceData = window._welPerformanceData[window._welPerformanceData.length - 1]
		} else {
			result.performanceData = null
		}

		if(!basis) {
			return result
		}

		if(result.performanceData === null){
			console.error('No performance data')
			result.passed = false
			return result
		}

		for(let key of Object.keys(basis)) {
			if(key === 'relative') continue
			const individualPass = this._testPerformanceKey(key, basis[key])
			if(individualPass.passed === false){
				result.passed = false
				if(individualPass.description){
					result.description += individualPass.description + ' '
				}
			}
		}

		if(typeof basis.relative === 'undefined'){
			return result
		}

		for(let key of Object.keys(basis.relative)){
			const individualPass = this._testPerformanceKey(key, basis.relative[key], baseline[key])
			if(individualPass.passed === false){
				result.passed = false
				if(individualPass.description){
					result.description += individualPass.description + ' '
				}
			}
		}

		return result
	}

	_testPerformanceKey(key, basis=undefined, baseline=undefined){
		if(typeof basis === 'undefined'){
			return {
				passed: false,
				description: key + ' has no basis'
			}
		}
		if(typeof basis.value === 'undefined'){
			return {
				passed: false,
				description: key + ' has no basis.value'
			}
		}
		let probeValue = this._latestPerformanceValue(key)
		if(probeValue === null) {
			console.error('Invalid performance key: ' + key)
			return {
				passed: false,
				description: 'Invalid performance key: ' + key
			}
		}

		let subtractionValue = 0
		if(typeof basis.subtract === 'string'){
			subtractionValue = this._latestPerformanceValue(basis.subtract)
			if(subtractionValue === null){
				console.error('Invalid subtract basis: ' + key + ' ' + basis.subtract)
				return {
					passed: false,
					description: 'Invalid subtract basis: ' + key + ' ' + basis.subtract
				}
			}
			probeValue = probeValue - subtractionValue
		}

		if(window.__welValueMatches(probeValue, basis.value, baseline)){
			return { passed: true }
		}

		let description = key + ' did not match ' + basis.value
		if(baseline){
			description += ' with baseline ' + baseline
		}
		return {
			passed: false,
			description: description
		}
	}

	_latestPerformanceValue(key){
		const data = this._latestPerformanceData()
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
