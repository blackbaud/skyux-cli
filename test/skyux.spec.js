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
    mock('../lib/version', {
      logVersion: () => {
        called = true;
      }
    });

    const cli = mock.reRequire('../index');
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

    const cli = mock.reRequire('../index');
    cli({ _: [''], v: true });
    expect(called).toEqual(true);
  });

  it('should accept known command help', () => {
    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['help'] });
    expect(called).toEqual(true);
  });

  it('should accept the -h flag', () => {
    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: [''], h: true });
    expect(called).toEqual(true);
  });

  it('should default to the help command', () => {
    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: [undefined] });
    expect(called).toEqual(true);
  });

  it('should accept known command new', () => {
    let called = false;
    mock('../lib/new', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['new'] });
    expect(called).toEqual(true);
  });

  it('should accept unknown command', () => {
    spyOn(logger, 'info');

    const cli = mock.reRequire('../index');
    cli({ _: ['test'] });
    expect(logger.info).toHaveBeenCalled();
  });

  function setupMock(noNameProperty) {
    const cwd = 'current-working-directory';
    spyOn(process, 'cwd').and.returnValue(cwd);

    mock('path', {
      dirname: (dir) => dir.replace('/package.json', ''),
      join: (dir, pattern) => `${dir}/${pattern}`
    });

    if (noNameProperty) {
      mock('module-in-cwd/package.json', {});
      mock('module-not-in-cwd/package.json', {});
    } else {
      mock('module-in-cwd/package.json', {
        name: 'module-in-cwd-name'
      });
      mock('module-not-in-cwd/package.json', {
        name: 'module-not-in-cwd-name'
      });
    }

    mock('glob', {
      sync: (pattern) => {
        if (pattern.indexOf(cwd) > -1) {
          return [
            'module-in-cwd/package.json'
          ];
        } else {
          return [
            'module-not-in-cwd/package.json'
          ];
        }
      }
    });
  }

  it('should look globally and locally for matching glob patterns', () => {
    spyOn(logger, 'info');
    setupMock();
    const customCommand = 'customCommand';

    mock('module-in-cwd', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    mock('module-not-in-cwd', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand] });
    expect(logger.info).toHaveBeenCalledWith(`Passing command to module-in-cwd-name`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to module-not-in-cwd-name`);
  });

  it('should handle an error when requiring a malformed module', () => {

    // not mocking module-not-in-cwd to simulate error
    mock.stopAll();

    setupMock();
    const customCommand = 'customCommand';

    mock('module-in-cwd', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    spyOn(logger, 'error');

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand] });

    expect(logger.error).toHaveBeenCalledWith(
      `Error loading module: module-not-in-cwd/package.json`
    );

  });

  it('should not log package name if property does not exist', () => {
    spyOn(logger, 'info');
    setupMock(true);
    const cli = mock.reRequire('../index');
    cli({ _: ['customCommand'] });
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to module-in-cwd-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to module-not-in-cwd-name`);
  });

});
