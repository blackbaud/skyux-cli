/*jshint jasmine: true, node: true*/

const version = require('../lib/core/version');

describe('sky-pages', () => {

  it('should display the version', () => {
    expect(version()).toMatch(/^\w+\.\w+\.\w+/);
  });

});
