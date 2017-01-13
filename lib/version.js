/*jshint node: true*/
'use strict';

const path = require('path');
const logger = require('winston');

/**
 * Displays the current version.
 * @name getVersion
 */
function getVersion() {
  const packageJson = require(path.resolve(__dirname, '..', 'package.json'));
  return packageJson.version;
}

/**
 * Logs the current version.
 * @name logVersion
 */
function logVersion() {
  logger.info(`skyux-cli: ${getVersion()}`);
}

module.exports = {
  getVersion: getVersion,
  logVersion: logVersion
};
