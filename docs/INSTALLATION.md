# Web Embed Lab installation and initial build

The WEL will run on a UNIX-ish OS like macOS or Ubuntu. If you're on Windows you can use the Windows Linux Subsystem to host a Linux distribution like Ubuntu.

## Set up environment variables

There are several ways to set up the environment variables that the WEL requires:

- export the environment variables using your shell
- use a dotenv file
- use node's package config variables

If you're building from source then the dotenv file is probably your best bet.

If you're running from the node package then you'll probably want to use packge config variables.

Instructions for each method can be found in the [environment variables](./ENVIRONMENT_VARS.md) document.

Each command checks the environment and will print a helpful message about any missing variables so that it's less annoying to debug those problems.

## Installing for node via npm

The Web Embed Lab is available from npm in the [`web-embed-lab` package](https://www.npmjs.com/package/web-embed-lab).

Example:

	cd dir-containing-your-package.json
	npm install --save-dev web-embed-lab

The `runner` and `auto-formulate` binaries should end up in `node_modules/.bin/` and will be in the PATH for running using `npm run-script ...` commands.

The WEL has a dependency on `ngrok` so that will also be installed in your .bin directory.

To see a minimal example of building and testing an embed script using the WEL and node, take a look at [embed-schmembed](https://github.com/TrevorFSmith/embed-schmembed).

## Prerequisites for building from source

If you are not using the (relatively handy) npm package then you'll need to build from source.

First you'll need [ngrok](https://ngrok.com/download) in your PATH. `ngrok` sets up tunnels and TLS certs for a publicly accessible endpoint and routes traffic to the test runner.

You'll need to install the latest [git](https://git-scm.com/) and [Node](https://nodejs.org/en/download/) (to get npm) as well as [go](https://golang.org/doc/install) 1.11+.

You'll need `make` which on macOS usually means installing iCode. On a Linux distro use the included package manager like yum or apt-get to install `make`.

## Clone and initial build

	git clone git@github.com:cowpaths/web-embed-lab.git
	cd web-embed-lab/fe/
	npm install
	# a lot of npm output here
	cd ..
	make
	# a lot of make output here
	# there should be several binaries in web-embed-lab/go/bin/

## First run of the colluder to generate certificates

During the target site capture process you'll need a few certificates so that the WEL can work with your browser. The first time you run the `colluder` tool it will generate these certificates.

	cd web-embed-lab/
	./go/bin/colluder
	# you should see a message about creating certificates

Use control-c to exit the colluder after it has created the certificates.

These certificates are set to expire a month from creation just so that they don't hang around forever. So, you'll need to delete them on occasion and then re-install them into your browser.

## Next steps

To develop new experiments (capturing page formulas, writing tests, etc) read [Developing experiments](EXPERIMENT_DEVELOPMENT.md).

To run existing experiments read [Running experiments](EXPERIMENT_RUNNING.md).
