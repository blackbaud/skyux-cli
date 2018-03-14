/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const logger = require('@blackbaud/skyux-logger');

function getFilename(topic) {
  return path.resolve(__dirname, '../topics/' + topic + '.txt');
}

/**
 * Returns the corresponding help text for a given topic.
 */
function getHelpTopic(topic) {

  let filename = getFilename(topic);
  if (!fs.existsSync(filename)) {
    filename = getFilename('help');
  }

  return fs.readFileSync(filename).toString();
}

/**
 * Displays the help information.
 * @name getHelp
 */
function getHelp(argv) {
  const version = require('./version').getVersion();

  logger.info(`
***********************************************************************
* SKY UX App Builder ${version}                                       *
* Usage: skyux [command] [options]                                    *
* Help: skyux help or skyux help [command]                            *
* https://developer.blackbaud.com/skyux2/learn/reference/cli-commands *
***********************************************************************
`);

  logger.info(getHelpTopic(argv._[1]));

}

module.exports = getHelp;
