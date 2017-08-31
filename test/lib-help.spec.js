/*jshint jasmine: true, node: true */
'use strict';

const fs = require('fs-extra');

describe('skyux help command', () => {
  it('should log the help information', () => {
    spyOn(console, 'log');
    const help = require('../lib/help');
    help({ _: [] });
    expect(console.log).toHaveBeenCalled();
  });

  it('should handle known help topics', () => {

    const topic = 'CUSTOM HELP TOPIC';
    spyOn(console, 'log');
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'readFileSync').and.returnValue(topic);

    const help = require('../lib/help');
    help({ _: ['help', 'build'] });

    expect(console.log.calls.mostRecent().args[0]).toBe(topic);
  });

  it('should handle unknown help topics', () => {
    const topic = 'DEFAULT HELP TOPIC';
    spyOn(console, 'log');
    spyOn(fs, 'existsSync').and.returnValue(false);
    spyOn(fs, 'readFileSync').and.returnValue(topic);

    const help = require('../lib/help');
    help({ _: ['help', 'fake-call-does-not-exist'] });

    expect(console.log.calls.mostRecent().args[0]).toBe(topic);
  });
});
