# Page formula syntax (aka formula.json)

The formula.json file found in the root directory of a page formula holds all of the meta-data required to serve up the formulated page without making connections to remote sites, including the captured target site that you may have used when creating the formula.

Example:

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

## `routes`

`type` is an integer that indicates what sort of route this is:

- 0: A go template (usually HTML)
- 1: A JS class that acts like (aka mocks) a web service (not yet implemented)
- 2: A service URL, locally hosted or remote (not yet implemented)
- 3: A locally hosted static file

`id` a unique string identifying the route

`path` is a Go (*not Javascript*) regular expression for matching relative URLs of incoming requests to a route in a hosted page formula.

`value` is a relative path to a file, usually a Go template or a static file.

`parameters` (optional) Used by `template` routes as context data when rendering the template.

`headers` (optional) HTTP headers to pass with the response when serving the route.

## `template-data`

This is Go template context data like the `parameters` in a template route but instead of being for a single route it is for all template routes.

Use this for common context data needed by all Go templates in the page formula.

## `probe-basis`

This is the data passed into the test probes to define the expectations for the probe. For example, the `dom-shape` test probe expects a basis to hold `depth` and `width` values that it compares to the probed data.

See the [test probe API documentation](TEST_PROBE_API.md) for more details.

## URL rewriting

Ideally, a page formula's HTML, CSS, and Javascript file use relative URLs. The `auto-formulate` and `formulate` commands do their best to rewrite as many URLs as it can, replacing fully qualified URLs to the main site with relative URLs.

Those commands also find and replace fully qualified URLs to *third-party sites* with a relative path like `/__wel_absolute/{third-party site host}/{original path}`. For example, if the target site is `transmutable.com` then a URL in the page to a third party URL like `https://example.com/foo?bar` will be rewritten to `/__wel_absolute/example.com/foo?bar` and a corresponding route will match that to the right resource. 

## HTML templating

The WEL Go templates use `[![` and `]!]` as block indicators instead of `{{` and `}}` because those conflict with many JS frameworks.


## Further reading:
- [Parser source code (go)](../go/src/wel/formulas/formulas.go)
