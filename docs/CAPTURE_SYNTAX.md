# Web site capture syntax (aka timeline.json)

These files are created during a target site capture. They store the meta-data for the browsing session that are eventually used to create a page formula.

Example:

	{
		"started": 1561999823,
		"ended": 1561999838,
		"hostname": "www3.hbc.com"
		"requests": [ see below ]
	}

`started` and `ended` are unix timestamps.

`hostname` holds only the hostname of the capture and is used when rewriting URLs during page formulation.

## `requests`

Each entry in the `requests` array holds meta-data about a single HTTP request that was intercepted by the HTTP proxy used by `auto-formulate` or the `colluder`.

Examples:

		{
			"timestamp": 1561999827,
			"url": "https://example.com:443/",
			"status-code": 200,
			"content-type": "text/html; charset=UTF-8",
			"content-encoding": "gzip",
			"output-file-id": 101
		}

		{
			"timestamp": 1561999832,
			"url": "https://fonts.gstatic.com:443/example.woff2?foo=bar",
			"status-code": 200,
			"content-type": "font/woff2",
			"content-encoding": "",
			"output-file-id": 162
		}

`timestamp` is the time that the HTTP request occurred.

`url` is the full URL of the request, including fragments and parameters.

`status-code`, `content-type`, and `content-encoding` are copies of their respective HTTP headers.

Note: Captured files will be encoded according to `content-encoding` so if it's `gzip` then the stored file will be gzipped. The page formulation step will unencode files as appropriate.

`output-file-id` is the ID of the captured data from a single request.

## Further reading:
- [Parser source code (go)](../go/src/wel/services/colluder/session/timeline.go)
- [Page formula JSON syntax](./PAGE_FORMULA_SYNTAX.md)
