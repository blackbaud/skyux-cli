/*jshint node: true*/
'use strict';

const fs = require('fs');
const open = require('open');
const path = require('path');
const util = require('util');
const logger = require('winston');
const serveConfig = require('../webpack/serve.config');
const packageJson = require('../../package.json');

let onCompileDoneOnce;
let noAutoOpen;
let url;

/**
 * Handler for server listen.
 * @name onServerListen
 * @param {Object} err
 */
const onServerListen = (err) => {
  if (err) {
    logger.error(err);
  }
};

/**
 * Handler for compiler done.
 * @name onCompilerDone
 * @param {Object} stats
 */
const onCompilerDone = (stats) => {
  if (onCompileDoneOnce) {
    return;
  }

  const config = serveConfig.getWebpackConfig();
  logger.info('Local instance available at ' + url);
  onCompileDoneOnce = true;

  if (!noAutoOpen) {
    const assets = JSON.stringify(stats.toJson().assetsByChunkName || {});
    const encoded = new Buffer(assets).toString('base64');
    const host = util.format(
      '%s?%s=%s',
      config.STACHE.host.url,
      config.STACHE.host.qsKey,
      encoded
    );
    // DISABLING UNTIL HOST IS READY
    // open(host);
    open(url);
  }
};

/**
 * Executes the serve command.
 * @name serve
 */
const serve = (argv, webpack, WebpackDevServer) => {

  const config = serveConfig.getWebpackConfig();
  url = util.format('https://localhost:%s', config.devServer.port);
  noAutoOpen = argv.noAutoOpen;
  onCompileDoneOnce = false;

  // Support inline webpack-dev-server
  for (let entry in config.entry) {
    config.entry[entry].unshift('webpack-dev-server/client?' + url);
  }

  const compiler = webpack(config);
  const server = new WebpackDevServer(compiler, config.devServer);

  logger.verbose(config);
  compiler.plugin('done', onCompilerDone);
  server.listen(config.devServer.port, onServerListen);
};

module.exports = serve;
