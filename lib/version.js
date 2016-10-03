/*jshint node: true*/
'use strict';

const path = require('path');
const logger = require('winston');

/**
 * Displays the current version.
 * @name getVersion
 */
const getVersion = () => {
  const packageJson = require(path.resolve(__dirname, '..', 'package.json'));
  logger.info('sky-pages-cli: %s', packageJson.version);
  return packageJson.version;
};

module.exports = getVersion;
