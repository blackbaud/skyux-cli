/*jshint jasmine: true, node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const mock = require('mock-require');
const serve = require('../lib/webpack/serve.config');

describe('stache-core webpack serve', () => {
  const nodeModules = path.join(process.cwd(), 'node_modules');
  beforeAll(() => {
    mock(path.join(nodeModules, 'vendor-stache-in-loader'), {
      getStacheConfig: () => {},
      getWebpackConfig: () => {}
    });
    mock(path.join(nodeModules, 'vendor-stache-in-error1'), {
      getWebpackConfig: () => {}
    });
    mock(path.join(nodeModules, 'vendor-stache-in-error2'), {
      getStacheConfig: () => {}
    });
  });

  it('should ignore modules if project has no devDependencies', () => {
    const modules = serve.getModules({});
    expect(modules.length).toBe(0);
  });

  it('should ignore module without matching name', () => {
    const modules = serve.getModules({
      devDependencies: {
        'custom-module-1': '*',
        'custom-module-2': '*'
      }
    });
    expect(modules.length).toBe(0);
  });

  it('should throw error if module is missing getStacheConfig', () => {
    expect(serve.getModules.bind(null, {
      devDependencies: { 'vendor-stache-in-error1': '*' }
    })).toThrow();
  });

  it('should throw error if module is missing getWebpackConfig', () => {
    expect(serve.getModules.bind(null, {
      devDependencies: { 'vendor-stache-in-error2': '*' }
    })).toThrow();
  });

  it('should load module with matching name and interface', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    mock(path.join(process.cwd(), 'package.json'), {
      devDependencies: {
        'vendor-stache-in-loader': '*'
      }
    });
    const modules = serve.getModules({
      devDependencies: {
        'exclude-me': '*',
        'vendor-stache-in-loader': '*'
      }
    });
    expect(modules.length).toBe(1);
  });

  it('should return the default stacheConfig', () => {
    const defaultStacheConfig = serve.getDefaultStacheConfig();
    expect(defaultStacheConfig).toEqual(jasmine.any(Object));
  });

  it('should return the default webpackConfig', () => {
    const defaultWebpackConfig = serve.getDefaultWebpackConfig();
    expect(defaultWebpackConfig).toEqual(jasmine.any(Object));
  });

  it('should return the webpackConfig', () => {
    const webpackConfig = serve.getWebpackConfig();
    expect(webpackConfig).toEqual(jasmine.any(Object));
  });

  it('should return the webpackConfig if package.json does not exist', () => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    const webpackConfig = serve.getWebpackConfig();
    expect(webpackConfig).toEqual(jasmine.any(Object));
  });

});
