/**
TargetPageColluder is injected by the Formulator WebExtension into the target page for which you are drafting a page formula.
*/

class TargetPageColluder {
	constructor() {
		window.addEventListener('message', this._handleWindowMessage.bind(this))
	}

	_handleWindowMessage(event) {
		console.log('target page colluder received window message', event)
	}
}

export default TargetPageColluder
export { TargetPageColluder }
