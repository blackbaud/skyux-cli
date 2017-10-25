/*jshint node: true*/
'use strict';

const path = require('path');
const glob = require('glob');
const logger = require('winston');

/**
 * Returns results of glob.sync from specified directory and our glob pattern.
 * @param {string} dir
 * @returns {Array} Array of matching patterns
 */
function getGlobs(dirs) {
  let globs = [];

  dirs.forEach(dir => {
    globs = globs.concat(glob.sync(path.join(dir, '/node_modules/**/*skyux-builder*/package.json')));
  });

  return globs;
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
      logger.info('SKY UX processing command %s', command);
      break;
  }

  // Look globally and locally for matching glob pattern
  const dirs = [
    `${process.cwd()}`, // local (where they ran the command from)
    `${__dirname}/..`   // global (where this code exists)
  ];

  getGlobs(dirs).forEach(pkg => {
    const module = require(path.dirname(pkg));
    if (typeof module.runCommand === 'function') {
      module.runCommand(command, argv);
    } else {
      logger.warn('Found matching module without exposed runCommand - %s', pkg);
    }
  });

}

module.exports = processArgv;
