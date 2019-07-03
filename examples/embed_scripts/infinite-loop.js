/*

This embed script simply goes into an infinite loop, doing a bit of math in each loop.
Use this script to test that a test probe reliably tests for CPU performance.
*/
window.__wel_INFINITE_LOOP = true

console.log('infinite loop embed script')

let count = 0;
let max = 100000000;

setInterval(() => {
	for(let i=0; i < max; i++){
		count = (count + 1) % max
	}
	console.log('s')
}, 0.00001)

