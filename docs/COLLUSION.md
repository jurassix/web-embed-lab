# Collusion

When capturing a web session (usually when running the `auto-formulat` or `colluer` commands) the WEL needs to capture every request and response made by a browser. To do this it runs an HTTP forward proxy that captures all of the transferred data into files and meta-data into a [timeline.json](CAPTURE_SYNTAX.md) file. This information is then used to "freeze-dry" a web session into a page formula for repeatable use by the `runner` command.

## HTTPs termination and tunneling using `ngrok`

TBD

## WebSocket control channel

TBD

## Formulator WebExtension

TBD
