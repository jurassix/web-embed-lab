

function _matchesRange(range, value){
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

function _testHeapMemoryKey(key, basis){
	const latestValue = _latestHeapMemoryDataValue(key)
	console.log('testing: ' + key + ' ' + latestValue + ' ' + basis)
	if(latestValue === null){
		console.error('Heap memory test key does not exist', key)
		return false
	}

	if(Array.isArray(basis)){
		return _matchesRange(basis, latestValue)
	} if(typeof basis === 'number') {
		return latestValue === basis
	} 

	console.error('Unsupported basis type', key, basis, typeof basis)
	return false
}

function _latestHeapMemoryData(){
	if(!window._welHeapMemoryData || window._welHeapMemoryData.length === 0) return null
	return window._welHeapMemoryData[window._welHeapMemoryData.length - 1]
}

function _latestHeapMemoryDataValue(key){
	const latestMemoryData = _latestHeapMemoryData()
	if(latestMemoryData === null) return null
	if(typeof latestMemoryData[key] === 'undefined') return null
	return latestMemoryData[key]
}

/**
HeapProbe is a test probe that tests heap memory sizes.
It uses data in window._welHeapMemoryData which is provided by the prober-extension
*/
class HeapProbe {
	constructor() {
		console.log('Heap probe constructed')
	}

	/**
	@return {object} the results of the probe
	*/
	probe(basis) {
		console.log('Probing heap')
		try {
			const result = {
				passed: true,
				heapMemoryData: _latestHeapMemoryData()
			}

			if(!basis) {
				result.passed = true
				return result
			}

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
				const individualPass = _testHeapMemoryKey(key, basis[key])
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
}

window.__welProbes["heap"] = new HeapProbe();
