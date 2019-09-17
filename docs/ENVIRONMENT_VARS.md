# Environment variables

There are a few common pieces of information needed when using the WEL command line tools so they're read as environment variables.

The easiest way to set and forget these is to create a shell script and source it before running commands. See the [example bash script, setup-env.sh.example](https://github.com/cowpaths/web-embed-lab/blob/master/setup-env.sh.example) for and example and instructions.

`BROWSERSTACK_USER` and `BROWSERSTACK_API_KEY` are used to authenticate with Browserstack. Once you have an account you can find your info in the "Automate" section of your [browserstack account page](https://www.browserstack.com/accounts/settings).   

`FRONT_END_DIST` holds the path to the `dist` directory created by `make fe`
