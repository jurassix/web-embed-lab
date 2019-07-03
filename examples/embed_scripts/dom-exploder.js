/*

This embed script creates a huge DOM subtree then removes it.
Use this script to test that a test probe reliably tests for DOM shape and for performance.
*/
window.__wel_DOM_EXPLODER = true

console.log('DOM exploder embed script')

let count = 0;
let depth = 6;
let width = 10;

function fillOut(element, currentDepth=0){
	currentDepth += 1;
	if(currentDepth > depth) return;
	for(let i=0; i < width; i++){
		let child = document.createElement('div');
		count += 1;
		element.appendChild(child);
		fillOut(child, currentDepth);
	}
}

let rootElement = document.createElement('div');
document.body.appendChild(rootElement);
fillOut(rootElement);
console.log('DOM exploded with ' + count + ' elements');
