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

let logger;
let npmInstallSpy;

describe('skyux install command', () => {

  let spyRemove;
  let spyLoggerPromise;

  beforeEach(() => {
    spyRemove = spyOn(fs, 'remove').and.returnValue(Promise.resolve());

    logger = jasmine.createSpyObj(
      'logger',
      [
        'info',
        'warn',
        'error',
        'verbose',
        'promise'
      ]
    );

    spyLoggerPromise = jasmine.createSpyObj('promise', ['fail', 'succeed']);
    logger.promise.and.returnValue(spyLoggerPromise);

    mock('@blackbaud/skyux-logger', logger);

    emitter = new EventEmitter();

    mock('cross-spawn', (cmd, args) => {
      emitter.emit('spawnCalled', cmd, args);
      return emitter;
    });

    npmInstallSpy = jasmine.createSpy('npmInstall');

    mock('../lib/npm-install', npmInstallSpy);
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should delete node_modules, package-lock.json, and run npm install', (done) => {
    const install = mock.reRequire('../lib/install');

    install().then(() => {
      expect(spyRemove).toHaveBeenCalledWith('node_modules');
      expect(spyRemove).toHaveBeenCalledWith('package-lock.json');
      expect(npmInstallSpy).toHaveBeenCalledWith({
        stdio: 'ignore'
      });

      done();
    });
  });

  it('should pass stdio: inherit to spawn when logLevel is verbose', (done) => {
    logger.logLevel = 'verbose';
    const install = mock.reRequire('../lib/install');

    install().then(() => {
      expect(npmInstallSpy).toHaveBeenCalledWith({
        stdio: 'inherit'
      });

      done();
    });

  });

  it('should handle successfully deleting node_modules', (done) => {
    const install = mock.reRequire('../lib/install');
    install().then(() => {
      expect(spyLoggerPromise.succeed).toHaveBeenCalled();
      done();
    });
  });

  it('should handle unsuccessfully deleting node_modules', (done) => {
    const err = 'custom-error';
    const install = mock.reRequire('../lib/install');

    spyRemove.and.returnValue(Promise.reject(err))
    install().then(() => {
      expect(spyLoggerPromise.fail).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(err);
      done();
    });
  });

});
