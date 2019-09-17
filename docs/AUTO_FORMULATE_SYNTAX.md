# Auto-formulate syntax

This JSON syntax is read by `auto-formulate` and contains information about how to capture remote sites and then convert them into page formulas.

Example:

	{
		"captures": [
			{
				"browser-configuration": {
					"browserName": "Firefox",
					"browserVersion": "69.0",
					"os": "Windows",
					"osVersion": "10",
					...
				},
				"sites": [
					{
						"name": "transmutable",
						"url": "https://transmutable.com/?wel=t",
						...
					},
					...
				]
			},
			...
		],
		"formulations": [
			{
				"capture-name": "transmutable",
				"formula-name": "transmutable-splash",
				"probe-basis": {
					"dom-shape": {
						"depth": 6,
						"width": 13
					},
					...
				},
				...
			},
			...
		]
	}

## Captures

Each `capture` entry contains the selenium configuration (aka "capabilities") for a browser and then a list of sites to capture.

### `browser-configuration`

These options are passed directly via selenium when asking to control a browser.

Example:

	"browser-configuration": {
		"name": "Firefox",
		"os": "Windows",
		"osVersion": "10",
		"browserName": "Firefox",
		"browserVersion": "69.0",
		"resolution": "1024x768"
	}

Browserstack has a handy [capabilities wizard](https://www.browserstack.com/automate/capabilities) and the selenium site has [full documentation](https://github.com/SeleniumHQ/selenium/wiki/DesiredCapabilities).

### `sites`

Each entry in the `sites` array holds information about how to reach a site and then how to make modifications to the captured data.

Example:

	{
		"name": "transmutable",
		"url": "https://transmutable.com/?wel=t",
		"close-pause": 0,
		"modifiers": [
			{
				"mime-type-selectors": ["text/html", ...],
				"replacements": [
					{
						"selector": "<style[^>]*>(?s:.*)</style>",
						"replacement": "/* removed styles */",
						"all": true
					},
					...
				]
			}
		]
	}

`name` is a unique string that is referenced during page formulation (below).

`url` must be a fully qualified (not relative) link to a target site.

`close-pause` (optional) indicates the number of seconds to wait after the DOM is fully loaded before stopping the capture. This can allow single page apps a bit of time to do work that needs to be captured.

`modifiers` (optional) will replace content that has been captured before it is used to create a page formula. A common use of modifiers is to remove embedded scripts, code snippets, or media that will be irrelevant or interfering in the page formula.

`modifiers > mime-type-selectors` are used to select which files to modify. Each captured file is associated with its HTTP mime-type header and those values are used in the comparison when selecting files.

`modifiers > replacements > selector` is a Go regular expression (*not Javascript*) to match content to be replaced.

`modifiers > replacements > replacement` is the string that replaces the matched text.

`modifiers > replacements > all` (optional: false) if false only the first match will be replaced.

## Formulations

Each entry in the `formulations` array specifies how to convert a capture into a page formula.

Example: 

	{
		"capture-name": "transmutable",
		"formula-name": "transmutable-light",
		"modifiers": [
			{
				"file-name-selectors": ["(.*)\\.html"],
				"replacements": [
					{
						"selector": "<h3>(?sU:.*)</h3>",
						"replacement": "/* removed h3 */",
						"all": true
					}
				]
			}
		],
		"probe-basis": {
			"dom-shape": {
				"relative": {
					"depth": 0,
					"width": 0
				},
				"depth": 6,
				"width": 13
			},
			"exceptions": {
				"count": [0, 1]
			},
			"selector-count": {
				"body h1": 1,
				"body img": 4
			},
			"text-equals": {
				"body h1": "Transmutable"
			},
			"performance": {
				"DomContentLoaded": {
					"value": [0, 2.5],
					"subtract": "NavigationStart"
				}
			},
			"heap": {
				"embedScriptMemory": [0, 1000000]
			}
		}
	}

`capture-name` must refer to one of the captures named by `captures > sites > name` in order to use that capture data as the source for the page formula.

`formula-name` is the name of the page formula that will be created.

`modifiers` are similar to the `capture > site > modifiers` documented above but instead of modifying capture data these `modifiers` are used to replace text in the generated page formula files, often to inject script elements used during testing or to remove pieces of HTML or CSS that interfere with testing. 

`modifiers > file-name-selectors` are used to select which page formula files need modifications. These are Go regular expressions (*not javascript*).

### `probe-basis`

This is test probe configuration information that is copied verbatim into the page formula's formula.json file ([documented here](PAGE_FORMULA_SYNTAX.md)). This allows `auto-formulate` to create a complete page formula that is ready to be run in tests by the `runner`.

## Further reading:
- [Parser source code (go)](https://github.com/cowpaths/web-embed-lab/blob/master/go/src/wel/formulas/auto-formulas.go)
- [Capture JSON syntax](./CAPTURE_SYNTAX.md)
- [Page formula JSON syntax](./PAGE_FORMULA_SYNTAX.md)
