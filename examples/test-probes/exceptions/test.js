
class ExceptionsProbe {
	constructor(){
		window._exceptionCount = 0
		window._oldErrorPrototype = window.Error.prototype
		window.Error = function(...params){
			if(this instanceof window.Error === false){
				return new Error(...params)
			}
			window._exceptionCount = window._exceptionCount + 1
			return window._oldErrorPrototype.constructor.call(this, ...params)
		}
		window.Error.prototype = window._oldErrorPrototype
	}

	/**
	@return {Object} data collected when the target embed script *is not* loaded
	@return {Object.success} true if the data collection was successful
	@return {Object.count} total number of throws exceptions
	*/
	async gatherBaselineData(){
		console.log('Exceptions baseline')
		if(typeof window._exceptionCount !== 'number'){
			return {
				success: false,
				error: 'window._exceptionCount does not exist'
			}
		}
		return {
			success: true,
			count: window._exceptionCount
		}
	}

	/**
	@param {object} results - the object on which to set result attributes
	*/
	async probe(basis, baseline){
		const results = {
			passed: true,
			count: window._exceptionCount
		}
		if(!basis){
			return results
		}

		if(typeof basis.count === 'number'){
			results.passed = basis.count === window._exceptionCount
			return results
		} else if(Array.isArray(basis.count)){
			if(basis.count.length !== 2 || basis.count[0] > basis.count[1]){
				console.error('Invalid range for exceptions: ' + basis)
				results.passed = false
				results.error = 'Invalid range'
				return results
			}
			results.passed = basis.count[0] <= window._exceptionCount && window._exceptionCount <= basis.count[1]
			if(!results.passed){
				console.error('Failed exception range: ' + window._exceptionCount + ' is not in ' + basis.count)
			}
			return results
		}

		return results
	}
}

window.__welProbes['exceptions'] = new ExceptionsProbe()
