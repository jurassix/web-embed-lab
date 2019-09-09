# Page formula syntax

TODO: Document the JSON syntax used to page formulas

	{
		"routes": [
			{
				"type": 0,
				"id": "123",
				"path": "^/$",
				"value": "/template/index.html",
				"parameters": {
					"title": "Data for this go template",
					...
				}
			},
			{
				"type": 3,
				"id": "321",
				"path": "^/images\\/example.png$",
				"value": "/static/ABC-101",
				"headers": {
					"Content-Type": "image/png"
				}
			},
			...
		],
		"template-data": {
			"example": "Global data for all go templates",
			...
		},
		"probe-basis": {
			"dom-shape": {
				"depth": 2,
				"width": 7
			},
			...
		}
	}

## Routes

TBD

- type (RouteType): template | mock | service | static
- id
- path: a golang (not Javascript) RegExp for URL matching
- value: the file path to the resource
- parameters: go template context data
- headers: HTTP headers

## URL rewriting

## HTML templating

Go templates that use `[![` and `]!]` block indicators instead of `{{` and `}}` which conflict with many JS frameworks.

## Test probes

