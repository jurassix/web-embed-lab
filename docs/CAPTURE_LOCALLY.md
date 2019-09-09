# Capture locally

This document describes how to capture web sessions using a local browser. This is useful mostly when you're working on the Web Embed Lab code itself instead of using it to make and run experiments.

Most of the time you'll use `auto-formulate` as described in [experiment development](EXPERIMENT_DEVELOPMENT.md) so head over to that document unless you're working on the Web Embed Lab code.

To capture locally, the WEL provides a WebExtension that you'll run in your web browser and an HTTP proxy that your browser's network traffic will flow through. These two tools work together to gather information about a target web site's resources and network patterns during a browser session.

The end result of a capture will be a directory that holds all of the files the browser loaded over the network and a timeline of which URLs were used to load those files.

### Install certificates into your browser (first time only)

The HTTP proxy run by the colluder needs certificate authority (CA) so that it can listen into network connections so you'll need to install a certificate into your browser. If you don't do this then the browser will reject the proxied connection saying that the security certificate is invalid.

If you followed the [installation instructions](INSTALLATION.md) then you should have certificate PEM files in web-embed-lab/certs/.

To add the CA cert to Firefox:
- Navigate to "about:preferences#privacy" to open privacy prefs
- Scroll down to the bottom of the page to the "Certificates" section
- Click "View Certificates..."
- Click the "Authories" tab (will mysteriously fail in other tabs!)
- Click "Import..." and use the file dialog to open `web-embed-labs/certs/ca-cert.pem` (you can ignore the other PEM files)
- Check both checkboxes to trust the cert to ID websites and emails
- Click "OK"

Now the Web Embed Lab certificate should show up toward the bottom of the list of CA certs.

### Set your browser to use the colluder HTTP proxy

In order to capture all of the network traffic for a capture session the colluder needs to be set up as the browser's network proxy.

To set up the HTTP proxy in Firefox:
- Navigate to "about:preferences#general" to open general prefs
- Scroll to the bottom of the page to the "Network Settings" section
- Click the "Settings..." button to open the connection settings
- Choose "Manual proxy configuration"
- Set the proxy host for every protocol to `localhost` (not 127.0.0.1 because the certs won't work)
- Set each proxy port to 8080
- Choose SOCKS_v5

You probably want to close all of the tabs other than the one you're using to browse the target page so that the colluder doesn't capture unrelated network traffic.

### Load the Formulator WebExtension

The colluder is controlled and monitored by a WebExtension called the "Formulator". The WebExtension installs a developer panel next to the usual Javascript console, network monitor, debugger, etc.

To load the Formulator in Firefox:
- Navigate to "about:debugging"
- Click "Load Temporary Add-on"
- Use the file chooser to open `web-embed-labs/fe/src/formulator/manifest.json`

You should now see the Formulator listed in the "Temporary Extensions" section of the debugging page.

### Capture a session

- Launch the Colluder
  
	cd web-embed-lab/
	./go/bin/colluder

- Navigate to the target page
- Open the Javascript console, then choose the "Formulator" tab to open the dev-panel
- Wait until the Formulator state is "WebSockets: open" and "Capturing: false"
- Click "Toggle Capture"
- Wait until the Formulator state is "Capturing: true"
- Trigger a full reload (cmd-shift-r or ctrl-shift-r) and wait until it finishes
- Browse to any other pages you want to capture (if any)
- Click "Toggle Capture" and wait until the Formulator state is "Capturing: false"
- On the command line running the colluder you should see a message about writing a timeline to a specific directory like `captures/2019-2-11-5C61FB4E-223B/`

## Drafting an initial page formula

Now that you've captured a browsing session (above) you will use a command line tool to draft an initial page formula.

Take the directory name from the colluder output (like `captures/2019-2-11-5C61FA80-17D8`) and use it as a parameter to the `formulate` command line tool:

	cd web-embed-lab/
	mkdir ../formulas/ # Make a dir to hold the generated formula
	./go/bin/formulate ./captures/2019-2-11-5C61FA80-17D8/ ../formulas/some-name/

You should now have an initial page formula in `../formulas/some-name/`. (feel free to pick something more descriptive than "some-name")

Now that you have a page formula (the hard way), head over to [experiment development](EXPERIMENT_DEVELOPMENT.md) to see how to finish the process.
