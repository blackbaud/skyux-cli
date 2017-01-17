/*jshint jasmine: true, node: true */
'use strict';

const mock = require('mock-require');

describe('skyux bin', () => {

  const cliExpectedArgs = {
    _: [],
    0: 'TEST1',
    1: 'TEST2'
  };
  let minimistArgs;
  let notifierArgs;
  let notifyArgs;
  let cliArgs;

  beforeEach(() => {

    minimistArgs = null;
    notifierArgs = null;
    notifyArgs = null;
    cliArgs = null;

    mock('minimist', (args) => {
      minimistArgs = args;
      return cliExpectedArgs;
    });

    mock('update-notifier', (args) => {
      notifierArgs = args;
      return {
        notify: (nargs) => {
          notifyArgs = nargs;
        }
      };
    });

    mock('../index', (args) => {
      cliArgs = args;
    });
  });

  afterEach(() => {
    mock.stop('minimist');
    mock.stop('update-notifier');
    mock.stop('../index');
  });

  it('should pass package.json to update-notifier', () => {
    const pkg = {
      name: 'Test-Package',
      version: 'Test-Version'
    };

    mock('../package.json', () => (pkg));
    require('../bin/skyux');

    expect(notifierArgs.pkg()).toEqual(pkg);
    expect(notifyArgs.defer).toEqual(false);
    expect(cliArgs).toEqual(cliExpectedArgs);
  });
});
