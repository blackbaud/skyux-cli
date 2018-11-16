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

  beforeEach(() => {
    spyRemove = spyOn(fs, 'remove').and.returnValue(Promise.resolve());

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

  it('should delete node_modules and run npm install', () => {
    const install = mock.reRequire('../lib/install');

    install();

    expect(spyRemove).toHaveBeenCalled();
    expect(npmInstallSpy).toHaveBeenCalled();
  });

});
