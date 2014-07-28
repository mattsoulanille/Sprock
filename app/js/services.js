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
	to.eventually.have.property('data').property('results').
	eql({"start":2,"scaffold":"Scaffold1","end":34,
	     "quality":[35,35,32,35,53,47,41,42,46,45,29,29,29,32,33,51,51,51,51,51,51,46,46,46,46,40,40,40,44,44,39,32],
	     "sequence":"CATTTTATCACCAGTTCGATTTTCCCCTTGTT"});
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
	to.eventually.have.property('data').property('results').
	eql({"start":1000,
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
	to.eventually.have.property('data').property('results').
	eql({"start":168842,
	     "scaffold":"Scaffold743",
	     "end":188364,
	     "name":"SPU_008174",
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

  factory('data_getContext_test', ['$http', function($http) {
    return function() {
      var expect = chai.expect;
      return expect($http.post('/data/getContext', {name: 'SPU_008174', margin:500})).
	to.be.fulfilled.then(function(v) {
	  //console.log(v);
	  expect(v).to.have.property('data').property('results');
	  var r = v.data.results;

	  // SPU_008174 is on Scaffold743
	  expect(r).property('scaffold').to.equal('Scaffold743');

	  // the span of the gene with the requested margins, on the scaffold:
	  expect(r).property('span').to.eql([168342, 188864]);
	  expect(r.span[1] - r.span[0]).to.eql(r.sequence.length);

	  // Scaffold743 is 20,522bp long
	  expect(r).property('sequence').to.have.length.of(20522);
	  expect(r).property('quality').to.have.length.of(20522);

	  // the features of the gene
	  expect(r).property('features').
	    eql([{"span": [168842, 188364], "type": "gene", "id": "SPU_008174gn", "strand": "+"},
		 {"span": [168842, 188364], "type": "transcript", "id": "SPU_008174-tr", "strand": "+"},
		 {"span": [168842, 169029], "type": "exon", "id": "SPU_008174:0", "strand": "+"},
		 {"span": [185066, 185375], "type": "exon", "id": "SPU_008174:1", "strand": "+"},
		 {"span": [188281, 188364], "type": "exon", "id": "SPU_008174:2", "strand": "+"}]);

	});

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
  }]).

  factory('data_getTree_test', ['$http', function($http) {
    return function() {
      var expect = chai.expect;
      return expect($http.post('/data/getTree', {name: 'SPU_022066'})).
	to.be.fulfilled.then(function(v) {
	  //console.log(v);
	  expect(v).to.have.property('data').property('results');
	  var r = v.data.results;
	  expect(r).property('name').to.equal('SPU_022066')
	  expect(r).property('scaffold').to.equal('Scaffold694'); //SPU_002266 is on Scaffold694
	  expect(r).property('span').to.eql([10480, 18337]);
	  expect(r).property('type').to.equal('gene');
	  expect(r).to.have.property('children');
	  var c = r.children;
	  expect(c).property('0').property('type').equal('transcript');

	  // the expected entirety of the result:
	  var e = {"span": [10480, 18337],
		   "name": "SPU_022066",
		   "scaffold": "Scaffold694",
		   "type": "gene",
		   "children": [{"span": [0, 7857],
				 "name": "Sp-Shmt2_1",
				 "scaffold": "Scaffold694",
				 "type": "transcript",
				 "children": [{"span": [0, 33],
					       "name": "SPU_022066_3UTR:0\"",
					       "scaffold": "Scaffold694",
					       "type": "three_prime_UTR",
					       "children": [],
					       "strand": "-"},
					      {"span": [34, 203],
					       "name": "SPU_022066:0\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [926, 1153],
					       "name": "SPU_022066:1\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [1395, 1517],
					       "name": "SPU_022066:2\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [2233, 2346],
					       "name": "SPU_022066:3\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [2849, 3061],
					       "name": "SPU_022066:4\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [3700, 4058],
					       "name": "SPU_022066:5\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"},
					      {"span": [7508, 7857],
					       "name": "SPU_022066:6\"",
					       "scaffold": "Scaffold694",
					       "type": "exon",
					       "children": [],
					       "strand": "-"}],
				 "strand": "-"}],
		   "strand": "-"};
	  expect(r).to.eql(e);
	});
    };
  }]).

  factory('getTree', ['$http', '$q', 'SequenceInfo',
			 function($http, $q, SequenceInfo) {
    return function (name, margin) {
      var deferred = $q.defer();
      $http.post('/data/getTree', {name: name}).
	success(function (v) {
	  var results = v['results']
	  //var si = new SequenceInfo(results);//.add_features(featuresData);
	  //deferred.resolve(si);
	  deferred.resolve(results);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]);
