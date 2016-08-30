/*jshint jasmine: true, node: true*/

const build = require('../lib/core/build');
const buildConfig = require('../lib/webpack/build.config');
const mock = require('mock-require');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

describe('stache-core build', () => {

  const port = 1337;
  beforeAll(() => {
    spyOn(buildConfig, 'getWebpackConfig').and.returnValue({});
  });

  it('should execute build', () => {
    build({}, webpack);
    expect(buildConfig.getWebpackConfig).toHaveBeenCalled();
  });

  it('should handle fatal build error', () => {
    const spyWebpack = function(config) {
      return {
        run: function(cb) {
          cb('ThrowError', {});
        }
      };
    };
    build({}, spyWebpack);
    expect(buildConfig.getWebpackConfig).toHaveBeenCalled();
  });

  it('should handle build error and warning', () => {
    const spyWebpack = function(config) {
      return {
        run: function(cb) {
          cb(null, {
            toJson: function() {
              return {
                errors: [
                  'error'
                ],
                warnings: [
                  'error'
                ]
              };
            }
          });
        }
      };
    };
    build({}, spyWebpack);
    expect(buildConfig.getWebpackConfig).toHaveBeenCalled();
  });

});
