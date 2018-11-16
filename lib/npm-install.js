/*jshint node: true*/
'use strict';

const logger = require('@blackbaud/skyux-logger');
const spawn = require('cross-spawn');

/**
 * Runs npm install for a specific package
 * @name npmInstall
 */
function npmInstall(settings) {
  logger.info('Running npm install');

  const installArgs = {
    stdio: 'inherit'
  };

  if (settings && settings.path) {
    installArgs.cwd = settings.path;
  }

  const npmProcess = spawn('npm', ['install'], installArgs);

  return new Promise((resolve, reject) => {
    npmProcess.on('exit', (code) => {
      if (code !== 0) {
        reject('npm install failed.');
        return;
      }

      resolve();
    });
  });
}

module.exports = npmInstall;
