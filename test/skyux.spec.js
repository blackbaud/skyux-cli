/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs');
const glob = require('glob');
const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('skyux CLI', () => {
  let spyProcessExit;

  beforeEach(() => {
    spyProcessExit = spyOn(process, 'exit');
    spyOn(logger, 'verbose');
    spyOn(logger, 'info');
    spyOn(logger, 'error');
  })

  afterEach(() => {
    mock.stopAll();
  });

  function setupMock(noNameProperty, cwd) {
    cwd = cwd || 'current-working-directory';
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

  function cli(options) {
      let requiredMock = mock.reRequire('../index');
      requiredMock(options);
  }

  function sharedTests() {
    it('should accept known command version', () => {
      let called = false;
      mock('../lib/version', {
        logVersion: () => {
          called = true;
        }
      });

      cli({ _: ['version'] });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should accept the -v flag', () => {
      let called = false;
      mock('../lib/version', {
        logVersion: () => {
          called = true;
        }
      });

      cli({ _: [''], v: true });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should accept known command help', () => {
      let called = false;
      mock('../lib/help', () => {
        called = true;
      });

      cli({ _: ['help'] });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should accept the -h flag', () => {
      let called = false;
      mock('../lib/help', () => {
        called = true;
      });

      cli({ _: [''], h: true });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should default to the help command', () => {
      let called = false;
      mock('../lib/help', () => {
        called = true;
      });

      cli({ _: [undefined] });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should accept known command new', () => {
      let called = false;
      mock('../lib/new', () => {
        called = true;
      });

      cli({ _: ['new'] });
      expect(called).toEqual(true);
      expect(spyProcessExit).not.toHaveBeenCalled();
    });

    it('should accept unknown command', () => {
      cli({ _: ['unknownCommand'] });
      expect(logger.info).toHaveBeenCalledWith(`SKY UX processing command unknownCommand`);
      expect(logger.error).toHaveBeenCalledWith(`No modules found for unknownCommand`);
      expect(spyProcessExit).toHaveBeenCalledWith(1);
    });
  }

  describe('when missing modules', () => {
    beforeEach(() => {
      spyOn(glob, 'sync').and.returnValue([]);
    });

    it('should fail and log an error', () => {
      cli({ _: ['serve'] });
      expect(logger.info).toHaveBeenCalledWith(`SKY UX processing command serve`);
      expect(logger.error).toHaveBeenCalledWith(`No modules found for serve`);
      expect(spyProcessExit).toHaveBeenCalledWith(1);
    });

    it('should log an error if no modules and path does not contain "skyux-spa"', () => {
      spyOn(process, 'cwd').and.returnValue('non-spa-dir');

      cli({ _: ['unknownCommand'] });
      expect(logger.error).toHaveBeenCalledWith(`Are you in a SKY UX SPA directory?`);
    });

    it('should log an error if path contains "skyux-spa" but the "node_modules" dir does not exist', () => {
      spyOn(process, 'cwd').and.returnValue('skyux-spa-dir');
      spyOn(fs, 'existsSync').and.returnValue(false);

      cli({ _: ['unknownCommand'] });
      expect(logger.error).toHaveBeenCalledWith(`Have you ran 'npm install'?`);
    });

    it('should not log an special errors if in skyux-spa dir and node_modules exists', () => {
      spyOn(process, 'cwd').and.returnValue('skyux-spa-dir');
      spyOn(fs, 'existsSync').and.returnValue(true);

      cli({ _: ['unknownCommand'] });
      expect(logger.error).not.toHaveBeenCalledWith(`Are you in a SKY UX SPA directory?`);
      expect(logger.error).not.toHaveBeenCalledWith(`Have you ran 'npm install'?`);
    })

    sharedTests();

  });

  describe('when containing modules', () => {
    beforeEach(() => {
      setupMock();
    });

    it('should look globally and locally for matching glob patterns', () => {
      const customCommand = 'customCommand';

      mock('local-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // command answered
          return true;
        }
      });

      mock('non-scoped-global-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // command answered
          return true;
        }
      });

      mock('scoped-global-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // command unanswered
          return false;
        }
      });

      cli({ _: [customCommand] });
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to local-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Successfully passed ${customCommand} to 2 modules:`)
      expect(logger.verbose).toHaveBeenCalledWith(`local-module-name, non-scoped-global-module-name`);
    });

    it('should verbosely log the correct plural form of "module"', () => {
      const customCommand = 'customCommand';

      mock('local-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // command answered
          return true;
        }
      });

      mock('non-scoped-global-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // command answered
          return false;
        }
      });

      mock('scoped-global-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);

          // No return value
        }
      });

      cli({ _: [customCommand] });
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to local-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Successfully passed ${customCommand} to 1 module:`)
      expect(logger.verbose).toHaveBeenCalledWith(`local-module-name`);
    });

    it('should fail and log an error if modules found but unknown command (none return true)', () => {
      const customCommand = 'customCommand';

      mock('local-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);
          return false;
        }
      });

      cli({ _: [customCommand] });
      expect(logger.error).toHaveBeenCalledWith(`No modules found for ${customCommand}`);
    });

    it('should handle an error when requiring a malformed module', () => {
      const customCommand = 'customCommand';

      // not mocking global modules to simulate error
      mock('local-module', {
        runCommand: (cmd) => {
          expect(cmd).toBe(customCommand);
        }
      });

      cli({ _: [customCommand] });

      expect(logger.verbose).toHaveBeenCalledWith(
        `Error loading module: non-scoped-global-module/package.json`
      );

    });

    sharedTests()
  });

  describe('when containing modules but no name property in package.json', () => {

    beforeEach(() => {
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
    })

    it('should log path', () => {
      cli({ _: ['customCommand'] });

      expect(logger.verbose).not.toHaveBeenCalledWith(`Passing command to local-module-name`);
      expect(logger.verbose).not.toHaveBeenCalledWith(`Passing command to non-scoped-global-module-name`);
      expect(logger.verbose).not.toHaveBeenCalledWith(`Passing command to scoped-global-module-name`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to local-module`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to non-scoped-global-module`);
      expect(logger.verbose).toHaveBeenCalledWith(`Passing command to scoped-global-module`);
    });

  });

  it('should not call the same package more than once', () => {
    const cwd = 'current-working-directory';
    spyOn(process, 'cwd').and.returnValue(cwd);

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

    cli({ _: ['customCommand'] });

    expect(logger.verbose).toHaveBeenCalledWith(`Passing command to duplicate-module-name`);
    expect(logger.verbose).toHaveBeenCalledWith(`Multiple instances found. Skipping passing command to duplicate-module-name`);
  });

});
