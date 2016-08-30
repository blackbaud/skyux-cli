/*jshint jasmine: true, node: true*/

const version = require('../lib/core/version');

describe('stache-core', () => {

  it('should display the version', () => {
    expect(version()).toMatch(/^\w+\.\w+\.\w+/);
  });

});
