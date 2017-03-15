/*jshint node: true*/
'use strict';

/**
 * Displays the help information.
 * @name getHelp
 */
function getHelp() {
  const version = require('./version').getVersion();

  console.log(`
SKY UX App Builder (${version})
Usage: skyux [command] [options]

Arguments:
  [command]       The skyux command to execute.
  [options]       Options to pass to the command.

Common Commands:
  new             Initializes a new SKY UX application.
  serve           Serves the current SKY UX application.
  build           Builds the current SKY UX application into dist/.
  test            Runs unit tests.
  e2e             Runs end-to-end tests.
  watch           Runs unit tests and watches the file system for changes.
  version         Returns the version of SKY UX CLI.
  help            Displays help information for SKY UX CLI arguments.

Common Options:
  -l | --launch   Specifies the URL to launch during serve.
                    Possible values are host (default), local, or none.
                    Ex: skyux serve --launch local
  -t | --template Specifies the base template to use when creating a SKY UX application.
                    The value should be the suffix of an existing SKY UX template repo.
                    Ex: provided the repo 'https://github.com/blackbaud/skyux-template-my-team/' exists,
                    type: 'skyux new --template my-team'
`);

}

module.exports = getHelp;
