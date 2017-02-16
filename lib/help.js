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
`);

}

module.exports = getHelp;
