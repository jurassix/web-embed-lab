
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
		console.log('Constructed exceptions probe')
	}

	/**
	@param {object} results - the object on which to set result attributes
	*/
	probe(basis){
		console.log('Probing exceptions')
		const results = {
			passed: true,
			count: window._exceptionCount
		}
		if(basis && typeof basis.count === 'number'){
			results.passed = basis.count === window._exceptionCount
		}
		return results
	}
}

window.__welProbes['exceptions'] = new ExceptionsProbe()
