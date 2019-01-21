/**
DOM shape test probe
*/

class DOMShapeProbe {
	constructor(context, options){
		this._context = context
		this._options = options
		console.log('Constructed DOM shape probe')
	}

	/**
	@param {object} results - the object on which to set result attributes
	*/
	probe(results){
		console.log('Probing DOM shape')
		results['dom-depth'] = 23
	}
}

window.__welProbes['dom-shape'] = new DOMShapeProbe()

