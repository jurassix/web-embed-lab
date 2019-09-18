# Collusion

When capturing a web session (usually when running the `auto-formulat` or `colluder` commands) the WEL needs to capture every request and response made by a browser. To do this it runs an HTTP forward proxy that captures all of the transferred meta-data and response bodies into a [timeline.json](CAPTURE_SYNTAX.md) file. This information is then used to "freeze-dry" a web session into a page formula for repeatable use by the `runner` command.

## HTTPs termination and tunneling using `ngrok`

The colluder's HTTP forward proxy needs a network endpoint on the public web in order for the Selenium-controlled browser to find it. The WEL uses [ngrok](https://ngrok.com/) to tunnel from ngrok's public network back to the locally-running proxy port. ngrok also terminates TLS with a valid certificate when necessary.

The WEL `colluder` and `auto-formulate` command call ngrok and automatically use the dynamically created ngrok.io hostname so there's no need to run it manually.

## WebSocket control channel

The colluder service exposes a WebSocket endpoint that allows either the Formulator WebExtension (below) or the `auto-formulate` command to control the beginning and end of capture sessions. This allows the colluder to capture several target sites without starting a new process.

You can see the definitions of each control message in the [parser source](https://github.com/cowpaths/web-embed-lab/blob/master/go/src/wel/services/colluder/ws/messages.go#L12).

## Static files

The colluder depends on files built during the `fe` of building with `make`. Those files end up in the `web-embed-lab/fe/dist/` directory. One of the [environment variables](ENVIRONMENT_VARS.md) (FRONT_END_DIST) needed to run WEL commands specifies the fully qualified path to that directory.

## Formulator WebExtension

If you're not using `auto-formulate` (usually during development on the WEL itself) you can install a handy web extension that will give you colluder status information as well as session control.

To install the Formulator WebExtension follow the instructions in the "[Load the Formulator WebExtension](CAPTURE_LOCALLY.md#load-the-formulator-webextension)" section of the ["capture locally"](CAPTURE_LOCALLY.md) document.

## Further reading
- [Colluder service source code](https://github.com/cowpaths/web-embed-lab/blob/master/go/src/wel/services/colluder/colluder.go)
