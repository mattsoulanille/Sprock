'use strict';

/* Controllers */
angular.module('sprock.controllers', []).

  controller('Tester1', ['$scope', '$injector', function($scope, $injector) {
    var expect = chai.expect;
    var test_names = ['each_from_server_test',
		      'data_muks_test',
		      'mukmuk_test',
		      'data_getTree_test',
		      'data_getGene_test',
		      'data_getFeatures_test',
		      'data_getSeq_test',
		      'GeneSequenceInfo_test'
		     ];

    var test_functions = [

      function test1() {
	return expect(1+1).to.equal(2);
      },

      function test2() {
	return expect('foo').to.be.a('string');
      },

      function() { return
        $injector.invoke(['$timeout', function($timeout) {
	  var tp = $timeout(function() { return 'good' }, 0);
	  return chai.assert.eventually.equal(tp, 'good', 'bad goodness expectable');
	}])},

      function() { return
	$injector.invoke(['$timeout', function($timeout) {
	var tp = $timeout(function() { return 'happy' }, 1000);
	return expect(tp).to.eventually.equal('happy');
      }])},

//      $injector.get('data_getSeq_test'),
    ];

    $scope.test_results = function(tests) {
      var results = _.map(tests, function(test) {
	return test.call(test);
      });
      return results;
    }(test_functions);

    $scope.named_test_results = function(names) {
      return _.map(names, function(test_name) {
	return [test_name, $injector.invoke([test_name, function(test) { return test.call(test) }])];
      })}(test_names);

}]).

  controller('Tester2', ['$scope', 'mukmuk', function($scope, mukmuk) {
    $scope.done = false;
    mukmuk(10, 1, function(mm, mmnew) {
      $scope.muks = mm;
    }, 0.5).
      then(function(v) {$scope.done = true});
  }]).

  controller('MyCtrl1', ['$scope', '$http', function($scope, $http) {
    $scope.serverError = '';
    $scope.calcN = function() {
      $scope.N = Math.max(Math.min(20, parseInt($scope.text_N)));
      $http.post('/data/n', {N: $scope.N}).
	success(function (v) {
	  console.log(v);
	  $scope.results = v['count'];
	  $scope.serverError = null;
	  console.log($scope.results);
	}).
	error(function(data, status, headers, config) {
	  console.log(data);
	  angular.element(data);
	  $scope.serverError = data;
	  $scope.results = null;
	});
    };
  }]).

  controller('MyCtrl2', ['$scope', '$http', 'getSequence',
			  function($scope, $http, getSequence) {
    $scope.serverError = null;
    $scope.getSeq = function() {
      $scope.scaffold = 'Scaffold' + $scope.scaffoldNumber;
      getSequence($scope.scaffold, $scope.start, $scope.end).
	then(function (v) {
	  $scope.sequenceData = v;
	  $scope.serverError = null;
	},
	function(data) {
	  console.log(data);
	  angular.element(data);
	  $scope.serverError = data;
	  $scope.results = null;
	});
    };
  }]).

  controller('MyCtrl3', ['$scope', '_', '$http', 'getGene',
			  function($scope, _, $http, getGene) {
    $scope.serverError = '';
    $scope.getGene = function() {
      getGene($scope.gene_name).
	then(function (v) {
	  $scope.gene = v;
	  $scope.gene_exons_pairs = _.pairs($scope.gene.exons);
	  $scope.serverError = null;
	},
	function(data) {
	  console.log(data);
	  angular.element(data);
	  $scope.serverError = data;
	  $scope.gene = null;
	  $scope.gene_exons_pairs = null;
	});
    };
  }]).

  controller('MyCtrl4', ['_', '$q', '$http', '$scope', 'getTree', 'getGene', 'getFeatures', 'getSequence', 'GeneSequenceInfo', function(_, $q, $http, $scope, getTree, getGene, getFeatures, getSequence, GeneSequenceInfo) {
    $scope.serverError = null;
    $scope.margin = 500;	//FIXME
    $scope.target_span = 2000;
    $scope.max_span = 4000;
    $scope.min_overlap = 1000;
    $scope.fuzz = 500;

    $scope.getContextInformation = function() {
      //$scope.gsi = new GeneSequenceInfo($scope.gene_name, $scope.margin, $scope);
      get_featureful_sequence_objects();
    };

    function get_gene() {
      if (!$scope.gene_promise) {
	$scope.gene_promise = getGene($scope.gene_name);
	$scope.gene_promise.then(function(gene) {
	  $scope.gene = gene;
	})};
      return $scope.gene_promise;
    };

    function get_features() {
      if (!$scope.features_promise) {
	$scope.features_promise = get_gene().
	  then(function(gene) {
	    return getFeatures(gene.scaffold,
			       Math.max(0, gene.start - $scope.margin),
			       gene.end + $scope.margin);
	  }).
	  then(function(v) {
	    return $scope.features = v;
	  });
      };
      return $scope.features_promise;
    };

    function get_sequence() {
      if (!$scope.sequence_promise) {
	$scope.sequence_promise = get_gene().
	  then(function(gene) {
	    return getSequence(gene.scaffold,
			       Math.max(0, gene.start - $scope.margin),
			       gene.end + $scope.margin);
	  }).
	  then(function(v) {
	    return $scope.sequence_info = v;
	  });
      };
      return $scope.sequence_promise;
    };

    function get_sequence_objects() {
      if (!$scope.sequence_objects_promise) {
	$scope.sequence_objects_promise = get_sequence().
	  then(function(si) {
	    var so = {};
	    so.scaffold = si.scaffold;
	    so.span = [si.start, si.end];
	    so.sequenceObjectsArray =
	      _.reduce(
		_.map(
		  _.zip(si.sequence, si.quality),
		  function(sq) { return { b: sq[0], q: sq[1] }; }
		),
		function(memo, o) { memo.push(o); return memo; },
		[]);
	    return $scope.sequence_objects = so;
	  })};
      return $scope.sequence_objects_promise;
    };

    function get_informed() {
      if (!$scope.informed_promise) {
	$scope.informed_promise = $q.all({ features: get_features(),
					   sequence_info_objects: get_sequence_objects()});
      };
      return $scope.informed_promise;
    };

    function get_featureful_sequence_objects() {
      if (!$scope.featureful_sequence_objects_promise) {
	$scope.featureful_sequence_objects_promise = get_informed().
	  then(function(v) {
	    var features = v.features;
	    var so = v.sequence_info_objects;
	    var soa = so.sequenceObjectsArray;
	    _.each(features.features, function(f) {
	      // Mark beginning & end of the type represented by this node
	      var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	      soa[Math.max(0, f.span[0]-features.start)][k] = f.type;
	      soa[Math.min(soa.length-1, f.span[1]-features.start)][k] = null;
	    });
	    $scope.soa = soa;
	    return v; //our work has updated an existing object, not created a new one
	  })};
      return $scope.featureful_sequence_objects_promise;
    };

  }]);
