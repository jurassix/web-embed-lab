
/**
HeapProbe is a test probe that tests heap memory sizes.
It uses data in window._welHeapMemoryData which is provided by the prober-extension
*/
class HeapProbe {
	constructor() {
		console.log('Heap probe constructed')
	}

	/**
	@return {Object} data collected when the target embed script *is not* loaded
	@return {Object.success} true if the data collection was successful
	@return {Object.heapMemoryData} total number of throws exceptions
	*/
	async gatherBaselineData(){
		console.log('Heap baseline')
		await this._requestAndWaitForHeapMemory()
		const heapMemoryData = this._latestHeapMemoryData()
		return {
			success: heapMemoryData !== null,
			heapMemoryData: heapMemoryData
		}
	}

	/**
	@return {Object} the results of the probe
	@return {Object.passed}
	@return {Object.heapMemoryData}
	*/
	async probe(basis, baseline) {
		console.log('Probing heap')

		try {
			const result = {
				passed: true,
				heapMemoryData: null
			}

			if(!basis || Object.keys(basis).length == 0) {
				result.passed = true
				return result
			}

			await this._requestAndWaitForHeapMemory()
			result.heapMemoryData = this._latestHeapMemoryData()

			if(result.heapMemoryData === null){
				result.passed = false
				result.error = 'No heap memory data found.'
				return result
			}

			if(result.heapMemoryData === null){
				console.error('No heap memory data')
				result.passed = false
				return result
			}

			for(let key of Object.keys(basis)) {
				const individualPass = this._testHeapMemoryKey(key, basis[key])
				if(individualPass === false){
					result.passed = false
				}
			}

			return result
		} catch (e) {
			console.error('Heap probe error: ' + e + ' ' + e.lineNumber)
			return {
				passed: false,
				error: 'Error: ' + e
			}
		}
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

	_testHeapMemoryKey(key, basis){
		const latestValue = this._latestHeapMemoryDataValue(key)
		console.log('testing: ' + key + ' ' + latestValue + ' ' + basis)
		if(latestValue === null){
			console.error('Heap memory test key does not exist', key)
			return false
		}

		if(Array.isArray(basis)){
			return this._matchesRange(basis, latestValue)
		} if(typeof basis === 'number') {
			return latestValue === basis
		} 

		console.error('Unsupported basis type', key, basis, typeof basis)
		return false
	}

	_latestHeapMemoryData(){
		if(!window._welHeapMemoryData || window._welHeapMemoryData.length === 0) return null
		return window._welHeapMemoryData[window._welHeapMemoryData.length - 1]
	}

	_latestHeapMemoryDataValue(key){
		const latestMemoryData = this._latestHeapMemoryData()
		if(latestMemoryData === null) return null
		if(typeof latestMemoryData[key] === 'undefined') return null
		return latestMemoryData[key]
	}

	async _requestAndWaitForHeapMemory(){
		window._welHeapMemoryData = []
		window.postMessage({ action: 'relay-to-background', subAction: 'snapshot-heap' }, '*')
		let waitsRemaining = 25
		let waitMilliseconds = 500
		while(window._welHeapMemoryData.length == 0 && waitsRemaining > 0){
			waitsRemaining -= 1
			await window.__welWaitFor(waitMilliseconds)
		}
	}
}

window.__welProbes["heap"] = new HeapProbe();
