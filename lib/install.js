/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');
const npmInstall = require('./npm-install');

function removeNodeModules() {
  logger.info('Removing node_modules...');
  return fs.remove('node_modules');
}

function install() {
  return removeNodeModules()
    .then(npmInstall());
}

module.exports = install;
