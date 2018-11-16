/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('npm install library', () => {


  beforeEach(() => {
    spyOn(logger, 'info');
  });

  function getArgsFromSpawn(settings) {
    let spawnArgs;

    mock('cross-spawn', (command, flags, args) => {
      spawnArgs = args;
      return jasmine.createSpyObj('spawn', ['on']);
    });

    const npmInstall = mock.reRequire('../lib/npm-install');

    npmInstall(settings);

    return spawnArgs;
  }

  function getPromiseFromSpawn(exitCode) {
    const spySpawn = jasmine.createSpyObj('spawn', ['on']);
    mock('cross-spawn', () => spySpawn);

    const npmInstall = mock.reRequire('../lib/npm-install');
    const npmInstallPromise = npmInstall();

    spySpawn.on.calls.argsFor(0)[1](exitCode);

    return npmInstallPromise;
  }

  it('should not set cwd in path is not passed in the settings', () => {
    expect(getArgsFromSpawn({})).toEqual({
      stdio: 'inherit'
    });
  });

  it('should set cwd in path is not passed in the settings', () => {
    const myCustomPath = 'my-custom-path';
    expect(getArgsFromSpawn({ path: myCustomPath })).toEqual({
      stdio: 'inherit',
      cwd: myCustomPath
    });
  });

  it('should listen for the exit event and resolve if exit code is 0', (done) => {
    getPromiseFromSpawn(0).then(() => {
      expect(logger.info).toHaveBeenCalledWith('Running npm install');
      done();
    }, () => {});
  });

  it('should listen for the exit event and reject if exit code is not 0', (done) => {
    getPromiseFromSpawn(1).then(() => {}, (err) => {
      expect(err).toEqual('npm install failed.');
      done();
    });
  });

});
