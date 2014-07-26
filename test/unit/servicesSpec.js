'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('sprock.services'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.0.3');
    }));
  });

  describe('/data/getSeq', function() {
    it('should give a good answer', inject(function($http, $q) {
      var scaffold = 'Scaffold1';
      var start = 2;
      var end = 34;
      //var deferred = $q.defer();
      $http.post('/data/getSeq', {scaffold: scaffold, start: start, end: end}).
	success(function (v) {
	  expect(v).toEqual('fun');
	  //deferred.resolve(v['results']);
	})
	.error(function(data, status, headers, config) {
	  console.log(data);
	  expect(v).toEqual('fail');
	  //deferred.reject(data);
	});
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

  describe('getSeqInfo', function() {
    it('should be a function', inject(function(getSeqInfo) {
      expect(getSeqInfo).toBeFunction();
    }));
    it('should return a promise', inject(function(getSeqInfo) {
      expect(getSeqInfo()).toBeAPromise();
    }));
    xit('should produce good sequence data', inject(function(getSeqInfo, $rootScope, $httpBackend) {
      // FIXME
      var sequence;
      getSeqInfo('Scaffold1', 2, 34).then(function(v) { sequence = v; });
      expect(sequence).toBeUndefined();
      $rootScope.$apply();
      expect(sequence).toBe('getSeqInfo happy');
    }));
  });

  describe('getContextSeqInfo', function() {
    it('should be a function', inject(function(getContextSeqInfo) {
      expect(getContextSeqInfo).toBeFunction();
    }));
    it('should return a promise', inject(function(getContextSeqInfo) {
      expect(getContextSeqInfo()).toBeAPromise();
    }));
    xit('should produce good context data', inject(function(getContextSeqInfo, $rootScope, $httpBackend) {
      // FIXME
      var sequence;
      getContextSeqInfo('Scaffold1', 2, 34).then(function(v) { sequence = v; });
      expect(sequence).toBeUndefined();
      $rootScope.$apply();
      expect(sequence).toBe('getContextSeqInfo happy');
    }));
  });

});
