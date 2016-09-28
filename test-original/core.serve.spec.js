/*jshint jasmine: true, node: true*/
'use strict';

let wasOpenCalled = false;
const mock = require('mock-require');
mock('open', function(url) {
  wasOpenCalled = true;
});

const serve = require('../lib/core/serve');
const serveConfig = require('../lib/webpack/serve.config');
const logger = require('winston');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

describe('sky-pages serve', () => {
  beforeAll(() => {
    spyOn(logger, 'info');
    spyOn(logger, 'error');
  });

  it('should execute serve and append refresh prefix', () => {
    spyOn(serveConfig, 'getWebpackConfig').and.returnValue({
      entry: {
        'app': ['app.js']
      },
      devServer: {
        port: 1337
      }
    });
    const spyWebpackDevServer = function (compiler, config) {
      return {
        listen: function (port, cb) {
          expect(serveConfig.getWebpackConfig().entry.app.length).toBe(2);
        }
      };
    };
    serve({}, webpack, spyWebpackDevServer);
  });

  it('should execute serve without opening url', function (done) {
    const stats = {
      toJson: function () {
        return {
          errors: [],
          warnings: []
        };
      }
    };
    const spyWebpack = function (config) {
      return {
        plugin: function (eventName, cb) {
          if (eventName === 'done') {
            logger.info.calls.reset();
            cb(stats);
            expect(wasOpenCalled).toEqual(true);
            logger.info.calls.reset();
            done();
          }
        }
      };
    };
    const spyWebpackDevServer = function (compiler, config) {
      return {
        listen: function (port, cb) {
          cb();
        }
      };
    };
    serve({}, spyWebpack, spyWebpackDevServer);
  });

  it('should handle the done event once', function (done) {
    const stats = {
      toJson: function () {
        return {
          errors: [],
          warnings: []
        };
      }
    };
    const spyWebpack = function (config) {
      return {
        plugin: function (eventName, cb) {
          if (eventName === 'done') {
            logger.info.calls.reset();
            cb(stats);
            cb(stats);
            expect(logger.info.calls.count()).toEqual(1);
            logger.info.calls.reset();
            done();
          }
        }
      };
    };
    const spyWebpackDevServer = function (compiler, config) {
      return {
        listen: function (port, cb) {
          cb();
        }
      };
    };
    serve({ _: [], noAutoOpen: true }, spyWebpack, spyWebpackDevServer);
  });

  it('should handle no server errors', function (done) {
    const spyWebpackDevServer = function (compiler, config) {
      return {
        listen: function (port, cb) {
          cb();
          expect(logger.error).not.toHaveBeenCalled();
          done();
        }
      };
    };
    serve({}, webpack, spyWebpackDevServer);
  });

  it('should handle server errors', function (done) {
    const spyWebpackDevServer = function (compiler, config) {
      return {
        listen: function (port, cb) {
          const err = 'MY-KNOWN-ERROR';
          cb(err);
          expect(logger.error).toHaveBeenCalledWith(err);
          done();
        }
      };
    };
    serve({}, webpack, spyWebpackDevServer);
  });

});
