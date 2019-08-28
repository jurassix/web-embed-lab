/*

This embed script sets off a few timers and calculates a bit here and there.
Use this script to test that a test probe can be sensitive to embed memory size and CPU business.
*/
window.__wel_KIND_OF_BUSY = true

const dataLength = Math.pow(10, 6)

console.log('Kind of busy embed script: ' + dataLength)

let sumation = [].fill(0, 0, dataLength)
window.__welStoredValue = 0

function calculate(){
	let data = [].fill(0.1, 0, dataLength)
	for(let i=0; i < data.length; i++){
		data[i] = Math.random() * 10
	}
	for(let i=data.length - 1; i >= 0 ; i--){
		sumation[i] = (sumation[i] + data[i])
	}
	for(let i=0; i < dataLength ; i += 2){
		sumation[i] = (sumation[i] + data[i]) % 100000
	}
	return sumation[0] + sumation[dataLength - 1]
}

setInterval(() => { window.__welStoredValue = calculate() } , 105)
setInterval(() => { window.__welStoredValue = calculate() } , 207)

console.log('Kind of busy is activated!');
