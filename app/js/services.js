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
	eql({start: 2,		//OBSOLETE
	     scaffold: "Scaffold1",
	     end: 34,		//OBSOLETE
	     span: [2, 34],
	     quality: [35,35,32,35,53,47,41,42,46,45,29,29,29,32,33,51,51,51,51,51,51,46,46,46,46,40,40,40,44,44,39,32],
	     sequence: "CATTTTATCACCAGTTCGATTTTCCCCTTGTT"});
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
    return function (scaffold, start, end, completely_within) {
      var deferred = $q.defer();
      $http.post('/data/getFeatures', {scaffold: scaffold,
				       start: start,
				       end: end,
				       completely_within: !!completely_within}).
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

  factory('data_getTree_test', ['$http', function($http) {
    return function() {
      var expect = chai.expect;
      return expect($http.post('/data/getTree', {name: 'SPU_022066',
						relative_positions: true})).
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
    return function (name, relative_positions) {
      var deferred = $q.defer();
      $http.post('/data/getTree', {name: name, relative_positions: relative_positions}).
	success(function (v) {
	  var results = v['results']
	  deferred.resolve(results);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});
      return deferred.promise;
    };
  }]).

  factory('data_muks_test', ['$http', function($http) {
    return function() {
      var expect = chai.expect;
      var t1 = $http.post('/data/make_muks', {n: 10, interval:1.2});
      var t2 = $http.post('/data/get_muks', {from: 0});
      expect(t2).eventually.to.have.property('data').property('results').
	property('muks').an('array').of.length(0);
      expect(t1).to.be.fulfilled.then(function(v) {
	expect(v).to.have.property('data').property('results').
	  an('array').of.length(10).
	  property(0).a.string('muk 0');
	expect($http.post('/data/get_muks', {from: 5})).
	  eventually.to.have.property('data').property('results').
	  property('muks').an('array').of.length(5).
	  property(0).a.string('muk 5');
      });
    };
  }]).

  factory('mukmuk_test', ['_', 'mukmuk', function(_, mukmuk) {
    return function() {
      var expect = chai.expect;
      var mmp = mukmuk(10, 0.5, function(mm, mmnew) {
	//console.log('new: ' + JSON.stringify(mmnew));
	//console.log('mm: ' + JSON.stringify(mm));
	expect(mmnew).to.be.an('array').of.length.above(0);
	expect(_.last(mm, mmnew.length)).to.eql(mmnew);
      });
      expect(mmp).eventually.to.be.an('array').of.length(10);
    };
  }]).

  factory('mukmuk', ['_', '$http', '$q', '$timeout', function(_, $http, $q, $timeout) {
    return function (n, dt, cb, poll_period_s) {
      cb = cb || _.identity;
      poll_period_s = poll_period_s || 1.0;
      var deferred = $q.defer();

      $http.post('/data/make_muks', {n:n, interval:dt}).
	success(function(v) {
	  var results = v['results'];
	  deferred.resolve(results);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  deferred.reject(data);
	});

      var mukmuk = [];
      function poll_more(from) {
	return $http.post('/data/get_muks', {from:from}).
	  then(function(v) {
	    var muks_increment = v.data.results.muks;
	    return muks_increment;
	  });
      };

      function get_hunks_until_done(wait, cb) {
	console.log(wait);
	$timeout(function() {
	  poll_more(mukmuk.length).then(function(more) {
	    _.each(more, function(muk) { mukmuk.push(muk) });
	    cb(mukmuk, more);
	    if (mukmuk.length < n) {
	      get_hunks_until_done(wait, cb);
	    };
	  });
	}, wait * 1000);
      };

      get_hunks_until_done(poll_period_s, cb);
      return deferred.promise;
    };
  }]).

  factory('eachFromServer_test', ['_', 'eachFromServer', function(_, eachFromServer) {
    return function() {
      var expect = chai.expect;

      var sum = 0;
      expect(eachFromServer('xrange', function(v) {
	sum += v;
      }, [5,0,-1]).then(function() {
	return sum;
      })).eventually.to.eql(15);

      var s = '';
      expect(eachFromServer('str', function(v) {
	s += v;
      }, ['cat']).then(function() {
	return s;
      })).eventually.to.eql('cat');

      expect(eachFromServer('exec', _.identity, ['sys.exit(1)'])).
	to.be.rejectedWith(403);

      var s2 = 0;
      expect(eachFromServer('sleepy_range', function(v) {
	s2 += v;
      }, [5,0,-1]).then(function() {
	return s2;
      })).eventually.to.eql(15);

      var s3 = 0
      expect(eachFromServer('sleepy_range', function(v) {
	s3 += v;
      }, [100,99,-1]).then(function() {
	return s3;
      })).eventually.to.eql(100);

      var s4 = 0
      expect(eachFromServer('sleepy_range', function(v) {
	s4 += v;
      }, [7,6,-1]).then(function() {
	return s4;
      })).eventually.to.eql(7);

      var s5 = [];
      expect(eachFromServer('echoArgs', function(v) {
	s5.push(v);
      }, [2, 'cat', 3.14], {foo:'bar'}).then(function() {
	return s5;
      })).eventually.to.eql([ '2', 'cat', '3.14', 'foo: bar' ]);

      var s6 = [];
      expect(eachFromServer('echoArgs', function(v) {
	s6.push(v);
      }, [], {'A':'one', 'B':'two'}).then(function() {
	return s6;
      })).eventually.to.eql([ 'A: one', 'B: two']);

    };
  }]).

  factory('eachFromServer', ['_', '$http', '$q',  function(_, $http, $q) {
    return function(obj_name, fun, args, kwargs) {
      fun = fun || _.identity;
      var deferred = $q.defer()
      $http.post('/data/iter', {name: obj_name, args: args, kwargs: kwargs}).
	success(function(data) {

	  function do_next(iter) {
	    return $http.post('/data/next', {iter: iter}).
	      success(function(data) {
		//console.log(data);
		if (data.stop) {
		  deferred.resolve();
		  return 0;
		} else {
		  fun(data.value);
		  return 1 + do_next(data.iter || iter);
		}
	      }).
	      error(function(data, status) {
		//console.log(data, status);
		deferred.reject(status);
	      });
	  };

	  return do_next(data.iter);
	}).
	error(function(data, status) {
	  deferred.reject(status);
	});

      return deferred.promise;
    };
  }]);
