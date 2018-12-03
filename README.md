# Web Embed Lab

The Web Embed Lab provides tools for testing that a specific version of an embeded script does not negatively effect the web page in which it is embedded.

Examples of embedded scripts are:
- Third party analytics like Google Analytics 
- Social media integrations like Twitter or Facebook's
- Continuous integration / testing status scripts like [Coveralls](https://coveralls.io/)

The WEL works in two phases: test development and test running.

**For developing tests** the WEL provides a WebExtension and a forward HTTP proxy that collude to gather information about a web page's resources and network patterns. You use these tools to capture an initial "page forumula" of your web site that will  be used to repeatedly and reliably test an embed script's behavour. In this phase you'll also write your tests and choose which browsers to support.

**For running tests** the WEL provides a runner binary that hosts your page formulas and test probes. This is run in a container in a continuous integration system like CircleCI and calls out to a WebDriver-based browser testing host like Browserstack.

![Overview diagram](https://fullstory.github.io/web-embed-lab/images/wel-component-002.png)

