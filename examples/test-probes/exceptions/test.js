
class ExceptionsProbe {
	constructor(context, options){
		this._context = context
		this._options = options
		console.log('Constructed exceptions probe')
	}

	/**
	@param {object} results - the object on which to set result attributes
	*/
	probe(results){
		console.log('Probing exceptions')
		results['caught-exceptions'] = 0 // TODO
	}
}

window.__welProbes['exceptions'] = new ExceptionsProbe()
