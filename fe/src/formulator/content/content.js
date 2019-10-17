// Prevent redefinition on page change
if (window.ContentConstants === undefined) {
	window.ContentConstants = {
		SendWindowMessage: 'wf-send-window-message',
		ReceivedColluderMessage: 'wf-received-colluder-message',
		SendColluderMessage: 'wf-send-colluder-message',
		WebSocketOpened: 'WebSocket-Opened',
		WebSocketClosed: 'WebSocket-Closed'
	}

	if (typeof browser === 'undefined') {
		if (typeof chrome !== 'undefined') {
			window.browser = chrome
		} else {
			throw new Error('Could not find the WebExtension API')
		}
	}

	function handleRuntimeMessage(data, sender, sendResponse) {
		if (data.action == undefined) {
			console.error('Content received unknown runtime message format:', data)
			return
		}
		switch (data.action) {
			case window.ContentConstants.SendWindowMessage:
				window.postMessage(data, '*')
				break
			case window.ContentConstants.SendColluderMessage:
				colluderClient.sendData(data.message)
				break
			default:
				console.error('Content received unknown runtime message', data)
		}
	}

	function injectScript(url) {
		if (document.querySelector('script[src="url"]') !== null) {
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

	/**
	ColluderClient manages a WebSocket connection to the colluder service
	*/
	class ColluderClient {
		/**
		@param {string} serviceURL - A full WS url like wss://127.0.0.1:9082
		@param {function(Event)} [messageHandler] - called with incoming messages
		*/
		constructor(serviceURL, messageHandler = null) {
			this._serviceURL = serviceURL
			this._messageHandler = messageHandler
			this._socket = null

			/** True if the client will attempt to stay connected to the service, even across disconnects */
			this.running = false

			/** The interval ID during repeated attempts to connect */
			this._reconnectIntervalID = null
		}

		/**
		Causes the client to attempt to connect and stay connected across disconnects
		*/
		run() {
			if (this.running) return
			this.running = true
			this._startInterval()
		}

		/**
		Causes the client to close the connection and stay closed until run() is called
		*/
		stop() {
			if (this.running === false) return
			this.running = false
			this._stopInterval()

			if (this._socket === null) return
			if (this._socket.readyState !== ColluderClient.CLOSING && this._socket.readyState !== ColluderClient.CLOSED) {
				this._socket.close()
			}
			this._socket = null
		}

		/**
		Attempts to send a message to the colluder service
		*/
		sendData(data) {
			if (this._socket === null || this._socket.readyState !== ColluderClient.OPEN) {
				console.error('Can not send message', this._socket)
				return false
			}
			this._socket.send(JSON.stringify(data))
			return true
		}

		_startInterval() {
			if (this._reconnectIntervalID !== null) return
			this._reconnectIntervalID = setInterval(this._open.bind(this), 1000)
		}

		_stopInterval() {
			if (this._reconnectIntervalID === null) return
			clearInterval(this._reconnectIntervalID)
			this._reconnectIntervalID = null
		}

		async _open() {
			if (this.running === false) return
			if (this._socket !== null) return

			this._socket = new WebSocket(this._serviceURL)

			this._socket.onopen = () => {
				if (this.running === false) {
					// Client was stopped during a connection attempt, abort
					this._socket.close()
					this._socket = null
					return
				}

				if (this._socket.readyState !== ColluderClient.OPEN) {
					// Unsuccessful connection
					this._socket = null
					return
				}
				this._stopInterval()

				this._sendMessageToHandler({
					data: `{"type":"${ContentConstants.WebSocketOpened}"}`
				})
			}

			this._socket.onerror = (...params) => {
				this._socket = null
				if (this.running) {
					this._startInterval()
				}
			}

			this._socket.onclose = (...params) => {
				this._socket = null
				if (this.running) {
					this._startInterval()
				}
				this._sendMessageToHandler({
					data: `{"type":"${ContentConstants.WebSocketClosed}"}`
				})
			}

			this._socket.onmessage = this._sendMessageToHandler.bind(this)
		}

		_sendMessageToHandler(message) {
			if (this._messageHandler === null) return
			this._messageHandler(message)
		}
	}

	ColluderClient.CONNECTING = 0
	ColluderClient.OPEN = 1
	ColluderClient.CLOSING = 2
	ColluderClient.CLOSED = 3

	ColluderClient.ColluderProxyPort = 9180
	ColluderClient.ColluderWebPort = 9181
	ColluderClient.ColluderWebSocketPort = 9182

	window.addEventListener('message', handleWindowMessage)
	browser.runtime.onMessage.addListener(handleRuntimeMessage)

	injectScript('https://localhost:' + ColluderClient.ColluderWebPort + '/target-page-colluder.js')

	//  The ColluderClient WebSocket listener relays messages back to the formulator background script
	const colluderClient = new ColluderClient('wss://localhost:' + ColluderClient.ColluderWebSocketPort + '/ws', message => {
		browser.runtime.sendMessage({
			action: ContentConstants.ReceivedColluderMessage,
			message: JSON.parse(message.data)
		})
	})

	colluderClient.run()
}
