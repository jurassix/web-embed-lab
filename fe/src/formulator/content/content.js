// Prevent redefinition on page change
if (window.ContentConstants === undefined) {
	window.ContentConstants = {
		SomeAction: 'wf-some-action',
		ReceivedColluderMessage: 'wf-received-colluder-message',
		SendColluderMessage: 'wf-send-colluder-message'
	}

	if (typeof browser === 'undefined') {
		if (typeof chrome !== 'undefined') {
			browser = chrome
		} else {
			throw new Error('Could not find the WebExtension API')
		}
	}

	function handleRuntimeMessage(data, sender, sendResponse) {
		if(data.action == undefined){
			console.error('Content received unknown runtime message format:', data)
			return
		}
		switch (data.action) {
			case window.ContentConstants.SomeAction:
				window.postMessage(data, '*')
				break
			case window.ContentConstants.SendColluderMessage:
				if(colluderClient === null){
					console.error('Colluder client is null')
					return
				}
				colluderClient.sendData(data.message)
				break
			default:
				console.error('Content received unknown runtime message', data)
		}
	}

	function injectScript(url) {
		if(document.querySelector('script[src="url"]') !== null){
			// Already loaded
			return
		}
		const script = document.createElement('script')
		script.setAttribute('src', url)
		script.setAttribute('type', 'module')
		document.body.appendChild(script)
	}

	function handleWindowMessage(event) {
		switch (event.data.action) {
			case window.ContentConstants.SomeAction:
				browser.runtime.sendMessage({
					action: ContentConstants.PutKSSAction,
					kss: event.data.kss
				})
				break
			default:
				console.error('Content received unknown window message', event)
		}
	}

	class ColluderClient {
		constructor(serviceURL, messageHandler){
			this._serviceURL = serviceURL
			this._messageHandler = messageHandler
			this._socket = null
		}

		open(){
			return new Promise((resolve, reject) => {
				if(this._socket !== null){
					resolve()
					return
				}
				this._socket = new WebSocket(this._serviceURL)
				this._socket.onmessage = (...params) => {
					if(this._messageHandler){
						this._messageHandler(...params)
					}
				}
				this._socket.onopen = () => {
					resolve()
				}
				this._socket.onerror = (...params) => {
					reject(...params)
				}
			})
		}

		sendData(data){
			this._socket.send(JSON.stringify(data))
		}
	}

	window.addEventListener('message', handleWindowMessage)
	browser.runtime.onMessage.addListener(handleRuntimeMessage)

	injectScript('https://127.0.0.1:8081/target-page-colluder.js')

	//  The ColluderClient WebSocket listener relays messages back to the formulator background script
	const colluderClient = new ColluderClient('wss://localhost:8082/ws', message =>  {
		browser.runtime.sendMessage({
			action: ContentConstants.ReceivedColluderMessage,
			message: JSON.parse(message.data)
		})
	})

	colluderClient.open().catch((...params) => {
		console.error('Colluder client failed to connect', ...params)
	})
}