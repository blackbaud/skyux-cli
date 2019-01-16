/*jshint node: true*/
'use strict';

const fs = require('fs-extra');
const logger = require('@blackbaud/skyux-logger');
const npmInstall = require('./npm-install');

const settings = {
  stdio: logger.logLevel === 'verbose' ? 'inherit' : 'ignore'
};

function removeNodeModules() {
  const message = logger.promise('Remove node_modules.');

  return fs.remove('node_modules')
    .then(() => message.succeed())
    .catch(err => {
      message.fail();
      logger.error(err);
    });
}

function install() {
  return removeNodeModules()
    .then(() => npmInstall(settings));
}

module.exports = install;
