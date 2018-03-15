/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const mock = require('mock-require');
const EventEmitter = require('events').EventEmitter;

let emitter;

const sendLine = (line, cb) => {
  setImmediate(() => {
    process.stdin.emit('data', line + '\n');
    cb();
  });
};

let customError = '';
let versionsRequested;
let logger;
let spyWrite;

fdescribe('skyux new command', () => {

  beforeEach(() => {

    logger = jasmine.createSpyObj(
      'logger',
      [
        'info',
        'warn',
        'error',
        'verbose',
        'bobby'
      ]
    );
    mock('@blackbaud/skyux-logger', logger);

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

    spyWrite = spyOn(process.stdout, 'write');

    customError = null;
  });

  afterEach(() => {
    mock.stopAll();
  });

  function spyOnPrompt() {
    const prompt = jasmine.createSpy('prompt').and.callFake(() => Promise.resolve());
    mock('promptly', { prompt });
    return prompt;
  }

  it('should ask for a spa name and url', (done) => {
    const prompt = spyOnPrompt();
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');

    mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      sendLine('', () => {
        expect(prompt.calls.argsFor(0)).toContain(
          'What is the root directory for your SPA? (example: my-spa-name)'
        );
        expect(prompt.calls.argsFor(1)).toContain(
          'What is the URL to your repo? (leave this blank if you don\'t know)'
        );
        done();
      });
    });
  });

  it('should use the template flag as a GitHub repo name if it does not contain a colon', (done) => {
    spyOnPrompt();
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

  it('should use the template flag as a Git URL if it contains a colon', (done) => {
    spyOnPrompt();
    const customTemplateName = 'https://vsts.com/my-repo.git';
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
    spyOnPrompt();
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
    spyOnPrompt();
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
      expect(spyWrite.calls.allArgs()).toContain(
        ['SPA root directories may only contain lower-case letters, numbers or dashes.\n']
      );
      done();
    });
  });

  it('should catch a spa directory that already exists', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    mock.reRequire('../lib/new')();
    sendLine('some-spa-name', () => {
      expect(spyWrite.calls.allArgs()).toContain(['SPA directory already exists.\n']);
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
    spyOnPrompt();
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
