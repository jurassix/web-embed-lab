# Auto-formulate syntax

TODO: Document the JSON syntax used to configure `auto-formulate`

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


## Browsers

## Target sites

## Modifiers

## Further reading:
- [Capture JSON syntax](./CAPTURE_SYNTAX.md)
- [Page formula JSON syntax](./PAGE_FORMULA_SYNTAX.md)
