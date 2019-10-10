# Environment variables

There are a few common pieces of information needed when using the WEL command line tools so they're read as environment variables:

`BROWSERSTACK_USER` and `BROWSERSTACK_API_KEY` are used to authenticate with Browserstack. Once you have an account you can find your info in the "Automate" section of your [browserstack account page](https://www.browserstack.com/accounts/settings).   

`FRONT_END_DIST` holds the path to the `dist` directory created by `make fe`. When running from a clone of the web-embed-lab repo you probably want it to be `./fe/dist/`. When running via the node you probably want `./node_modules/web-embed-lab/static/`.

## Setup using dotenv

Outside of using npm config variables (below) the easiest way to set and forget environment variables is to create a "dotenv" file named `.env` in the directory where you run the commands.

	cp dotenv.example .env
	# Edit .env to enter your values

When a WEL command runs it looks in the current working directory for a `.env` file. The values it finds in that file will be used to set environment variables if they don't already exist when the command runs.

# Setup using node package config

The WEL commands will also look for the environment variables set by node for each configuration value.

Example package.json config:

	"config" : {
		"browserstackUser": "YOUR USERNAME",
		"browserstackApiKey" : "YOUR KEY",
	}

If you would like to set the "front end dist" directory to something other than the default (`./node_modules/web-embed-lab/static/`) then you can add:

	"frontEndDist": "/path/to/dist/..."

# Setup using a shell script

If you'd prefer to set the process env variables directly, see the [example bash script, setup-env.sh.example](../examples/setup-env.sh.example) for an example and instructions.
