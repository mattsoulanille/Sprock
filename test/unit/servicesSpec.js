'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('sprock.services'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.0.3');
    }));
  });

  describe('getSequence', function() {
    it('should be a function', inject(function(getSequence) {
      expect(getSequence).toBeFunction();
    }));
    it('should return a promise', inject(function(getSequence) {
      expect(getSequence()).toBeAPromise();
    }));
    xit('should produce good sequence data', inject(function(getSequence, $rootScope, $httpBackend) {
      // FIXME
      var sequence;
      getSequence('Scaffold1', 2, 34).then(function(v) { sequence = v; });
      expect(sequence).toBeUndefined();
      $rootScope.$apply();
      expect(sequence).toBe('getSequence happy');
    }));

  });

});
