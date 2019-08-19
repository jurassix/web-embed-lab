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
	The return object contains the number of matches to each selector in SelectorCountProbe.BaselineSelectors
	{
		success: true,
		'h1': 1,
		'h2': 10,
		'div > img': 9,
		...
	}
	@return {Object} data collected when the target embed script *is not* loaded
	@return {Object.success} always true
	*/
	async gatherBaselineData(){
		console.log('Selector count baseline')
		const result = {
			success: true,
		}
		for(let selector of SelectorCountProbe.BaselineSelectors) {
			result[selector] = document.querySelectorAll(selector).length
		}
		return result
	}

	/**
	@return {object} the results of the probe
	*/
	async probe(basis, baseline){
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
SelectorCountProbe.BaselineSelectors = [
	'div > img', 
	'h1', 'h2', 'h3', 'h4', 'h5',
	'form', 'input', 'textarea',
	'img', 'video', 'audio',
	'section', 'header', 'footer'
]

window.__welProbes['selector-count'] = new SelectorCountProbe()

