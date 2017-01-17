/*jshint jasmine: true, node: true */
'use strict';

describe('sky-pages bin', () => {
  it('should call console.error', () => {
    spyOn(console, 'error');
    require('../bin/sky-pages');
    expect(console.error).toHaveBeenCalled();
  });
});
