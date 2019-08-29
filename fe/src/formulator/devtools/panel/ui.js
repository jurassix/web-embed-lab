import { EventHandler } from './EventHandler.js'

/**
A few helper classes for UI construction
*/

/** The base UI component class */
class Component extends EventHandler {
	/**
	@param {Object} [options]
	@param {HTMLElement} [options.el]
	*/
	constructor(options = {}) {
		super()
		this.options = Object.assign(
			{
				el: document.createElement('div')
			},
			options
		)
		this.el.addClass = addClass
		this.el.removeClass = removeClass

		this.el.addClass('component')
	}

	get el() {
		return this.options.el
	}

	appendTo(parent = null) {
		if (parent instanceof HTMLElement) {
			parent.appendChild(this.el)
		} else if (parent instanceof Component) {
			parent.el.appendChild(this.el)
		} else {
			console.error('Unknown parent type', typeof parent, parent)
		}
		return this
	}
}

class ButtonComponent extends Component {
	/**
	@param {string} [options.text='']
	*/
	constructor(options = {}) {
		super(
			Object.assign(
				{
					text: '',
					el: document.createElement('button')
				},
				options
			)
		)
		this.el.addClass('button-component')
		this.el.setAttribute('type', 'button')
		this.el.innerText = this.options.text

		this.el.addEventListener('click', ev => {
			this.trigger(ButtonComponent.ClickedEvent, ev, this)
		})
	}
}
ButtonComponent.ClickedEvent = 'button-clicked'

class KeyValueComponent extends Component {
	constructor(options = {}) {
		super(
			Object.assign(
				{
					el: document.createElement('span'),
					key: '',
					value: ''
				},
				options
			)
		)
		this.el.addClass('key-value-component')

		this._keyEl = document.createElement('span')
		this._keyEl.setAttribute('class', 'key-el')
		this.el.appendChild(this._keyEl)

		this._valueEl = document.createElement('span')
		this._valueEl.setAttribute('class', 'value-el')
		this.el.appendChild(this._valueEl)

		this._updateFromOptions()
	}

	get value() {
		return this.options.value
	}
	set value(val) {
		this.options.value = val || ''
		this._updateFromOptions()
	}

	_updateFromOptions() {
		this._keyEl.innerText = `${this.options.key}:`
		this._valueEl.innerText = `${this.options.value}`
	}
}

export { Component, ButtonComponent, KeyValueComponent }

// Convenience functions to add and remove classes from this element without duplication
const addClass = function(...classNames) {
	const classAttribute = this.getAttribute('class') || ''
	const classes = classAttribute === '' ? [] : classAttribute.split(/\s+/)
	for (const className of classNames) {
		if (classes.indexOf(className) === -1) {
			classes.push(className)
		}
	}
	this.setAttribute('class', classes.join(' '))
	return this
}

const removeClass = function(...classNames) {
	const classAttribute = this.getAttribute('class') || ''
	const classes = classAttribute === '' ? [] : classAttribute.split(/\s+/)
	for (const className of classNames) {
		const index = classes.indexOf(className)
		if (index !== -1) {
			classes.splice(index, 1)
		}
	}
	if (classes.length === 0) {
		this.removeAttribute('class')
	} else {
		this.setAttribute('class', classes.join(' '))
	}
	return this
}
