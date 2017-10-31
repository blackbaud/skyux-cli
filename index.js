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
    const joined = path.join(dir, '/skyux-builder*/package.json');
    globs = globs.concat(glob.sync(joined));
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

  let verbose = argv.verbose;
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
      verbose = true;
      require('./lib/version').logVersion(argv);
      break;
    case 'new':
      require('./lib/new')(argv);
      break;
    case 'help':
    case undefined:
      verbose = true;
      require('./lib/help')(argv);
      break;
    default:
      logger.info(`SKY UX processing command ${command}`);
      break;
  }

  // Look globally and locally for matching glob pattern
  const dirs = [
    `${process.cwd()}/node_modules`, // local (where they ran the command from)
    `${__dirname}/..`,  // global, if scoped package (where this code exists)
    `${__dirname}/../..`, // global, if not scoped package
  ];

  getGlobs(dirs).forEach(pkg => {
    const dirName = path.dirname(pkg);
    let pkgJson = {};
    let module;

    try {
      module = require(dirName);
      pkgJson = require(pkg);
    } catch (err) {
      if (verbose) {
        logger.info(`Error loading module: ${pkg}`);
      }
    }

    if (module && typeof module.runCommand === 'function') {
      if (verbose) {
        const pkgName = pkgJson.name || dirName;
        logger.info(`Passing command to ${pkgName}`);
      }

      module.runCommand(command, argv);
    }
  });

}

module.exports = processArgv;
