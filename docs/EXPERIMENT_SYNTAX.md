# Experiment syntax

The JSON syntax used to configure experiments for the `runner` command to execute.

	{
		"page-formulas": [
			{ "name": "transmutable-light" },
			...
		],
		"browser-configurations": [
			{
				"name": "Firefox 69",
				...
			},
			...
		],
		"test-runs" : [
			{
				"page-formulas": [
					"transmutable-light",
					...
				],
				"test-probes": [
					"dom-shape",
					...
				],
				"browsers": [
					"Firefox 69",
					...
				]
			},
			...
		]
	}

## `page-formulas`

Each entry in the `page-formulas` array references a page formula on disk.

Examples:

	{ "name": "transmutable-base" }

	{ "name": "transmutable-light" }

These names must have corresponding directories in the page formulas directory that is passed as a parameter to the `runner` command.

Using the examples above and a page formulas directory of `../pf/`, `runner` will check for `../pf/transmutable-base/` and `../pf/transmutable-light/`.

## `browser-configurations`

These capabilities are passed via selenium when asking to control a browser.

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


## 'test-runs'

Each entry in the `test-runs` array specifies the page formulas, test probes, and browsers for a run.

Many experiments will have multiple test runs with different combinations, usually because some test probes only run in some browsers or because some page formulas are built for testing a specific aspect of a single browser. 

Example: 

	{
		"page-formulas": [
			"transmutable-light",
			"transmutable-base",
			...
		],
		"test-probes": [
			"dom-shape",
			"exceptions",
			...
		],
		"browsers": [
			"Chrome 75",
			...
		]
	}

`page-formulas` entries each hold the name of a page formula (documented above).

`test-probes` entries each hold the name of a test probe to run ([documented here](TEST_PROBE_API.md)).

`browsers` entries each hold the name of a browser defined in a `browser-configuration` (documented above).





