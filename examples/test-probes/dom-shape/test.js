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
	@return {object} the results of the probe
	*/
	probe(){
		console.log('Probing DOM shape')
		let shape = this._findShape(document.body)
		let maxWidth = 0;
		for(let i=0; i < shape.rows.length; i++){
			maxWidth = Math.max(maxWidth, shape.rows[i].length)
		}
		return {
			passed: true,
			rows: shape.rows.length,
			width: maxWidth
		}
	}

	_findShape(element, depth=0, results={ rows: [] }){
		if(!results.rows[depth]) results.rows[depth] = []
		results.rows[depth].push(element.children.length)
		for(let i=0; i < element.children.length; i++){
			this._findShape(element.children[i], depth + 1, results)
		}
		return results
	}
}

window.__welProbes['dom-shape'] = new DOMShapeProbe()

