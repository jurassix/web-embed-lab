# Web site capture syntax (aka timeline.json)

TODO: Document the JSON syntax used to store the capture timeline meta-data that is eventually used to create a page formula.

	{
		"started": 1561999823,
		"ended": 1561999838,
		"hostname": "www3.hbc.com"
		"requests": ...
	}

## Request timeline

	requests = [
		{
			"timestamp": 1561999827,
			"url": "https://example.com:443/",
			"status-code": 200,
			"content-type": "text/html; charset=UTF-8",
			"content-encoding": "gzip",
			"output-file-id": 101
		},
		{
			"timestamp": 1561999832,
			"url": "https://fonts.gstatic.com:443/example.woff2",
			"status-code": 200,
			"content-type": "font/woff2",
			"content-encoding": "",
			"output-file-id": 162
		},
		...
	]
