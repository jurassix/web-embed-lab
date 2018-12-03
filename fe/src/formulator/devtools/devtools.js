if (typeof browser === 'undefined') {
	if (typeof chrome !== 'undefined') {
		browser = chrome
	} else {
		throw new Error('Could not find the WebExtension API')
	}
}

browser.devtools.panels.create('Formulator', '/icons/icon.png', '/devtools/panel/panel.html', function(panel) {})
