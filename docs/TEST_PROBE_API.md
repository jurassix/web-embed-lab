# Test probe API

Test probes are loaded in the pages of hosted page formulas and then do the work of testing that the page isn't broken because of the target embed script.

Each test probe looks at one kind of data (heap size, load times, DOM shape, etc) both with and without the embed script loaded so it can run both absolute tests (e.g. there are at least 4 H1 elements) and relative tests (e.g. the number of H1 elements didn't change when we loaded the embed script).

Test probe classes implement two main methods:

- gatherBaselineData: collect data when the target embed script *is not* loaded
- probe: collect data when the target embed script *is* loaded, then check that the collected values are correct 

Note: Both methods *must* be marked `async` or the test probe will fail.

## Example

Read the comments in this example class to discover how the baseline data is collected and how absolute and relative comparisons are made.

	class ExampleProbe {

		/**
		@return {Object} data collected when the target embed script *is not* loaded
		@property {bool} success - true if the data collection was successful
		@property {int} someValue - some info we probed from the page
		@property {int} someOtherValue - some other info we probed from the page
		*/
		async gatherBaselineData(){
			return {
				success: true,
				// these are values we read while the target embed script is NOT loaded
				someValue: 22,
				someOtherValue: 33
			}
		}

		/**
		@return {Object} the results of the test probe
		@property {bool} passed
		@property {int} someValue - some info we probed from the page
		@property {int} someOtherValue - some other info we probed from the page
		*/
		async probe(basis, baseline){
			// establish the probe values to use in this test
			const results = {
				passed: true,
				// these are the values we read while the target embed script *is* loaded
				someValue: 22,
				someOtherValue: 33
			}
			// If there is no basis of comparison then the test is always a success
			if(!basis) return results
			// Now test probed values against the basis
			for(const prop of ["someValue", "someOtherValue"]){
				if(typeof basis[prop] === 'undefined'){
					continue
				}
				// Use the provided matching method so we don't need to write our own parsing methods
				// **Note** This is an absolute comparison so we don't pass a baseline parameter
				if(window.__welValueMatches(results[prop], basis[prop]) === false){
					results.passed = false
				}
			}
			// If there is no relative basis then we're done
			if(typeof basis["relative"] !== 'object'){
				return results
			}
			// Relative basis values are tested against the difference between probed values and baseline values
			const relativeBasis = basis["relative"]
			for(const prop of ["someValue", "someOtherValue"]){
				if(typeof relativeBasis[prop] === 'undefined'){
					continue
				}
				// Use the provided matching method so we don't need to write our own parsing methods
				// **Note** Unlike the call above, this is a relative test so we're passing in the baseline value
				if(window.__welValueMatches(results[prop], relativeBasis[prop], baseline[prop]) === false){
					results.passed = false
				}
			}
			return results
		}

	}

You can find example (fully functional) test probes in `web-embed-lab/examples/test-probes/`. The [`dom-shape`](../examples/test-probes/dom-shape/test.js) probe is a relatively simple example to start.

## Further reading

- [Prober.js](../fe/src/prober/prober.js) where `window.__welValueMatches` and other helper functions are defined.
