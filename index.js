/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const logger = require('@blackbaud/skyux-logger');

/**
 * Returns results of glob.sync from specified directory and our glob pattern.
 * @returns {Array} Array of matching patterns
 */
function getGlobs() {

  // Look globally and locally for matching glob pattern
  const dirs = [
    `${process.cwd()}/node_modules/`, // local (where they ran the command from)
    `${__dirname}/..`,  // global, if scoped package (where this code exists)
    `${__dirname}/../..`, // global, if not scoped package
  ];

  let globs = [];

  dirs.forEach(dir => {
    const legacyPattern = path.join(dir, '*/skyux-builder*/package.json');
    const newPattern = path.join(dir, '@skyux-sdk/builder*/package.json');

    logger.verbose(`Looking for modules in ${legacyPattern} and ${newPattern}`);

    globs = globs.concat([
      ...glob.sync(legacyPattern),
      ...glob.sync(newPattern)
    ]);
  });

  return globs;
}

/**
 * Iterates over the given modules.
 * @param {string} command
 * @param {Object} argv
 * @param {Array} globs
 * @returns {Array} modulesAnswered
 */
function getModulesAnswered(command, argv, globs) {
  let modulesCalled = {};
  let modulesAnswered = [];

  globs.forEach(pkg => {
    const dirName = path.dirname(pkg);
    let pkgJson = {};
    let module;

    try {
      module = require(dirName);
      pkgJson = require(pkg);
    } catch (err) {
      logger.verbose(`Error loading module: ${pkg}`);
    }

    if (module && typeof module.runCommand === 'function') {
      const pkgName = pkgJson.name || dirName;

      if (modulesCalled[pkgName]) {
        logger.verbose(`Multiple instances found. Skipping passing command to ${pkgName}`);
      } else {
        logger.verbose(`Passing command to ${pkgName}`);

        modulesCalled[pkgName] = true;
        if (module.runCommand(command, argv)) {
          modulesAnswered.push(pkgName);
        }

      }
    }
  });

  return modulesAnswered;
}

/**
 * Log fatal error and exit.
 * This method is called even for internal commands.
 * In those cases, there isn't actually an error.
 * @param {string} command
 * @param {boolean} isInternalCommand
 */
function invokeCommandError(command, isInternalCommand) {

  if (isInternalCommand) {
    return;
  }

  const cwd = process.cwd();
  logger.error(`No modules found for ${command}`);

  if (cwd.indexOf('skyux-spa') === -1) {
    logger.error(`Are you in a SKY UX SPA directory?`);
  } else if (!fs.existsSync('./node_modules')) {
    logger.error(`Have you ran 'npm install'?`);
  }

  process.exit(1);
}

/**
 * search for a command in the modules and invoke it if found. If not found,
 * log a fatal error.
 * @param {string} command
 * @param {Object} argv
 * @param {boolean} isInternalCommand
 */
function invokeCommand(command, argv, isInternalCommand) {

  const globs = getGlobs();

  if (globs.length === 0) {
    return invokeCommandError(command, isInternalCommand);
  }

  const modulesAnswered = getModulesAnswered(command, argv, globs);
  const modulesAnsweredLength = modulesAnswered.length;

  if (modulesAnsweredLength === 0) {
    return invokeCommandError(command, isInternalCommand);
  }

  const modulesAnsweredPlural = modulesAnsweredLength === 1 ? 'module' : 'modules';

  logger.verbose(
    `Successfully passed ${command} to ${modulesAnsweredLength} ${modulesAnsweredPlural}:`
  );
  logger.verbose(modulesAnswered.join(', '));
}

/**
 * Determines the correct command based on the argv param.
 * @param {Object} argv
 */
function getCommand(argv) {
  let command = argv._[0] || 'help';

  // Allow shorthand "-v" for version
  if (argv.v) {
    command = 'version';
  }

  // Allow shorthand "-h" for help
  if (argv.h) {
    command = 'help';
  }

  return command;
}

/**
 * Processes an argv object.
 * Reads package.json if it exists.
 * @name processArgv
 * @param [Object] argv
 */
function processArgv(argv) {
  let command = getCommand(argv);
  let isInternalCommand = true;

  logger.info(`SKY UX processing command ${command}`);

  switch (command) {
    case 'version':
      require('./lib/version').logVersion(argv);
      break;
    case 'new':
      require('./lib/new')(argv);
      break;
    case 'help':
      require('./lib/help')(argv);
      break;
    case 'install':
      require('./lib/install')(argv);
      break;
    default:
      isInternalCommand = false;
  }

  invokeCommand(command, argv, isInternalCommand);
}

module.exports = processArgv;
