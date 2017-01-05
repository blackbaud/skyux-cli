/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const mock = require('mock-require');
const proxyquire = require('proxyquire');
const logger = require('winston');

describe('skyux CLI', () => {

  it('should accept known command version', () => {
    let called = false;
    mock('../lib/version', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: ['version'] });
    expect(called).toEqual(true);
  });

  it('should accept the -v flag', () => {
    let called = false;
    mock('../lib/version', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: [''], v: true });
    expect(called).toEqual(true);
  });

  it('should accept known command new', () => {
    let called = false;
    mock('../lib/new', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: ['new'] });
    expect(called).toEqual(true);
  });

  it('should pass version command to devDependencies', () => {
    let called = false;
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(false);
    mock('../lib/version', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: ['version'] });
    expect(called).toEqual(true);
    expect(logger.info).toHaveBeenCalledWith('No package.json file found in current working directory.');
  });

  it('should pass unknown command to devDependencies', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(false);

    const cli = require('../index');
    cli({ _: ['test'] });
    expect(logger.info).toHaveBeenCalledTimes(2);
  });

  it('should not pass new command to devDependencies', () => {
    let called = false;
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(false);
    mock('../lib/new', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: ['new'] });
    expect(called).toEqual(true);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('should accept unknown command', () => {
    spyOn(logger, 'info');

    const cli = require('../index');
    cli({ _: ['test'] });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should work if package.json does not exist', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(false);

    const cli = require('../index');
    cli({ _: ['test'] });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should work if package.json exists without devDependencies', () => {
    spyOn(logger, 'info');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should work if package.json exists with matching devDependencies', () => {
    spyOn(logger, 'warn');
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    let called = false;
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true,
      devDependencies: {
        'blackbaud-skyux-builder-test1': '0.0.1',
        'blackbaud-skyux-builder-test2': '0.0.1'
      }
    };

    stubs[path.join(process.cwd(), 'node_modules', 'blackbaud-skyux-builder-test1')] = {
      '@noCallThru': true
    };

    stubs[path.join(process.cwd(), 'node_modules', 'blackbaud-skyux-builder-test2')] = {
      '@noCallThru': true,
      runCommand: () => {
        called = true;
      }
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(logger.warn).toHaveBeenCalled();
    expect(called).toEqual(true);
  });

});
