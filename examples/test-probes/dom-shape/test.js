/**
DOM shape test probe
*/

class DOMShapeProbe {
	/**
	@return {object} the results of the probe
	*/
	probe(basis){
		console.log('Probing DOM shape')
		if(!basis) return { passed: true }
		const shape = this._findShape(document.body)
		let width = 0;
		for(let i=0; i < shape.rows.length; i++){
			width = Math.max(width, shape.rows[i].length)
		}

		const results = {
			passed: true,
			depth: shape.rows.length,
			width: width
		}
		if(typeof basis.depth === 'number' && basis.depth !== results.depth){
			results.passed = false
		}
		if(typeof basis.width === 'number' && basis.width !== results.width){
			results.passed = false
		}
		return results
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

