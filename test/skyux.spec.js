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

  function setupMock() {
    const cwd = 'current-working-directory';
    spyOn(process, 'cwd').and.returnValue(cwd);

    mock('path', {
      dirname: (dir) => dir,
      join: (dir, pattern) => `${dir}/${pattern}`
    });

    mock('glob', {
      sync: (pattern) => {
        if (pattern.indexOf(cwd) > -1) {
          return [
            'module-in-cwd'
          ];
        } else {
          return [
            'module-not-in-cwd'
          ];
        }
      }
    });
  }

  it('should look globally and locally for matching glob patterns', () => {

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
  });

  it('should log a warning if a matching glob pattern does not expose runCommand', () => {

    setupMock();
    const customCommand = 'customCommand';

    mock('module-in-cwd', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    mock('module-not-in-cwd', {
      /* no runCommand */
    });

    spyOn(logger, 'warn');

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand] });

    expect(logger.warn).toHaveBeenCalledWith(
      'Found matching module without exposed runCommand - %s',
      'module-not-in-cwd'
    );

  });

});
