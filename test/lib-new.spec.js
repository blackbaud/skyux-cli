/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const promptly = require('promptly');
const mock = require('mock-require');
const logger = require('winston');
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();

const sendLine = (line, cb) => {
  setImmediate(() => {
    process.stdin.emit('data', line + '\n');
    cb();
  });
};

let stdout = null;
let customError = '';

const oldWrite = process.stdout.write;
process.stdout.write = function (data) {
  stdout += data;
  return oldWrite.apply(process.stdout, arguments);
};

beforeEach(() => {
  spyOn(promptly, 'prompt').and.callThrough();
  mock('git-clone', (url, path, cb) => {
    cb(customError);
  });
  mock('cross-spawn', () => emitter);
  customError = null;
  stdout = '';
});

describe('sky-pages new command', () => {

  it('should ask for a spa name and url', (done) => {
    spyOn(fs, 'readJsonSync').and.returnValue({});
    spyOn(fs, 'writeJsonSync');

    require('../lib/new')();
    sendLine('a', () => {
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

  it('should catch a spa name with invalid characters', (done) => {
    require('../lib/new')();
    sendLine('This Is Invalid', () => {
      expect(stdout).toContain(
        'SPA root directories may only contain lower-case letters, numbers or dashes.\n'
      );
      done();
    });
  });

  it('should catch a spa directory that already exists', (done) => {
    spyOn(fs, 'existsSync').and.returnValue(true);
    require('../lib/new')();
    sendLine('b', () => {
      expect(stdout).toContain(
        'SPA directory already exists.\n'
      );
      done();
    });
  });

  it('should handle an error cloning the template', (done) => {
    customError = 'CUSTOM-ERROR1';
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(logger, 'error');
    require('../lib/new')();
    sendLine('e', () => {
      sendLine('', () => {
        expect(logger.error).toHaveBeenCalledWith('CUSTOM-ERROR1');
        done();
      });
    });
  });

  it('should handle an error cloning the repo', (done) => {
    customError = 'CUSTOM-ERROR2';
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(logger, 'error');
    require('../lib/new')();
    sendLine('f', () => {
      sendLine('g', () => {
        expect(logger.error).toHaveBeenCalledWith('CUSTOM-ERROR2');
        done();
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
    spyOn(logger, 'info');
    require('../lib/new')();
    sendLine('h', () => {
      sendLine('i', () => {
        expect(logger.info).toHaveBeenCalledWith(
          'sky-pages new only works with empty repositories.'
        );
        done();
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
    spyOn(fs, 'copy').and.callFake((tmp, path, settings, cb) => {
      cb();
    });
    spyOn(logger, 'info');
    require('../lib/new')();
    sendLine('j', () => {
      sendLine('k', () => {
        emitter.emit('exit');
        expect(logger.info).toHaveBeenCalledWith('Running npm install');
        expect(logger.info).toHaveBeenCalledWith(
          'Change into that directory and run "sky-pages serve" to begin.'
        );
        done();
      });
    });
  });

});
