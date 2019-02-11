
class ExceptionsProbe {
	constructor(context, options){
		this._context = context
		this._options = options

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
	probe(results){
		console.log('Probing exceptions')
		results['exceptions-count'] = window._exceptionCount
	}
}

window.__welProbes['exceptions'] = new ExceptionsProbe()
