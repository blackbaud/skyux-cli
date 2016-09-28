/*jshint jasmine: true, node: true */
'use strict';

const logger = require('winston');
const promptly = require('promptly');
const sendLine = (line) => {
  setImmediate(() => {
    process.stdin.emit('data', line + '\n');
  });
}

describe('sky-pages new command', () => {
  beforeEach(() => {
    spyOn(logger, 'error');
    spyOn(promptly, 'prompt').and.callThrough();
  });

  it('should catch a spa name with invalid characters', (done) => {
    const name = 'This Is Invalid';
    const cmd = require('../lib/new');

    cmd().then(() => {
      console.log('DO I GET HERE?');
      expect(logger.error).toHaveBeenCalled();
      done();
    });
    sendLine(name);
  });

  // it('should catch a spa name that already locally exists', () => {
  //   const name = 'spazen';
  //   require('../lib/new')();
  //
  //   process.stdin.emit('data', name + '\n');
  //   expect(promptly.prompt).toHaveBeenCalled();
  // });

  // it('should accepts a valid spa name', () => {
  //   const name = 'spazen';
  //   require('../lib/new')();
  //
  //   process.stdin.emit('data', name + '\n');
  //   expect(promptly.prompt).toHaveBeenCalled();
  // });
});
