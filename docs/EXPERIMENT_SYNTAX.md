# Experiment syntax

TODO: Document the JSON syntax used to configure experiments for the runner to execute

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

## Page formulas

TBD

## Browser configurations

TBD

## Test runs

TBD
