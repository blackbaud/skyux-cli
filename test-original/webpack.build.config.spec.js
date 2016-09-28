/*jshint jasmine: true, node: true*/
'use strict';

const fs = require('fs');
const path = require('path');
const mock = require('mock-require');
const build = require('../lib/webpack/build.config');

describe('sky-pages webpack build', () => {
  const nodeModules = path.join(process.cwd(), 'node_modules');
  beforeAll(() => {
    mock(path.join(nodeModules, 'vendor-sky-pages-in-loader'), {
      getSkyPagesConfig: () => {},
      getWebpackConfig: () => {}
    });
    mock(path.join(nodeModules, 'vendor-sky-pages-in-error1'), {
      getWebpackConfig: () => {}
    });
    mock(path.join(nodeModules, 'vendor-sky-pages-in-error2'), {
      getSkyPagesConfig: () => {}
    });

    spyOn(fs, 'existsSync').and.callFake((file) => {
      return true;
    });
    mock(path.join(process.cwd(), 'package.json'), {
      devDependencies: {
        'vendor-sky-pages-in-loader': '*'
      }
    });
  });

  it('should ignore modules if project has no devDependencies', () => {
    const modules = build.getModules({});
    expect(modules.length).toBe(0);
  });

  it('should ignore module without matching name', () => {
    const modules = build.getModules({
      devDependencies: {
        'custom-module-1': '*',
        'custom-module-2': '*'
      }
    });
    expect(modules.length).toBe(0);
  });

  it('should throw error if module is missing getSkyPagesConfig', () => {
    expect(build.getModules.bind(null, {
      devDependencies: { 'vendor-sky-pages-in-error1': '*' }
    })).toThrow();
  });

  it('should throw error if module is missing getWebpackConfig', () => {
    expect(build.getModules.bind(null, {
      devDependencies: { 'vendor-sky-pages-in-error2': '*' }
    })).toThrow();
  });

  it('should load module with matching name and interface', () => {
    const modules = build.getModules({
      devDependencies: {
        'exclude-me': '*',
        'vendor-sky-pages-in-loader': '*'
      }
    });
    expect(modules.length).toBe(1);
  });

  it('should return the default skyPagesConfig', () => {
    const defaultSkyPagesConfig = build.getDefaultSkyPagesConfig();
    expect(defaultSkyPagesConfig).toEqual(jasmine.any(Object));
  });

  it('should return the default webpackConfig', () => {
    const defaultWebpackConfig = build.getDefaultWebpackConfig();
    expect(defaultWebpackConfig).toEqual(jasmine.any(Object));
  });

  it('should return the webpackConfig', () => {
    const webpackConfig = build.getWebpackConfig();
    expect(webpackConfig).toEqual(jasmine.any(Object));
  });

});
