/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');
const mock = require('mock-require');
const logger = require('@blackbaud/skyux-logger');

describe('skyux help command', () => {

  beforeEach(() => {
    spyOn(logger, 'info');
  });

  afterEach(() => {
    mock.stopAll();
  });

  it('should log the help information', () => {
    const help = mock.reRequire('../lib/help');
    help({ _: [] });
    expect(logger.info).toHaveBeenCalled();
  });

  it('should handle known help topics', () => {

    const topic = 'CUSTOM HELP TOPIC';
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readFileSync').and.returnValue(topic);

    const help = mock.reRequire('../lib/help');
    help({ _: ['help', 'build'] });

    expect(logger.info.calls.mostRecent().args[0]).toBe(topic);
  });

  it('should handle unknown help topics', () => {
    const topic = 'DEFAULT HELP TOPIC';
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readFileSync').and.returnValue(topic);

    const help = mock.reRequire('../lib/help');
    help({ _: ['help', 'fake-call-does-not-exist'] });

    expect(logger.info.calls.mostRecent().args[0]).toBe(topic);
  });
});
