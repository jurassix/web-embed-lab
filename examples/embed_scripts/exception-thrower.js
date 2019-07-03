/*

This embed script throws a ton of exceptions.
Use this script to test that a test probe reliably tests for exception count.
*/
window.__wel_DOM_EXPLODER = true

console.log('Exception thrower embed script')

let count = 500;

for(let i=0; i < count; i++){
	try {
		throw new Error('Error ' + i)
	} catch(e){
		// pass
	}
}

console.log('Threw and caught ' + count + ' exceptions. Now throwing an uncaught exception');

throw new Error('Exception Thrower Uncaught');
