/**
Selector count test probe queries each selector in the basis and fails only if the counts match
Example basis:
	{
		"body > h1": 3,
		"#bogus-id": 0,
		"#real-id": 1
	} 
*/

class SelectorCountProbe {
	/**
	@return {object} the results of the probe
	*/
	async probe(basis){
		console.log("Probing selector count")
		const results = {
			passed: true,
			failed: [] // List of selectors with the wrong count
		}
		if(!basis) return results

		for(let selector of Object.keys(basis)){
			if(basis.hasOwnProperty(selector) === false) continue
			const matchedElements = document.querySelectorAll(selector)
			results[selector] = matchedElements.length

			if(typeof basis[selector] === 'number' && basis[selector] !== matchedElements.length) {
				results.passed = false
				results.failed.push(selector)
			} else if(Array.isArray(basis[selector])){
				const range = basis[selector];
				if(range.length !== 2 || range[0] > range[1]){
					results.passed = false
					results.error = 'Invalid range (' + selector + '): ' + basis[selector]
					console.error(results.error)
					return results
				}

				if(range[0] > matchedElements.length || range[1] < matchedElements.length){
					results.passed = false
					results.failed.push(selector)
				}
			}
		}
		return results
	}
}

window.__welProbes['selector-count'] = new SelectorCountProbe()

