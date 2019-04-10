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
	probe(basis){
		console.log("Probing selector count")
		if(!basis) return { passed: true }
		const results = {
			passed: true,
			failed: [] // List of selectors with the wrong count
		}
		for(let selector of Object.keys(basis)){
			if(basis.hasOwnProperty(selector) === false) continue
			const matchedElements = document.querySelectorAll(selector)
			results[selector] = matchedElements.length
			if(basis[selector] !== matchedElements.length) {
				results.passed = false
				results.failed.push(selector)
			}
		}
		return results
	}
}

window.__welProbes['selector-count'] = new SelectorCountProbe()

