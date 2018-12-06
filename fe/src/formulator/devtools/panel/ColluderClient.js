
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

export default ColluderClient