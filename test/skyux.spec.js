/*jshint jasmine: true, node: true */
'use strict';

const glob = require('glob');
const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('skyux CLI', () => {

  afterEach(() => {
    mock.stopAll();
  });

  function setupMock(noNameProperty) {
    const cwd = 'current-working-directory';
    spyOn(process, 'cwd').and.returnValue(cwd);

    mock('path', {
      dirname: (dir) => dir.replace('/package.json', ''),
      join: (dir, pattern) => `${dir}/${pattern}`
    });

    if (noNameProperty) {
      mock('local-module/package.json', {});
      mock('non-scoped-global-module/package.json', {});
      mock('scoped-global-module/package.json', {});
    } else {
      mock('local-module/package.json', {
        name: 'local-module-name'
      });
      mock('non-scoped-global-module/package.json', {
        name: 'non-scoped-global-module-name'
      });
      mock('scoped-global-module/package.json', {
        name: 'scoped-global-module-name'
      });
    }

    mock('glob', {
      sync: (pattern) => {

        // Emulates local package installed
        if (pattern.indexOf(cwd) > -1) {
          return [
            'local-module/package.json'
          ];

        // Emulates global package that's not scoped to @blackbaud
        } else if (pattern.indexOf('../..') > -1) {
          return [
            'non-scoped-global-module/package.json'
          ];

        // Emulates global package that's scoped
        } else {
          return [
            'scoped-global-module/package.json'
          ];
        }
      }
    });
  }

  it('should accept known command version', () => {
    spyOn(glob, 'sync').and.returnValue([]);

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
    spyOn(glob, 'sync').and.returnValue([]);

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
    spyOn(glob, 'sync').and.returnValue([]);

    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['help'] });
    expect(called).toEqual(true);
  });

  it('should accept the -h flag', () => {
    spyOn(glob, 'sync').and.returnValue([]);

    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: [''], h: true });
    expect(called).toEqual(true);
  });

  it('should default to the help command', () => {
    spyOn(glob, 'sync').and.returnValue([]);

    let called = false;
    mock('../lib/help', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: [undefined] });
    expect(called).toEqual(true);
  });

  it('should accept known command new', () => {
    spyOn(glob, 'sync').and.returnValue([]);

    let called = false;
    mock('../lib/new', () => {
      called = true;
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['new'] });
    expect(called).toEqual(true);
  });

  it('should accept unknown command', () => {
    spyOn(glob, 'sync').and.returnValue([]);
    spyOn(logger, 'info');

    const cli = mock.reRequire('../index');
    cli({ _: ['unknownCommand'] });
    expect(logger.info).toHaveBeenCalledWith(`SKY UX processing command unknownCommand`);
  });

  it('should look globally and locally for matching glob patterns', () => {
    spyOn(logger, 'info');
    setupMock();
    const customCommand = 'customCommand';

    mock('local-module', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    mock('non-scoped-global-module', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    mock('scoped-global-module', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand], verbose: true });
    expect(logger.info).toHaveBeenCalledWith(`Passing command to local-module-name`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
  });

  it('should handle an error when requiring a malformed module and log when verbose', () => {
    setupMock();
    const customCommand = 'customCommand';

    // not mocking global modules to simulate error
    mock('local-module', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    spyOn(logger, 'info');

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand], verbose: true });

    expect(logger.info).toHaveBeenCalledWith(
      `Error loading module: non-scoped-global-module/package.json`
    );

  });

  it('should handle an error when requiring a malformed module and not log when not verbose', () => {
    setupMock();
    const customCommand = 'customCommand';

    // not mocking global modules to simulate error
    mock('local-module', {
      runCommand: (cmd) => {
        expect(cmd).toBe(customCommand);
      }
    });

    spyOn(logger, 'info');

    const cli = mock.reRequire('../index');
    cli({ _: [customCommand] });

    expect(logger.info).not.toHaveBeenCalledWith(
      `Error loading module: non-scoped-global-module/package.json`
    );

  });

  it('should log path if name property does not exist in package.json when verbose', () => {
    spyOn(logger, 'info');
    setupMock(true);

    mock('local-module', {
      runCommand: () => {}
    });

    mock('non-scoped-global-module', {
      runCommand: () => {}
    });

    mock('scoped-global-module', {
      runCommand: () => {}
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['customCommand'], verbose: true });

    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to local-module-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to local-module`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to non-scoped-global-module`);
    expect(logger.info).toHaveBeenCalledWith(`Passing command to scoped-global-module`);
  });

  it('should not log path or name property when not vebose', () => {
    spyOn(logger, 'info');
    setupMock(true);

    mock('local-module', {
      runCommand: () => {}
    });

    mock('non-scoped-global-module', {
      runCommand: () => {}
    });

    mock('scoped-global-module', {
      runCommand: () => {}
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['customCommand'] });

    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to local-module-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to local-module`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to non-scoped-global-module`);
    expect(logger.info).not.toHaveBeenCalledWith(`Passing command to scoped-global-module`);
  });

  it('should not call the same package more than once', () => {

    const cwd = 'current-working-directory';
    spyOn(process, 'cwd').and.returnValue(cwd);
    spyOn(logger, 'info');

    mock('path', {
      dirname: (dir) => dir.replace('/package.json', ''),
      join: (dir, pattern) => `${dir}/${pattern}`
    });

    mock('local-module/package.json', {
      name: 'duplicate-module-name'
    });

    mock('global-module/package.json', {
      name: 'duplicate-module-name'
    });

    mock('local-module', {
      runCommand: () => {}
    });

    mock('global-module', {
      runCommand: () => {}
    });

    mock('glob', {
      sync: (pattern) => {

        // Emulates local package installed
        if (pattern.indexOf(cwd) > -1) {
          return [
            'local-module/package.json'
          ];

        } else {
          return [
            'global-module/package.json'
          ];
        }
      }
    });

    const cli = mock.reRequire('../index');
    cli({ _: ['customCommand'], verbose: true });

    expect(logger.info).toHaveBeenCalledWith(`Passing command to duplicate-module-name`);
    expect(logger.info).toHaveBeenCalledWith(`Multiple instances found. Skipping passing command to duplicate-module-name`);
  });

});
