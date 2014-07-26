'use strict';

/* Services */


angular.module('sprock.services', ['sprock.utilities']).

// Demonstrate how to register services
// In this case it is a simple value service.
  value('version', '0.0.3').

// FIXME: DRY

  factory('data_getSeq_test', ['$http', function($http) {
    return function() {
      return chai.expect($http.post('/data/getSeq', {scaffold: 'Scaffold1', start: 2, end: 34})).
	to.eventually.have.property('data').and.
	to.eql({"request": {"start":2, "scaffold":"Scaffold1","end":34},
		"results": {"start":2,"scaffold":"Scaffold1","end":34,
			    "quality":[35,35,32,35,53,47,41,42,46,45,29,29,29,32,33,51,51,51,
				       51,51,51,46,46,46,46,40,40,40,44,44,39,32],
			    "sequence":"CATTTTATCACCAGTTCGATTTTCCCCTTGTT"}});
    };
  }]).

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

  factory('data_getFeatures_test', ['$http', function($http) {
    return function() {
      return chai.expect($http.post('/data/getFeatures', {scaffold: 'Scaffold1', start: 1000, end: 18000})).
	to.eventually.have.property('data').and.
	to.have.property('results').and.
	to.eql({"start":1000,
		"scaffold":"Scaffold1",
		"end":18000,
		"features":[{"span":[13028,18195],"type":"gene","id":"SPU_016802gn","strand":"-"},
			    {"span":[13028,18195],"type":"transcript","id":"SPU_016802-tr","strand":"-"},
			    {"span":[15818,16028],"type":"exon","id":"SPU_016802:1","strand":"-"},
			    {"span":[15263,15412],"type":"exon","id":"SPU_016802:2","strand":"-"},
			    {"span":[13880,13989],"type":"exon","id":"SPU_016802:3","strand":"-"},
			    {"span":[13028,13193],"type":"exon","id":"SPU_016802:4","strand":"-"}]});
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
  }]).

  factory('getSeqInfo', ['$http', '$q', 'getSequence', 'getFeatures', 'SequenceInfo',
			 function($http, $q, getSequence, getFeatures, SequenceInfo) {
    return function (scaffold, start, end) {
      var deferred = $q.defer();
      var sequence_p = getSequence(scaffold, start, end);
      var features_p = getFeatures(scaffold, start, end);
      $q.all([sequence_p, features_p]).
       then(function (values) {
         var sequenceData = values[0];
         var featuresData = values[1];
	 var si = new SequenceInfo(sequenceData).add_features(featuresData);
	 deferred.resolve(si);
       },
       function(data) {
         console.log(data);
	 deferred.reject(data);
       });
      return deferred.promise;
    };
  }]).

  factory('data_getGene_test', ['$http', function($http) {
    return function() {
      return chai.expect($http.post('/data/getGene', {name: 'SPU_008174'})).
	to.eventually.have.property('data').and.
	to.have.property('results').and.
	to.eql({"start":168842,"scaffold":"Scaffold743","end":188364,"name":"SPU_008174",
		"exons":{"ID":"SPU_008174-tr",
			 "exons":{"SPU_008174:2":[188281,188364],
				  "SPU_008174:1":[185066,185375],
				  "SPU_008174:0":[168842,169029]}}});
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

  factory('getContextSeqInfo', ['$http', '$q', 'SequenceInfo',
			 function($http, $q, SequenceInfo) {
    return function (name, margin) {
      var deferred = $q.defer();
      $http.post('/data/getContext', {name: name, margin: margin}).
	success(function (v) {
	  var results = v['results']
	  var si = new SequenceInfo(results);//.add_features(featuresData);
	  deferred.resolve(si);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]);
