/*jshint jasmine: true, node: true */
'use strict';

describe('skyux help command', () => {
  it('should log the help information', () => {
    spyOn(console, 'log');
    const help = require('../lib/help');
    help();
    expect(console.log).toHaveBeenCalled();
  });
});
