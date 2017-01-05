/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('winston');

/**
 * Iterates object's devDependencies to find applicable modules.
 * @name getModules
 * @returns [module[]] modules
 */
function getModules(packageJson) {
  let modules = [];

  if (packageJson.devDependencies) {
    for (let d in packageJson.devDependencies) {
      /* istanbul ignore else */
      if (/(.*)skyux-builder(.*)/gi.test(d)) {
        modules.push(require(path.join(process.cwd(), 'node_modules', d)));
      }
    }
  } else {
    logger.info('package.json contains no devDependencies');
  }

  return modules;
}

/**
 * Iterates an array of modules.
 * Executes the requested method if it exists.
 * @name runCommand
 * @returns null
 */
function runCommand(modules, command, argv) {
  modules.forEach((module) => {
    if (typeof module.runCommand === 'function') {
      module.runCommand(command, argv);
    } else {
      logger.warn('Found matching module without exposed runCommand - %s', module);
    }
  });
}

/**
 * Processes an argv object.
 * Reads package.json if it exists.
 * @name processArgv
 * @param [Object] argv
 */
function processArgv(argv) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let command = argv._[0];
  let passToModules = true;

  // Allow shorthand "-v" for version
  if (argv.v) {
    command = 'version';
  }

  switch (command) {
    case 'version':
      require('./lib/version')(argv);
      break;
    case 'new':
      require('./lib/new')(argv);
      passToModules = false;
      break;
    default:
      logger.info('SKY Pages processing command %s', command);
      break;
  }

  // CLI handles new command without passing through to modules
  if (passToModules) {
    if (fs.existsSync(packageJsonPath)) {
      const modules = getModules(require(packageJsonPath));
      runCommand(modules, command, argv);
    } else {
      logger.info('No package.json file found in current working directory.');
    }
  }

}

module.exports = processArgv;
