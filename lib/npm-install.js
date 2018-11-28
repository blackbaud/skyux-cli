/*jshint node: true*/
'use strict';

const spawn = require('cross-spawn');
const logger = require('@blackbaud/skyux-logger');

/**
 * Runs npm install for a specific package
 * @name npmInstall
 */
function npmInstall(settings) {
  const message = logger.promise('Running npm install (can take several minutes)');

  const installArgs = {
    stdio: 'inherit'
  };

  if (settings) {
    if (settings.path) {
      installArgs.cwd = settings.path;
    }

    if (settings.stdio) {
      installArgs.stdio = settings.stdio;
    }
  }

  const npmProcess = spawn('npm', ['install'], installArgs);

  return new Promise((resolve, reject) => {
    npmProcess.on('exit', (code) => {
      if (code !== 0) {
        message.fail();
        reject('npm install failed.');
        return;
      }

      message.succeed();
      resolve();
    });
  });
}

module.exports = npmInstall;
