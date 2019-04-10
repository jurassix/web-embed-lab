/** index.js */

fetch('./service/random-words').then(response => {
	if(response.ok === false){
		document.getElementById('random-words').innerText = 'Could not fetch random words from JS service'
		return Promise.reject(response)
	}
	return response.text()
}).then(words => {
	document.getElementById('random-words').innerText = words
}).catch((...params) => {
	console.error('Error', ...params)
})
