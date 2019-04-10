/**
Text equals test probe queries each selector in the basis
It fails if there is at least one match and the first match's text values isn't equal to the basis
Example basis:
	{
		"body > h1": "Vanilla",
		"#should-be-empty": ""
	} 
*/

class TextEqualsProbe {
	/**
	@return {object} the results of the probe
	*/
	probe(basis){
		console.log("Probing text equals")
		if(!basis) return { passed: true }
		const results = {
			passed: true,
			failed: [] // List of selectors that don't match
		}
		for(let selector of Object.keys(basis)){
			if(basis.hasOwnProperty(selector) === false) continue
			const matchedElements = document.querySelectorAll(selector)
			if(matchedElements.length === 0 || matchedElements[0].innerText != basis[selector]){
				results.passed = false
				results.failed.push(selector)
			}
			results[selector] = matchedElements.length == 0 ? "" : matchedElements[0].innerText
		}
		return results
	}
}

window.__welProbes['text-equals'] = new TextEqualsProbe()

