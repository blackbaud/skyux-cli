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

    if (modules.length === 0) {
      fatal(`Your package.json contains no matching dependencies`);
    }

  } else {
    fatal('package.json contains no devDependencies');
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
  let answered = false;

  modules.forEach((module) => {
    if (typeof module.runCommand === 'function') {
      if (module.runCommand(command, argv)) {
        answered = true;
      }
    } else {
      logger.warn('Found matching module without exposed runCommand - %s', module);
    }
  });

  return answered;
}

/**
 * Invokes any matching modules.
 * @param {string} command
 * @param {object} argv
 * @param {boolean} displayError
 * @returns null
 */
function invokeModules(command, argv, displayError) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (fs.existsSync(packageJsonPath)) {
    const modules = getModules(require(packageJsonPath));
    const answered = runCommand(modules, command, argv);

    if (!answered && displayError) {
      fatal('Unknown command.');
    }

  } else if (displayError) {
    fatal('No package.json file found in current working directory.');
  }
}

/**
 * Display an error message and set the exit code.
 * @param {string} msg
 */
function fatal(msg) {
  logger.error(msg);
  process.exit(1);
}

/**
 * Processes an argv object.
 * Reads package.json if it exists.
 * @name processArgv
 * @param [Object] argv
 */
function processArgv(argv) {

  let command = argv._[0];

  // Allow shorthand "-v" for version
  if (argv.v) {
    command = 'version';
  }

  // Allow shorthand "-h" for help
  if (argv.h) {
    command = 'help';
  }

  // Help and version commands are answered here AND passed through
  // They won't however cause errors if unanswered.
  switch (command) {
    case 'version':
      require('./lib/version').logVersion(argv);
      invokeModules(command, argv, false);
      break;
    case 'new':
      require('./lib/new')(argv);
      break;
    case 'help':
    case undefined:
      require('./lib/help')(argv);
      invokeModules(command, argv, false);
      break;
    default:
      logger.info('SKY UX processing command %s', command);
      invokeModules(command, argv, true);
      break;
  }
}

module.exports = processArgv;
