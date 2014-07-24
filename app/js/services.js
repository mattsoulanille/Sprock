'use strict';

/* Services */


angular.module('sprock.services', ['sprock.utilities']).

// Demonstrate how to register services
// In this case it is a simple value service.
  value('version', '0.0.3').

// FIXME: DRY
  factory('getSequence', ['$http', '$q', function($http, $q) {
    return function (scaffold, start, end) {
      var deferred = $q.defer();
      $http.post('/data/getSeq', {scaffold: scaffold, start: start, end: end}).
	success(function (v) {
	  deferred.resolve(v['results']);
	})
	.error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]).

  factory('getSeqInfo', ['$http', '$q', 'SequenceInfo', function($http, $q, SequenceInfo) {
    return function (scaffold, start, end) {
      var deferred = $q.defer();
      $http.post('/data/getSeq', {scaffold: scaffold, start: start, end: end}).
	success(function (v) {
	  deferred.resolve(new SequenceInfo(v['results']));
	})
	.error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]).

  factory('getGene', ['$http', '$q', function($http, $q) {
    return function (name) {
      var deferred = $q.defer();
      $http.post('/data/getGene', {name: name}).
	success(function (v) {
	  deferred.resolve(v['results']);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]).

  factory('getFeatures', ['$http', '$q', function($http, $q) {
    return function (scaffold, start, end) {
      var deferred = $q.defer();
      $http.post('/data/getFeatures', {scaffold: scaffold, start: start, end: end}).
	success(function (v) {
	  deferred.resolve(v['results']);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]);

