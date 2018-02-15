/*jshint jasmine: true, node: true */
'use strict';

const path = require('path');
const proxyquire = require('proxyquire');
const logger = require('../utils/logger');

describe('skyux version command', () => {
  it('should return the version in package.json when using getVersion()', () => {
    const version = 'this.should.match1';

    let stubs = {};
    stubs[path.join(__dirname,  '..', 'package.json')] = {
      '@noCallThru': true,
      version: version
    };

    const lib = proxyquire('../lib/version', stubs);
    expect(lib.getVersion()).toEqual(version);
  });

  it('should use the version returned by getVersion() when calling logVersion()', () => {
    spyOn(logger, 'info');
    const version = 'this.should.match2';

    let stubs = {};
    stubs[path.join(__dirname,  '..', 'package.json')] = {
      '@noCallThru': true,
      version: version
    };

    const lib = proxyquire('../lib/version', stubs);
    lib.logVersion();

    expect(logger.info).toHaveBeenCalledWith(`skyux-cli: ${version}`);
  });
});
