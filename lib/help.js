/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const path = require('path');

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

  console.log(`
SKY UX App Builder (${version})
Usage: skyux [command] [options]
`);

  console.log(getHelpTopic(argv._[1]));
}

module.exports = getHelp;
