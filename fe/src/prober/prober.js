
function initProber(){
	if(typeof window.__welProbes !== "object"){
		console.error('Prober loaded but there are no tests in __welProbes')
		return
	}
	var testKeys = Object.keys(window.__welProbes)
	for(var i=0; i < testKeys.length; i++){
		console.log('Found test', testKeys[i])
	}
}

console.log('Prober loaded')

document.addEventListener('DOMContentLoaded', function(){
	console.log('Initializing prober')
	initProber()
	console.log('Initialized prober')
})
