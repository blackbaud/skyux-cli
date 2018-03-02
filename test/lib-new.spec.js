/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const mock = require('mock-require');
const EventEmitter = require('events').EventEmitter;
const logger = require('@blackbaud/skyux-logger');

let emitter;

const sendLine = (line, cb) => {
  setImmediate(() => {
    process.stdin.emit('data', line + '\n');
    cb();
  });
};

let stdout = null;
let customError = '';
let versionsRequested;

const oldWrite = process.stdout.write;
process.stdout.write = function (data) {
  stdout += data;
  return oldWrite.apply(process.stdout, arguments);
};

describe('skyux new command', () => {

  beforeEach(() => {

    spyOn(logger, 'info');
    spyOn(logger, 'warning');
    spyOn(logger, 'error');
    spyOn(logger, 'verbose');

    mock('git-clone', (url, path, cb) => {
      cb(customError);
    });

    emitter = new EventEmitter();
    mock('cross-spawn', (cmd, args) => {
      emitter.emit('spawnCalled', cmd, args);
      return emitter;
    });

    versionsRequested = {};
    mock('latest-version', (dep) => {
      versionsRequested[dep] = true;
      return Promise.resolve(`${dep}-LATEST`);
    });

    customError = null;
    stdout = '';
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should ask for a spa name and url', (done) => {
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');
    mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        expect(stdout).toContain(
          'What is the root directory for your SPA? (example: my-spa-name)'
        );
        expect(stdout).toContain(
          'What is the URL to your repo? (leave this blank if you don\'t know)'
        );
        done();
      });
    });
  });

  it('should clone custom template repositories', (done) => {
    const customTemplateName = 'valid-template-name';
    const skyuxNew = mock.reRequire('../lib/new')({
      template: customTemplateName
    });

    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.info).toHaveBeenCalledWith(
            `${customTemplateName} template successfully cloned.`
          );
          done();
        });
      });
    });
  });

  it('should name the package with a specific prefix depending on the template', (done) => {
    const libTemplateName = 'library';
    const skyuxNew = mock.reRequire('../lib/new')({
      template: libTemplateName
    });
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.info).toHaveBeenCalledWith(
            `Creating a new SPA named 'skyux-lib-some-spa-name'.`
          );
          done();
        });
      });
    });
  });

  it('should clone the default template if template flag is used without a name', (done) => {
    const skyuxNew = mock.reRequire('../lib/new')({
      template: true
    });
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.info).toHaveBeenCalledWith('default template successfully cloned.');
          done();
        });
      });
    });
  });

  it('should clone the default template if custom template not provided', (done) => {
    const skyuxNew = mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.info).toHaveBeenCalledWith('default template successfully cloned.');
          done();
        });
      });
    });
  });

  it('should catch a spa name with invalid characters', (done) => {
    mock.reRequire('../lib/new')();
    sendLine('This Is Invalid', () => {
      expect(stdout).toContain(
        'SPA root directories may only contain lower-case letters, numbers or dashes.\n'
      );
      done();
    });
  });

  it('should catch a spa directory that already exists', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      expect(stdout).toContain('SPA directory already exists.\n');
      done();
    });
  });

  it('should handle an error cloning the default template', (done) => {
    customError = 'TEMPLATE_ERROR_1';
    spyOn(fs, 'existsSync').and.returnValue(false);
    const skyuxNew = mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.error).toHaveBeenCalledWith('TEMPLATE_ERROR_1');
          done();
        });
      });
    });
  });

  it('should handle an error cloning a custom template', (done) => {
    customError = 'TEMPLATE_ERROR_2';
    spyOn(fs, 'existsSync').and.returnValue(false);
    const skyuxNew = mock.reRequire('../lib/new')({
      t: 'invalid-template-name'
    });
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        skyuxNew.then(() => {
          expect(logger.error).toHaveBeenCalledWith('TEMPLATE_ERROR_2');
          done();
        });
      });
    });
  });

  it('should handle an error cloning the repo', (done) => {
    customError = 'CUSTOM-ERROR2';
    spyOn(fs, 'existsSync').and.returnValue(false);
    const skyuxNew = mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('some-spa-repo', () => {
        skyuxNew.then(() => {
          expect(logger.error).toHaveBeenCalledWith('CUSTOM-ERROR2');
          done();
        });
      });
    });
  });

  it('should handle a non-empty repo when cloning', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore',
      'repo-not-empty'
    ]);
    const skyuxNew = mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('some-spa-repo', () => {
        skyuxNew.then(() => {
          expect(logger.error).toHaveBeenCalledWith(
            'skyux new only works with empty repositories.'
          );
          done();
        });
      });
    });
  });

  it('should ignore .git and README.md files when cloning and run npm install', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore'
    ]);
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');
    spyOn(fs, 'removeSync');
    spyOn(fs, 'copySync');

    const skyuxNew = mock.reRequire('../lib/new')();
    let spawnCalledCount = 0;

    sendLine('some-spa-name', () => {
      sendLine('some-spa-repo', () => {
        emitter.on('spawnCalled', () => {

          if (spawnCalledCount === 1) {
            skyuxNew.then(() => {
              expect(logger.info).toHaveBeenCalledWith('Running npm install');
              expect(logger.info).toHaveBeenCalledWith(
                'Change into that directory and run "skyux serve" to begin.'
              );
              done();
            });
          }

          // Mock git checkout and npm install (x3) success.
          setImmediate(() => {
            spawnCalledCount++;
            emitter.emit('exit', 0);
          });
        });
      });
    });
  });

  it('should handle errors when running git checkout', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore'
    ]);
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');
    spyOn(fs, 'removeSync');
    spyOn(fs, 'copySync');

    const skyuxNew = mock.reRequire('../lib/new')();

    sendLine('some-spa-name', () => {
      sendLine('some-spa-name', () => {
        emitter.on('spawnCalled', (command, args) => {
          skyuxNew.then(() => {
            expect(command).toEqual('git');
            expect(args).toEqual([
              'checkout',
              '-b',
              'initial-commit'
            ]);
            expect(logger.info).toHaveBeenCalledWith('Switching to branch initial-commit.');
            expect(logger.error).toHaveBeenCalledWith(
              'Switching to branch initial-commit failed.'
            );
            done();
          });

          // Mock git checkout error
          setImmediate(() => {
            emitter.emit('exit', 1);
          });
        });
      });
    });
  });

  it('should handle errors when running npm install', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore'
    ]);
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');
    spyOn(fs, 'removeSync');
    spyOn(fs, 'copySync');

    const skyuxNew = mock.reRequire('../lib/new')();

    sendLine('some-spa-name', () => {

      // Don't provide current repo URL to clone
      sendLine('', () => {
        emitter.on('spawnCalled', () => {
          skyuxNew.then(() => {
            expect(logger.error).toHaveBeenCalledWith('npm install failed.');
            done();
          });

          // Mock npm install failure.
          setImmediate(() => {
            emitter.emit('exit', 1);
          });
        });
      });
    });
  });

  it('should handle errors when cleaning the template', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore'
    ]);
    spyOn(fs, 'readJsonSync').and.returnValue({});
    const skyuxNew = mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('some-spa-repo', () => {
        skyuxNew.then(() => {
          expect(logger.info).toHaveBeenCalledWith('Template cleanup failed.');
          done();
        });
      });
    });
  });

  it('should install the latest versions of SKY UX and SKY UX Builder', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readdirSync').and.returnValue([
      '.git',
      'README.md',
      '.gitignore'
    ]);
    spyOn(fs, 'readJsonSync').and.returnValue({
      dependencies: {},
      devDependencies: {}
    });
    let spyWriteJson = spyOn(fs, 'writeJsonSync');
    spyOn(fs, 'removeSync');
    spyOn(fs, 'copySync');

    mock.reRequire('../lib/new')();

    // Don't provide current repo URL to clone
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        emitter.on('spawnCalled', () => {
          const json = spyWriteJson.calls.mostRecent().args[1];
          const deps = {
            '@blackbaud/skyux': 'dependencies',
            '@blackbaud/skyux-builder': 'devDependencies'
          };

          Object.keys(deps).forEach(key => {
            expect(json[deps[key]][key]).toBe(`${key}-LATEST`);
            expect(versionsRequested[key]).toBe(true);
          });

          done();
        });
      });
    });
  });

});
