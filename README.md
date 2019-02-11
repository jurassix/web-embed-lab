# Web Embed Lab

The Web Embed Lab provides tools for testing that a specific version of an embeded script does not negatively effect the web page in which it is embedded.

Examples of embedded scripts are:
- Third party analytics like Google Analytics 
- Social media integrations like Twitter or Facebook's
- Continuous integration / testing status scripts like [Coveralls](https://coveralls.io/)

The WEL works in two phases: test development and test running.

**For developing tests** the WEL provides a WebExtension and a forward HTTP proxy that collude to gather information about a web page's resources and network patterns. You use these tools to capture an initial "page forumula" of your web site that will be used to repeatedly and reliably test an embed script's behavour.

You will use a `formulate` command line tool to convert a captured browser session into a page formula.

In this phase you'll also write your tests and choose which browsers to support.

**For running tests** the WEL provides a runner command line tool that hosts your page formulas and test probes. This is run in a container in a continuous integration system like CircleCI and calls out to a WebDriver-based browser testing host like Browserstack.

![Overview diagram](https://cowpaths.github.io/web-embed-lab/images/wel-components-002.png)

## Installation and initial build

In macOS or a linux distribution like Ubuntu:

Install the latest npm and go 1.11+.

You'll need `make` which on macOS usually means installing iCode.

	git clone git@github.com:cowpaths/web-embed-lab.git
	cd web-embed-lab/fe/
	npm install
	# lots of npm output here
	cd ..
	make
	# lots of make output here
	# there should be several binaries in web-embed-lab/go/bin/

## First run of the colluder to generate certs

	cd web-embed-lab/
	./go/bin/colluder

On first run you should see a note about creating certificates. These certs are set to expire a month from creation just so that they don't hang around forever. So, you'll need to delete them on occasion and then re-install them into your browser.

## Install certificates into your browser

The HTTP proxy run by the colluder needs certificate authority (CA) so that it can hijack TLS connections so you'll need to install the CA cert into your browser. If you don't do this then the browser will reject the proxied connection saying that the security certificate is invalid.

Assuming that you successfully ran the colluder the first time (above), you should have certificate PEM files in web-embed-lab/certs/.

To add the CA cert to Firefox:
- Navigate to "about:preferences#privacy" to open privacy prefs
- Scroll down to the bottom of the page to the "Certificates" section
- Click "View Certificates..."
- Click the "Authories" tab (will mysteriously fail in other tabs!)
- Click "Import..." and use the file dialog to open `web-embed-labs/certs/ca-cert.pem` (you can ignore the other PEM files)
- Check both checkboxes to trust the cert to ID websites and emails
- Click "OK"

Now the Web Embed Lab certificate should show up toward the bottom of the list of CA certs.

## Set your browser to use the colluder HTTP proxy

In order to capture all of the network traffic for a browsing session the colluder needs to be set up as the browser's network proxy.

To set up the HTTP proxy in Firefox:
- Navigate to "about:preferences#general" to open general prefs
- Scroll to the bottom of the page to the "Network Settings" section
- Click the "Settings..." button to open the connection settings
- Choose "Manual proxy configuration"
- Set the proxy host for every protocol to `localhost` (not 127.0.0.1 because the certs won't work)
- Set each proxy port to 8080
- Choose SOCKS_v5

You probably want to close all of the tabs other than the one you're using to browse the captured page so that the colluder doesn't capture unrelated network traffic.

## Load the Formulator WebExtension

The colluder is controlled and monitored by a WebExtension called the "Formulator" (working title). The WebExtension installs a dev-panel next to the usual Javascript console, network monitor, debugger, etc.

To load the Formulator in Firefox:
- Navigate to "about:debugging"
- Tick the checkbox for "Enable add-on debugging"
- Click "Load Temporary Add-on"
- Use the file chooser to open `web-embed-labs/fe/src/formulator/manifest.json`

You should now see the Formulator listed in the "Temporary Extensions" section of the debugging page.

## Capture a session

- Navigate to the target page
- Open the Javascript console, then choose the "Formulator" tab to open the dev-panel
- Wait until the Formulator state is "WebSockets: open" and "Capturing: false"
- Click "Toggle Capture"
- Wait until the Formulator state is "Capturing: true"
- Trigger a full reload (cmd-shift-r or ctrl-shift-r) and wait until it finishes
- Browse to any other pages you want to capture (if any)
- Click "Toggle Capture" and wait until the Formulator state is "Capturing: false"
- On the command line running the colluder you should see a message about writing a timeline to a specific directory like `captures/2019-2-11-5C61FB4E-223B/`

## Generate an initial page formula

Now that you've captured a session you can convert it into a page formula. Take the directory name from the colluder output (like `captures/2019-2-11-5C61FA80-17D8`) and use it as a parameter to the `formulate` command line tool:

	cd web-embed-lab/
	mkdir ../formulas/ # Make a dir to hold the generated formula
	./go/bin/formulate ./captures/2019-2-11-5C61FA80-17D8/ ../formulas/some-name/

You should now have an initial page formula in `../formulas/some-name/`. (feel free to pick something more descriptive than "some-name")

## Host the formula

To try your formula via a browser, use the `runner` command line tool:

	cd web-embed-labs/
	./go/bin/runner ../formulas/ ./examples/test-probes/
	# Output should tell you which formula is hosted, like "some-name" that we used above

The second parameter, `../formulas/` is the parent directory of the page formula you created in the last step.

(Don't include "some-name" in the command. The runner will eventually be able to switch between formulas but for now it just loads the first formula in alphabetical order.)

The third parameter, `./examples/test-probes/`, points at a directory with JS for a few example test probes.

Point your browser at https://localhost/ (HTTPS and no port) and you should see the hosted page formula.

In the `runner` console output you should see any go template errors (usually from the page including template commands like `{{something}}`) or 404s. The formulator does its best but there is manual work involved with getting most page formulas cleaned up.

## Run test probes

Once you're looking at a hosted page formula (see above) you can run the test probes from the javascript console as if they were being called via Selenium.

In the javascript console, look at the `window.__welProbes` JS object to find which probes are loaded. There should be at least `dom-shape` and `exception` probes.

To run a probe:

	results = {}
	window.__welProbes["dom-shape"].probe(results)
	console.log(results)

The results object has test result key:value pairs.

Take a look in `web-embed-lab/examples/test-probes/` to see how probes are coded.



