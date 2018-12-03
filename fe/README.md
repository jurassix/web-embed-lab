# Web Embed Lab: Front End

This directory holds the front-end tools of the [Web Embed Lab](https://github.com/fullstorydev/web-embed-lab).

## Tools used during the creation of page formulas

### Formulator

A WebExtension for developers who are creating new page formulas.

It mostly provides a UI for the page snapper and for information from the target page colluder.

### Target Page Colluder

A content script that is loaded into a target page by the Formulator in order to collect information for page formulas.

### Page Snapper

Code that runs in the WebExtension and works with the target page colluder script and the colluder service to gather information that is useful for drafting page formulas.

## Tools used while running tests

## Test Probe Runner

The script that is loaded into a hosted page formula to run the test probes in an experiment.

*Note:* The page formulas, experiments, and test probes data are stored outside of this repo, usually in a separate git repo.

