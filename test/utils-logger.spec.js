/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('logger', () => {
  afterEach(() => {
    mock.stopAll();
  });

  function setupTest(argv) {
    const spy = jasmine.createSpy('console');

    mock('minimist', () => argv);
    mock('winston', {
      Logger: function () {
        return jasmine.createSpyObj('console', ['info', 'error', 'bobby']);
      },

      transports: {
        Console: spy
      }
    });

    const logger = mock.reRequire('../utils/logger');
    logger.info('test');
    return spy;
  }

  it('should set the default color to true', () => {
    const spy = setupTest({});
    expect(spy.calls.first().args[0].colorize).toBe(true);
  });

  it('should accept the color flag', () => {
    const spy = setupTest({ color: false });
    expect(spy.calls.first().args[0].colorize).toBe(false);
  });
});
