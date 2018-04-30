/*jshint node: true*/
'use strict';

const path = require('path');
const glob = require('glob');
const logger = require('@blackbaud/skyux-logger');

/**
 * Returns results of glob.sync from specified directory and our glob pattern.
 * @param {string} dir
 * @returns {Array} Array of matching patterns
 */
function getGlobs(dirs) {
  let globs = [];

  const globPattern = '/skyux-builder*/package.json';
  dirs.forEach(dir => {
    const joined = path.join(dir, globPattern);
    globs = globs.concat(glob.sync(joined));
  });
  if (globs.length === 0) {
    fatal(`No files found for glob ${globPattern}. Have you ran "npm install"?`);
  }

  return globs;
}

/**
 * Only log a message if verbose is enabled.
 * @param {boolean} verbose
 * @param {string} msg
 */
function log(isVerbose, msg) {
  if (isVerbose) {
    logger.info(msg);
  }
}

/**
 * Log fatal error and exit
 * @param {string} msg
 */
function fatal(msg) {
  logger.error(msg);
  process.exit(1);
}

function invokeCommand(argv) {
  let verbose = argv.verbose;
  let command = argv._[0];

  // Look globally and locally for matching glob pattern
  const dirs = [
    `${process.cwd()}/node_modules/*`, // local (where they ran the command from)
    `${__dirname}/..`,  // global, if scoped package (where this code exists)
    `${__dirname}/../..`, // global, if not scoped package
  ];

  let modulesCalled = {};

  getGlobs(dirs).forEach(pkg => {
    const dirName = path.dirname(pkg);
    let pkgJson = {};
    let module;

    try {
      module = require(dirName);
      pkgJson = require(pkg);
    } catch (err) {
      log(verbose, `Error loading module: ${pkg}`);
    }

    if (module && typeof module.runCommand === 'function') {
      const pkgName = pkgJson.name || dirName;

      if (modulesCalled[pkgName]) {
        log(verbose, `Multiple instances found. Skipping passing command to ${pkgName}`);
      } else {
        log(verbose, `Passing command to ${pkgName}`);
        module.runCommand(command, argv);
        modulesCalled[pkgName] = true;
      }
    }
  });

  if (Object.keys(modulesCalled).length === 0) {
    fatal(`No module found for ${command}`);
  }
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

  switch (command) {
    case 'version':
      require('./lib/version').logVersion(argv);
      break;
    case 'new':
      require('./lib/new')(argv);
      break;
    case 'help':
    case undefined:
      require('./lib/help')(argv);
      break;
    default:
      logger.info(`SKY UX processing command ${command}`);
      invokeCommand(argv);
      break;
  }

}

module.exports = processArgv;
