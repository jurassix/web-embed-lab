# Web Embed Lab

The Web Embed Lab (WEL) provides tools for testing that a specific version of an embedded script does not negatively effect the web page in which it is embedded. Many web sites embed dozens of third party scripts and as a result are often slow to download and slow to render.

This tool helps embedded script writers and web site developers test embedded scripts to identify when there is a problem.

Examples of embedded scripts are:
- [FullStory](https://www.fullstory.com/)'s session capture and playback
- Third party analytics like Google Analytics 
- Social media integrations like Twitter or Facebook's
- Continuous integration / testing status scripts like [Coveralls](https://coveralls.io/)

The WEL works with "experiments" which are bundles of files that hold all of the information required to test specific pages on specific browsers.

Unlike other tools, the WEL is able to capture a remote web site into a "page formula" that never changes and never relies on the original web site. Because of page formulas, experiments can be run with consistent results and without adding load to the original web site.

## Workflow

The usual workflow is to:
- Capture one or more web sites and freeze-dry them into "page formulas"
- Gather page formulas and tests into an "experiment"
- Run an experiment against each new version of an embed script to ensure that it doesn't negatively effect performance

## Further reading

Guides:
- [Install the WEL](./docs/INSTALLATION.md) ⬅️ Start Here!
- [Develop experiments](./docs/EXPERIMENT_DEVELOPMENT.md)
- [Run experiments](./docs/EXPERIMENT_RUNNING.md)

References:
- [Environment variables](./docs/ENVIRONMENT_VARS.md)
- [Command line tools](./docs/COMMAND_LINE_TOOLS.md)
- [Test probe API](./docs/TEST_PROBE_API.md)
- [Site capture and formulation JSON](./docs/AUTO_FORMULATE_SYNTAX.md) (used by `auto-formulate`)
- [Experiment JSON](./docs/EXPERIMENT_SYNTAX.md) (used by `runner`)
- [Page formula JSON](./docs/PAGE_FORMULA_SYNTAX.md)
- [Site capture JSON](./doc/CAPTURE_SYNTAX.md)

## Developing the Web Embed Lab

The WEL is designed to be useful for testing any embed script on any web site but occasionally it's necessary to add or improve features.

Your first step should be to take a look at the [contribution guide](./doc/CONTRIBUTE.md) for the how and whys of adding to the WEL. It's easy to go down a path and realize later that the effect of your efforts could have been multiplied by understanding how contributions work. Don't let that happen to you!

Reference documents:
- [Running locally](./docs/CAPTURE_LOCALLY.md)
- [The colluder proxy and web extension](./docs/COLLUSION.md)

