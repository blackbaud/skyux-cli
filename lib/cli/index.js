/*jshint node: true*/
'use strict';

const build = require('../core/build');
const serve = require('../core/serve');
const version = require('../core/version');
const logger = require('winston');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

/**
 * Processes an argv object
 * @name processArgv
 */
const processArgv = (argv) => {
  switch (argv._[0]) {
    case 'build':
      return build(argv, webpack);
    case 'serve':
      return serve(argv, webpack, WebpackDevServer);
    case 'version':
      logger.info(version(argv));
      break;
    default:
      logger.error('Please provide a known command.');
      break;
  }
};

module.exports = processArgv;
