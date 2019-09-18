# Command line tools

This document explains the function of each command how to get their command line parameters.

As described in the [installation](INSTALLATION.md) document, you'll need to set up a few environment variables before running WEL commands. The commands will complain and quit if they don't find them so be sure to do that first.

Each command will print helpful information about their parameters (with examples) if you run the commands with no parameters.

The examples usually refer to files in `web-embed-lab/examples/` so you can just cut and paste those parameters to test the command in action.

Example:

	Ardra:Code trevor$ cd web-embed-lab/
	Ardra:web-embed-lab trevor$ ./go/bin/auto-formulate
	[auto-formulate] usage:
	[auto-formulate] auto-formulate <configuration json path> <formula destination dir>
	[auto-formulate] Example:
	[auto-formulate] auto-formulate ./examples/auto-formulate/external-auto-formulate.json ../pf/
	[auto-formulate] Error Incorrect arguments
	Ardra:web-embed-lab trevor$

The example printed by `auto-formulate` that refers to `./examples/auto-formulate/external-auto-formulat.json` will, when cut and pasted into your shell, capture a few small sites and then create page formulas from the captures.

## `auto-formulate`

WEL experiments need to host page formulas and the easiest way to create a page formula is to use `auto-formulate`. You can create them by hand (see the (page formula syntax] document](PAGE_FORMULA_SYNTAX.md)) but most of the time people want to capture a live site and then automatically create a page formula. Luckily, that's what `auto-formulate` does.

You can find example configurations in `web-embed-lab/examples/auto-formulate` and the JSON syntax for those files is documented in the [auto-formulate syntax](AUTO_FORMULATE_SYNTAX.md) document.  

## `runner`

Once you have your page formulas, test probes, and an embed script to test then you're ready to use the `runner` to run an experiment.

The [experiment syntax](EXPERIMENT_SYNTAX.md) document explains how to set up an experiment to run.


## `colluder`

If you're working on the WEL itself (so, not using `auto-formulate`) then you can spin up just the colluder on its own using the appropriately named `colluder` command.

Take a look at the [collusion](COLLUSION.md) and [capture locally](CAPTURE_LOCALLY.md) documents for details.

## `formulate`

Similarly to the `colluder` command, the `formulate` command is usually run when you're working on the WEL itself instead of using the generally more useful `auto-formulate` command.

`formulate` reads in a session captured during [collusion](COLLUSION.md) and emits a page formula.

