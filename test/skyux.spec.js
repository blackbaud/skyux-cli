/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const path = require('path');
const mock = require('mock-require');
const proxyquire = require('proxyquire');
const logger = require('winston');

describe('skyux CLI', () => {

  let spyProcessExit;
  let spyLoggerError;
  let spyLoggerWarn
  let spyLoggerInfo;

  beforeEach(() => {
    spyProcessExit = spyOn(process, 'exit');
    spyLoggerError = spyOn(logger, 'error');
    spyLoggerWarn = spyOn(logger, 'warn');
    spyLoggerInfo = spyOn(logger, 'info');
  });

  it('should accept known command version', () => {
    let called = false;
    mock('../lib/version', {
      logVersion: () => {
        called = true;
      }
    });

    const cli = require('../index');
    cli({ _: ['version'] });
    expect(called).toEqual(true);
  });

  it('should accept the -v flag', () => {
    let called = false;
    mock('../lib/version', {
      logVersion: () => {
        called = true;
      }
    });

    const cli = require('../index');
    cli({ _: [''], v: true });
    expect(called).toEqual(true);
  });

  it('should accept the -h flag', () => {
    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: [''], h: true });
    expect(called).toEqual(true);
  });

  it('should default to the help command', () => {
    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: [undefined] });
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
    spyOn(fs, 'existsSync').and.returnValue(false);
    mock('../lib/version', {
      logVersion: () => {
        called = true;
      }
    });

    const cli = require('../index');
    cli({ _: ['version'] });
    expect(called).toEqual(true);
  });

  it('should not pass new command to devDependencies', () => {
    let called = false;
    spyOn(fs, 'existsSync').and.returnValue(false);
    mock('../lib/new', () => {
      called = true;
    });

    const cli = require('../index');
    cli({ _: ['new'] });
    expect(called).toEqual(true);
    expect(spyLoggerInfo).not.toHaveBeenCalled();
  });

  it('should accept unknown command', () => {
    const cli = require('../index');
    cli({ _: ['test'] });
    expect(spyLoggerInfo).toHaveBeenCalled();
  });

  it('should work if package.json does not exist', () => {
    spyOn(fs, 'existsSync').and.returnValue(false);

    const cli = require('../index');
    cli({ _: ['test'] });
    expect(spyProcessExit).toHaveBeenCalledWith(1);
    expect(spyLoggerError)
      .toHaveBeenCalledWith('No package.json file found in current working directory.');
  });

  it('should work if package.json exists without devDependencies property', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(spyProcessExit).toHaveBeenCalledWith(1);
    expect(spyLoggerError).toHaveBeenCalledWith('package.json contains no devDependencies');
  });

  it('should work if package.json exists without matching devDependencies', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true,
      devDependencies: {}
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(spyProcessExit).toHaveBeenCalledWith(1);
    expect(spyLoggerError).toHaveBeenCalledWith('Your package.json contains no matching dependencies');
  });

  it('should work if package.json exists with matching devDependencies', () => {
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
        return true;
      }
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(spyLoggerWarn.calls.mostRecent().args[0]).toEqual(
      'Found matching module without exposed runCommand - %s'
    );
    expect(called).toEqual(true);
  });

  it('should not log unknown command if any runCommand returns true', () => {
    spyOn(fs, 'existsSync').and.returnValue(true);

    let stubs = {};
    let called = false;
    stubs[path.join(process.cwd(), 'package.json')] = {
      '@noCallThru': true,
      devDependencies: {
        'blackbaud-skyux-builder-test1': '0.0.1'
      }
    };

    stubs[path.join(process.cwd(), 'node_modules', 'blackbaud-skyux-builder-test1')] = {
      '@noCallThru': true,
      runCommand: () => {
        called = true;
        return false;
      }
    };

    const cli = proxyquire('../index', stubs);
    cli({ _: ['test'] });
    expect(called).toEqual(true);
    expect(spyProcessExit).toHaveBeenCalledWith(1);
    expect(spyLoggerError.calls.mostRecent().args[0]).toEqual('Unknown command.');
  });

});
