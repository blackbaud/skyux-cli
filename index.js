/*jshint node: true*/
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Iterates object's devDependencies to find applicable modules.
 * @name getModules
 * @returns [module[]] modules
 */
const getModules = (packageJson) => {
  let modules = [];

  if (packageJson.devDependencies) {
    for (let d in packageJson.devDependencies) {
      if (/(.*)-sky-pages-out-(.*)/gi.test(d)) {
        modules.push(require(path.join(process.cwd(), 'node_modules', d)));
      }
    }
  }

  return modules;
};

/**
 * Iterates an array of modules.
 * Executes the requested method if it exists.
 * @name runCommand
 * @returns null
 */
const runCommand = (modules, command, argv) => {
  modules.forEach((module) => {
    if (typeof module.runCommand === 'function') {
      module.runCommand(command, argv);
    }
  });
};

/**
 * Processes an argv object.
 * Reads package.json if it exists.
 * @name processArgv
 * @param [Object] argv
 */
const processArgv = (argv) => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let command = argv._[0];

  if (argv.v) {
    command = 'version';
  }

  switch (command) {
    case 'version':
      require('./lib/version')(argv);
      break;
    case 'new':
      require('./lib/new')(argv);
      break;
  }

  if (fs.existsSync(packageJsonPath)) {
    const modules = getModules(require(packageJsonPath));
    runCommand(modules, command, argv);
  }
};

module.exports = processArgv;
