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
  help            Displays this help information.
  serve           Serves the current SKY UX application.
  build           Builds the current SKY UX application into dist/.
  test            Runs both the unit and end-to-end tests.
  e2e             Runs the end-to-end tests.
  watch           Runs unit tests and watches file system for changes.

Common Options:
  -l | --launch   Which URL to launch during serve.
                    One of host (default), local, or none.
                    Ex: skyux serve --launch local
`);

}

module.exports = getHelp;
