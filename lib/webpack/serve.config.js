/*jslint node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const failPlugin = require('webpack-fail-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

/**
 * Loops through a package.json to find applicable modules.
 * @name getModules
 * @returns [module[]] modules
 */
const getModules = (packageJson) => {
  let modules = [];
  if (packageJson.devDependencies) {
    for (let d in packageJson.devDependencies) {
      if (/(.*)-stache-(in|out)-(.*)/gi.test(d)) {
        const loader = require(path.join(process.cwd(), 'node_modules', d));

        if (typeof loader.getStacheConfig !== 'function') {
          throw new Error('%s must implement the getStacheConfig method.', d);
        }

        if (typeof loader.getWebpackConfig !== 'function') {
          throw new Error('%s must implement the getWebpackConfig method.', d);
        }

        modules.push({
          name: d,
          exports: loader
        });
      }
    }
  }

  return modules;
};

/**
 * Returns the default stacheConfig.
 * @name getDefaultStacheConfig
 * @returns {StacheConfig} stacheConfig
 */
const getDefaultStacheConfig = () => ({});

/**
 * Returns the default webpackConfig.
 * @name getDefaultWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getDefaultWebpackConfig = () => {
  const resolves = [
    process.cwd(),
    path.join(process.cwd(), 'node_modules'),
    path.join(__dirname, '..'),
    path.join(__dirname, '..', 'node_modules')
  ];
  return {
    entry: {},
    output: {
      filename: '[name].js',
      chunkFilename: '[id].[chunkhash].chunk.js'
    },
    devServer: {
      port: 31337,
      secure: false,
      colors: true,
      compress: true,
      inline: true,
      historyApiFallback: true,
      stats: 'minimal',
      https: {
        key: fs.readFileSync(path.join(__dirname, '../../ssl/server.key')),
        cert: fs.readFileSync(path.join(__dirname, '../../ssl/server.crt'))
      }
    },
    debug: true,
    devtool: 'cheap-module-eval-source-map',
    resolve: {
      root: resolves
    },
    resolveLoader: {
      root: resolves
    },
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },
      ]
    },
    STACHE: {
      command: 'serve',
      host: {
        url: 'https://blackbaud-shell.azurewebsites.net/',
        qsKey: 'hash'
      }
    },
    plugins: [
      new ProgressBarPlugin(),
      failPlugin
    ]
  };
};

/**
 * Called when loaded via require.
 * @name getWebpackConfig
 * @returns {WebpackConfig} webpackConfig
 */
const getWebpackConfig = () => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let stacheConfig = getDefaultStacheConfig();
  let webpackConfig = getDefaultWebpackConfig();

  // Verify there's a package.json
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath);
    const modules = getModules(packageJson);

    // Build the stacheConfig
    modules.forEach((module) => {
      stacheConfig = merge.smart(stacheConfig, module.exports.getStacheConfig());
    });

    // Build the webpackConfig (passing in stacheConfig)
    modules.forEach((module) => {
      webpackConfig = merge.smart(
        webpackConfig,
        module.exports.getWebpackConfig(stacheConfig)
      );
    });
  }

  // Expose STACHE to front-end
  // Added here instead of the defaults so all webpacks can build object.
  webpackConfig.STACHE.config = stacheConfig;
  webpackConfig.plugins.push(
    new webpack.DefinePlugin({
      'STACHE': JSON.stringify(webpackConfig.STACHE)
    })
  );

  return webpackConfig;
};

// Expose
module.exports = {
  getModules: getModules,
  getDefaultStacheConfig: getDefaultStacheConfig,
  getDefaultWebpackConfig: getDefaultWebpackConfig,
  getWebpackConfig: getWebpackConfig
};
