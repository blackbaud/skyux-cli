/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');
const logger = require('winston');
let cli;

describe('stache-core CLI', () => {

  beforeAll(() => {
    mock('../lib/core/build', function () {
      return true;
    });
    mock('../lib/core/serve', function () {
      return true;
    });
    mock('../lib/core/version', function () {
      return true;
    });
    cli = require('../lib/cli');
    spyOn(logger, 'info');
    spyOn(logger, 'error');
  });

  it('should accept known command build', () => {
    const result = cli({_: ['build']});
    expect(result).toEqual(true);
  });

  it('should accept known command serve', () => {
    const result = cli({_: ['serve']});
    expect(result).toEqual(true);
  });

  it('should accept known command version', () => {
    cli({_: ['version']});
    expect(logger.info).toHaveBeenCalled();
  });

  it('should accept unknown commands', () => {
    cli({_: ['asdf']});
    expect(logger.error).toHaveBeenCalledWith('Please provide a known command.');
  });
});
