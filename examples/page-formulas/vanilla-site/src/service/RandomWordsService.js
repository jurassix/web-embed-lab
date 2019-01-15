
class RandomWordsService {
	serviceGet(request, context){
		const maxWords = context['max-words'] ||  6
		return {
			status: 200,
			headers: [
				'Content-Type: text/plain'
			],
			body: randomString(maxWords)
		}
	}
}

const words = [
	'shoe',
	'city',
	'tinker',
	'tailor',
	'soldier',
	'spy',
	'food',
	'paste',
	'twonk',
	'sparks'
]

// returns a randomized string of words like "spy shoe paste"
function randomWords(maxWords){
	const numTokens = randomInt(maxWords + 1)
	let result = []
	for(var i=0; i < numTokens; i++){
		result.push(words[randomInt(words.length)])
	}
	return result.join(' ')
}

function randomInt(max){
	return Math.floor(Math.random() * Math.floor(max))
}

export default RandomWordsService