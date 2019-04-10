// patchXMLHttpRequests uses these variables
var rawXHROpen = null
var rawFetch = null

// the URL root for the rewritten absolute URLs from rewriteAbsoluteURL
var absoluteURLRoot = '/__wel_absolute/'

// See end of file for initialization calls

function initProber(){
	if(typeof window.__welProbes !== "object"){
		console.error('Prober loaded but there are no tests in __welProbes')
		return
	}

	console.log('Prober initialized')
}

/**
Monkey patches the XMLHttpRequest to intercept requests to absolute URLs:
	https://foo.com/one/two/three.jpg
	is changed to
	/__wel_absolute/foo.com/one/two/three.jpg
If not absolute, return the unchanged url
*/
function patchXMLHttpRequest(){
	if(rawXHROpen !== null) return // Already patched
	rawXHROpen = XMLHttpRequest.prototype.open
	XMLHttpRequest.prototype.open = function(){
		arguments[1] = rewriteAbsoluteURL(arguments[1])
		return rawXHROpen.apply(this, arguments)
	}
}

function patchFetch(){
	if(rawFetch !== null) return // Already patched
	rawFetch = window.fetch
	window.fetch = function(){
		arguments[0] = rewriteAbsoluteURL(arguments[0])
		return rawFetch.apply(this, arguments)
	}
}

window.runWebEmbedLabProbes = function(basis={}){
	let results = {}
	if(typeof window.__welProbes !== "object"){
		results.error = "Failed to find probes"
		return results
	}
	for(let key in window.__welProbes){
		if(window.__welProbes.hasOwnProperty(key) === false) continue
		try {
			results[key] = window.__welProbes[key].probe(basis[key] || {})
		} catch(err){
			results[key] = {
				passed: false,
				error: '' + err
			}
		}
	}
	return results
}

/**
If absolute, return the URL as a relative URL for the page formula host:
	https://foo.com/one/two/three.jpg
	is changed to
	/__wel_absolute/foo.com/one/two/three.jpg
If not absolute, return the unchanged url
*/
function rewriteAbsoluteURL(url){
	if (!url) return url
	if(typeof url !== 'string') return url
	if(url.startsWith('http://')){
		return absoluteURLRoot + url.substring(7)
	} else if(url.startsWith('https://')){
		return absoluteURLRoot + url.substring(8)
	} else if(url.startsWith('//')){
		return absoluteURLRoot + url.substring(2)
	} else {
		return url
	}
}

patchXMLHttpRequest()
patchFetch()
document.addEventListener('DOMContentLoaded', initProber)
