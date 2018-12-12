import TargetPageColluder from './TargetPageColluder.js'

window.addEventListener('message', (...params) => {
	console.log('target page colluder received window message', ...params, document.querySelector('title').innerText)
})
