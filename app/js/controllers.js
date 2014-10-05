'use strict';

/* Controllers */
angular.module('sprock.controllers', []).

  controller('Tester1', ['_', '$scope', '$injector', function(_, $scope, $injector) {
    var expect = chai.expect;
    var test_names = ['eachFromServer_test',
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

  controller('MyDev', ['$scope', '_', function($scope, _) {
    $scope.done = false;
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

  controller('MyCtrl4', ['_', '$q', '$http', '$scope', 'getTree', 'getGene', 'getFeatures', 'getSequence', 'GeneSequenceInfo', 'eachFromServer', function(_, $q, $http, $scope, getTree, getGene, getFeatures, getSequence, GeneSequenceInfo, eachFromServer) {
    $scope.serverError = null;
    $scope.margin = 500;	//FIXME
    $scope.target_primer_span = 2000;
    $scope.maximum_primer_span = 4000;
    $scope.minimum_overlap = 1000;
    $scope.fuzz = 500;
//    $scope.status = {open: false}; //FIXME: is this needed?

    // DEBUGGING h&w:
    $scope.watch_count = 0;
    $scope.$watch(function(scope) {
      scope.watch_count++;
      return 0;
    });


    $scope.makePrimers = function() {
      calc_primer_windows();
      $scope.primers = [];
      return eachFromServer('primers', function(v) {
	$scope.primers.push(v);	//FIXME: RETURNS PrimerPairPossibilities I think
      }, [], { scaffold: $scope.gene.scaffold,
	       target_primer_span: $scope.target_primer_span,
	       maximum_primer_span: $scope.maximum_primer_span,
	       minimum_overlap: $scope.minimum_overlap,
	       primer_windows: $scope.primer_windows,
	       fuzz: $scope.fuzz }).then(function(v) {
		 $scope.primers_eventually_was = v; //FIXME
	       });
    };

    function get_gene() {
      if ($scope.gene_name == undefined) return null;
      return $scope.gene_promise = getGene($scope.gene_name).
	then(
	  function(v) {
	    $scope.gene = v;
	  },
	  function(why) {
	    $scope.gene = null;
	  });
    };
    $scope.$watch('gene_name', get_gene);

    function calc_desired_sequence_span() {
      if ($scope.gene == undefined) return;
      $scope.sequence_span_to_examine = [Math.max(0, $scope.gene.start - $scope.margin),
					 $scope.gene.end + $scope.margin];
      get_features().
	then(function(features) {
	  // We start with the full span for which we've gotten features.
	  var dss = $scope.sequence_span_to_examine.slice(0); // a copy
	  var gene_span = [$scope.gene.start, $scope.gene.end];

	  // The nearest feature outside of the gene (if any), on each side,
	  // will require us to move the desired sequence in so that it abuts
	  // that feature.
	  // Find all the feature boundaries (edges) in the examined span
	  var edges = _.chain(features.features).
		pluck('span').flatten().uniq().sortBy(_.identity).value();


	  // Find where the gene boundaries fall relative to the features
	  // _.sortedIndex(): "... the index at which the value should be
	  // inserted into the list in order to maintain the list's sorted order."
	  var ixen = _.map(gene_span,
			   function(v) {
			     return _.sortedIndex(edges, v);
			   });

	  // If the left-hand index is > 0, the edge to it's immediate left
	  // is the nearest feature boundary on that side:
	  if (ixen[0] > 0) {
	    dss[0] = edges[ixen[0]-1];
	  };

	  // Look rightward along the edge list, starting at the right-hand index,
	  // until we find an edge greater that the end of the gene, in which
	  // case we use it as our boundary, or we fall off the feature edges list,
	  // in which case we can keep the full rightward span.
	  var i = ixen[1];
	  while (i < edges.length && edges[i] <= gene_span[1]) i++;
	  if (i < edges.length) dss[1] = edges[i];

	  // Transmit our result to the $scope
	  $scope.desired_sequence_span = dss;
	});
    };
    $scope.$watch('gene', calc_desired_sequence_span);
    $scope.$watch('margin', calc_desired_sequence_span);

    function get_features() {
      if ($scope.gene == undefined ||
	  $scope.sequence_span_to_examine == undefined ||
	  $scope.sequence_span_to_examine[0] == null ||
	  $scope.sequence_span_to_examine[1] == null) return null;
      var gene = $scope.gene;
      var want_span = $scope.sequence_span_to_examine;
      return $scope.features_promise =
	getFeatures(gene.scaffold, want_span[0], want_span[1]).
	then(function(v) {
	  v.features = _.sortBy(v.features,
				function(f) { return f.span[0]; });
	  return $scope.features = v;
	});
    };

/*    $scope.informed_counter = 0; // a $watch'able to indicate an update
    function get_informed() {
      if ($scope.gene) {
	return $scope.informed_promise =
	  $q.all({ features: get_features(),
		   sequence_info: get_sequence()}).
	  then(function(v) {
	    $scope.informed_counter++;
	  })
      } else {
	var d = $q.defer();
	d.reject('gene is null');
	$scope.soa = [];
	return d.promise;
      };
    };
*/
    function get_sequence() {
      if ($scope.gene == undefined) return null;
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
      return $scope.sequence_info_promise =
	getSequence(gene.scaffold, want_span[0], want_span[1]).
	then(function(v) {
	  return $scope.sequence_info = v;
	});
    };
    $scope.$watch('desired_sequence_span', get_sequence);

    function calc_primer_windows() {
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
      var exon_spans =
	    _.reduce(gene.exons.exons,
		     function(memo, v) {
		       memo.push(v);
		       return memo;
		     },
		     []).
	    sort();
      var t = 
	    _.reduce(exon_spans,
		     function(memo, v) {
		       _.last(memo).push(v[0]);
		       memo.push([v[1]]);
		       return memo;
		     },
		     [[want_span[0]]]);
      _.last(t).push(want_span[1]);
      $scope.primer_windows = t;
    };

    function get_sequence_objects() {
      if ($scope.sequence_info == undefined) return null;
      var si = $scope.sequence_info;
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
      $scope.sequence_objects = so;
      add_features_to_sequence_objects();
      return $scope.sequence_objects;
    };
    $scope.$watch('sequence_info', get_sequence_objects);

    function add_features_to_sequence_objects() {
      var features = $scope.features;
      var si = $scope.sequence_info;
      var soa = $scope.sequence_objects.sequenceObjectsArray;
      _.each(features.features, function(f) {
	// Mark beginning & end of the type represented by this node

	// Skip features that are completely outside the sequence
	if (f.span[1] <= si.start || f.span[0] >= si.end) return;

	var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	soa[Math.max(0, f.span[0]-si.start)][k] = f.type;
	soa[Math.min(soa.length-1, f.span[1]-si.start)][k] = null;
      });
      return $scope.soa = soa;
    };

  }]).

  controller('MyCtrl5', ['_', '$q', '$http', '$scope', 'getTree', 'getGene', 'getFeatures', 'getSequence', 'GeneSequenceInfo', 'eachFromServer', function(_, $q, $http, $scope, getTree, getGene, getFeatures, getSequence, GeneSequenceInfo, eachFromServer) {
    $scope.serverError = null;
    $scope.margin = 5000;	//FIXME
    $scope.prime = {
      minimum_primer_span: 100,
      target_primer_span: 2000,
      maximum_primer_span: 4000,
      minimum_overlap: 1000,
      fuzz: 500
    };
    $scope.soa_tickle_counter = 0;
//    $scope.status = {open: false}; //FIXME: is this needed?

    // DEBUGGING h&w:
    $scope.watch_count = 0;
    $scope.$watch(function(scope) {
      scope.watch_count++;
      return 0;
    });

    function get_gene() {
      if ($scope.gene_name == undefined) return null;
      return $scope.gene_promise = getGene($scope.gene_name).
	then(
	  function(v) {
	    $scope.gene = v;
	    calc_excluded_spans(v);
	  },
	  function(why) {
	    $scope.gene = null;
	  });
    };
    $scope.$watch('gene_name', get_gene);

    function calc_excluded_spans(gene) {
      $scope.prime.excluded_spans =
	_.reduce(gene.exons.exons,
		     function(memo, v) {
		       memo.push(v);
		       return memo;
		     },
		     []).
	    sort();
/*      $scope.prime.excluded_region = _.map($scope.excluded_spans,
					   function(v) {
					     return [v[0], v[1]-v[0]]
					   });
/*      $scope.excluded_spans =
	_.chain(features.features).where({type:'exon'}).pluck('span').value();*/
    };

    function get_features() {
      // NOTE: Restricted to just the gene's span!
      if ($scope.gene == undefined) return null;
      var gene = $scope.gene;
      var want_span = [$scope.gene.start, $scope.gene.end];
      return $scope.features_promise =
	getFeatures(gene.scaffold, want_span[0], want_span[1], true).
	then(function(v) {
	  v.features = _.sortBy(v.features,
				function(f) { return f.span[0]; });
	  return $scope.features = v;
	});
    };
    $scope.$watch('gene', get_features);

    function init_desired_sequence_boundaries_from_gene() {
      if ($scope.gene == undefined) return null;
      return $scope.desired_sequence_span = [Math.max(0, $scope.gene.start - $scope.margin),
				      $scope.gene.end + $scope.margin];
    };
    $scope.$watch('gene', init_desired_sequence_boundaries_from_gene);

    function get_sequence() {
      if ($scope.gene == undefined) return null;
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
      return $scope.sequence_info_promise =
	getSequence(gene.scaffold, want_span[0], want_span[1]).
	then(function(v) {
	  return $scope.sequence_info = v;
	});
    };
    $scope.$watchCollection('desired_sequence_span', get_sequence);

    $scope.makePrimers = function() {
      $scope.ppp_list = [];
      calc_primer_windows();
      $scope.prime.scaffold = $scope.gene.scaffold;
      return eachFromServer('primers', function(v) {
	console.log(v);
	$scope.ppp_list.push(v);
	note_new_ppp(v, $scope.ppp_list.length);
      }, [], $scope.prime).then(function(v) {
	$scope.ppp_list_eventually_was = v; //FIXME
      });
    };

    function enter_feature_in_sequence_objects_array(type, span) {
      var si = $scope.sequence_info;
      var soa = $scope.sequence_objects.sequenceObjectsArray;

      // Skip features that are completely outside the sequence
      if (span[1] <= si.start || span[0] >= si.end) return;

      var k = {gene:'g', transcript:'t', exon:'x'}[type] || type;
      soa[Math.max(0, span[0]-si.start)][k] = type;
      soa[Math.min(soa.length-1, span[1]-si.start)][k] = null;
    };

    function note_new_ppp(ppp, which) {
      var si = $scope.sequence_info;
      var soa = $scope.sequence_objects.sequenceObjectsArray;

      //_.each(ppp.primer_pairs, function(pp) {
      if (ppp.primer_pair_num_returned > 0) {
	var pp = ppp.primer_pairs[0];

	enter_feature_in_sequence_objects_array('left-primer', pp.left.span);
	enter_feature_in_sequence_objects_array('right-primer', pp.right.span);
	enter_feature_in_sequence_objects_array('primer-product-' + which,
						[pp.left.span[0], pp.right.span[1]]);
/*
	//FIXME: REFACTOR along with add_features_to_sequence_objects()
        var f = {type: 'left-primer', span: pp.left.span};

	// Skip features that are completely outside the sequence
	if (f.span[1] <= si.start || f.span[0] >= si.end) return;

	var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	soa[Math.max(0, f.span[0]-si.start)][k] = f.type;
	soa[Math.min(soa.length-1, f.span[1]-si.start)][k] = null;

	var f = {type: 'right-primer', span: pp.right.span};

	// Skip features that are completely outside the sequence
	if (f.span[1] <= si.start || f.span[0] >= si.end) return;

	var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	soa[Math.max(0, f.span[0]-si.start)][k] = f.type;
	soa[Math.min(soa.length-1, f.span[1]-si.start)][k] = null;
*/
	// Let the world know we've changed the sequenceObjectsArray
	$scope.soa_tickle_counter++;
      };
    };

    function calc_primer_windows() {
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
/*
      var exon_spans =
	    _.reduce(gene.exons.exons,
		     function(memo, v) {
		       memo.push(v);
		       return memo;
		     },
		     []).
	    sort(); */
      var t =
	    _.reduce($scope.prime.excluded_spans,
		     function(memo, v) {
		       _.last(memo).push(v[0]);
		       memo.push([v[1]]);
		       return memo;
		     },
		     [[want_span[0]]]);
      _.last(t).push(want_span[1]);
      $scope.prime.primer_windows = t;
    };

/*
    function calc_desired_sequence_span() {
      if ($scope.gene == undefined) return;
      $scope.sequence_span_to_examine = [Math.max(0, $scope.gene.start - $scope.margin),
					 $scope.gene.end + $scope.margin];
      get_features().
	then(function(features) {
	  // We start with the full span for which we've gotten features.
	  var dss = $scope.sequence_span_to_examine.slice(0); // a copy
	  var gene_span = [$scope.gene.start, $scope.gene.end];

	  // The nearest feature outside of the gene (if any), on each side,
	  // will require us to move the desired sequence in so that it abuts
	  // that feature.
	  // Find all the feature boundaries (edges) in the examined span
	  var edges = _.chain(features.features).
		pluck('span').flatten().uniq().sortBy(_.identity).value();


	  // Find where the gene boundaries fall relative to the features
	  // _.sortedIndex(): "... the index at which the value should be
	  // inserted into the list in order to maintain the list's sorted order."
	  var ixen = _.map(gene_span,
			   function(v) {
			     return _.sortedIndex(edges, v);
			   });

	  // If the left-hand index is > 0, the edge to it's immediate left
	  // is the nearest feature boundary on that side:
	  if (ixen[0] > 0) {
	    dss[0] = edges[ixen[0]-1];
	  };

	  // Look rightward along the edge list, starting at the right-hand index,
	  // until we find an edge greater that the end of the gene, in which
	  // case we use it as our boundary, or we fall off the feature edges list,
	  // in which case we can keep the full rightward span.
	  var i = ixen[1];
	  while (i < edges.length && edges[i] <= gene_span[1]) i++;
	  if (i < edges.length) dss[1] = edges[i];

	  // Transmit our result to the $scope
	  $scope.desired_sequence_span = dss;
	});
    };
    $scope.$watch('gene', calc_desired_sequence_span);
    $scope.$watch('margin', calc_desired_sequence_span);
*/

    function get_sequence_objects() {
      if ($scope.sequence_info == undefined) return null;
      return $scope.get_sequence_objects_promise =
	$q.all({sequence_info: $scope.sequence_info_promise,
		features: $scope.features_promise}).
	then(function(v) {
	  var si = v.sequence_info;
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
	  $scope.sequence_objects = so;
	  add_features_to_sequence_objects();
	  return $scope.sequence_objects;
	});
    };
//    $scope.$watch('sequence_info', get_sequence_objects);

    function add_features_to_sequence_objects() {
      var features = $scope.features;
      var si = $scope.sequence_info;
      var soa = $scope.sequence_objects.sequenceObjectsArray;
      _.each(features.features, function(f) {
	// Mark beginning & end of the type represented by this node

	// Skip features that are completely outside the sequence
	if (f.span[1] <= si.start || f.span[0] >= si.end) return;

	var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	soa[Math.max(0, f.span[0]-si.start)][k] = f.type;
	soa[Math.min(soa.length-1, f.span[1]-si.start)][k] = null;
      });
      return $scope.soa = soa;
    };

  }]).

  controller('MyCtrl6', ['_', '$q', '$http', '$scope', 'getTree', 'getGene', 'getFeatures', 'getSequence', 'GeneSequenceInfo', 'eachFromServer', function(_, $q, $http, $scope, getTree, getGene, getFeatures, getSequence, GeneSequenceInfo, eachFromServer) {
    $scope.serverError = null;
    $scope.margin = 5000;	//FIXME
    $scope.prime = {
      minimum_primer_span: 100,
      target_primer_span: 2000,
      maximum_primer_span: 4000,
      minimum_overlap: 1000,
      fuzz: 500
    };
    $scope.soa_tickle_counter = 0;

    // DEBUGGING h&w:
    $scope.watch_count = 0;
    $scope.$watch(function(scope) {
      scope.watch_count++;
      return 0;
    });

    function get_gene() {
      if ($scope.gene_name == undefined) return null;
      return $scope.gene_promise = getTree($scope.gene_name).
	then(
	  function(v) {
	    $scope.gene = v;
//	    calc_excluded_spans(v);
	  },
	  function(why) {
	    $scope.gene = null;
	  });
    };
    $scope.$watch('gene_name', get_gene);

    function calc_excluded_spans(gene) {
      $scope.prime.excluded_spans =
	_.reduce(gene.exons.exons,
		     function(memo, v) {
		       memo.push(v);
		       return memo;
		     },
		     []).
	    sort();
/*      $scope.prime.excluded_region = _.map($scope.excluded_spans,
					   function(v) {
					     return [v[0], v[1]-v[0]]
					   });
/*      $scope.excluded_spans =
	_.chain(features.features).where({type:'exon'}).pluck('span').value();*/
    };

    function init_desired_sequence_boundaries_from_gene() {
      if ($scope.gene == undefined) return null;
      return $scope.desired_sequence_span = [Math.max(0, $scope.gene.span[0] - $scope.margin),
				      $scope.gene.span[1] + $scope.margin];
    };
    $scope.$watch('gene', init_desired_sequence_boundaries_from_gene);

    function get_sequence() {
      if ($scope.gene == undefined) return null;
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
      return $scope.sequence_info_promise =
	getSequence(gene.scaffold, want_span[0], want_span[1]).
	then(function(v) {
	  return $scope.sequence_info = v;
	});
    };
    $scope.$watchCollection('desired_sequence_span', get_sequence);

    $scope.makePrimers = function() {
      $scope.ppp_list = [];
      calc_primer_windows();
      $scope.prime.scaffold = $scope.gene.scaffold;
      return eachFromServer('primers', function(v) {
	console.log(v);
	$scope.ppp_list.push(v);
	note_new_ppp(v, $scope.ppp_list.length);
      }, [], $scope.prime).then(function(v) {
	$scope.ppp_list_eventually_was = v; //FIXME
      });
    };

    function calc_primer_windows() {
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
/*
      var exon_spans =
	    _.reduce(gene.exons.exons,
		     function(memo, v) {
		       memo.push(v);
		       return memo;
		     },
		     []).
	    sort(); */
      var t =
	    _.reduce($scope.prime.excluded_spans,
		     function(memo, v) {
		       _.last(memo).push(v[0]);
		       memo.push([v[1]]);
		       return memo;
		     },
		     [[want_span[0]]]);
      _.last(t).push(want_span[1]);
      $scope.prime.primer_windows = t;
    };

/*
    function calc_desired_sequence_span() {
      if ($scope.gene == undefined) return;
      $scope.sequence_span_to_examine = [Math.max(0, $scope.gene.start - $scope.margin),
					 $scope.gene.end + $scope.margin];
      get_features().
	then(function(features) {
	  // We start with the full span for which we've gotten features.
	  var dss = $scope.sequence_span_to_examine.slice(0); // a copy
	  var gene_span = [$scope.gene.start, $scope.gene.end];

	  // The nearest feature outside of the gene (if any), on each side,
	  // will require us to move the desired sequence in so that it abuts
	  // that feature.
	  // Find all the feature boundaries (edges) in the examined span
	  var edges = _.chain(features.features).
		pluck('span').flatten().uniq().sortBy(_.identity).value();


	  // Find where the gene boundaries fall relative to the features
	  // _.sortedIndex(): "... the index at which the value should be
	  // inserted into the list in order to maintain the list's sorted order."
	  var ixen = _.map(gene_span,
			   function(v) {
			     return _.sortedIndex(edges, v);
			   });

	  // If the left-hand index is > 0, the edge to it's immediate left
	  // is the nearest feature boundary on that side:
	  if (ixen[0] > 0) {
	    dss[0] = edges[ixen[0]-1];
	  };

	  // Look rightward along the edge list, starting at the right-hand index,
	  // until we find an edge greater that the end of the gene, in which
	  // case we use it as our boundary, or we fall off the feature edges list,
	  // in which case we can keep the full rightward span.
	  var i = ixen[1];
	  while (i < edges.length && edges[i] <= gene_span[1]) i++;
	  if (i < edges.length) dss[1] = edges[i];

	  // Transmit our result to the $scope
	  $scope.desired_sequence_span = dss;
	});
    };
    $scope.$watch('gene', calc_desired_sequence_span);
    $scope.$watch('margin', calc_desired_sequence_span);
*/

    function get_sequence_objects() {
      if ($scope.sequence_info == undefined) return null;
      return $scope.get_sequence_objects_promise =
	$q.all({sequence_info: $scope.sequence_info_promise,
		features: $scope.features_promise}).
	then(function(v) {
	  var si = v.sequence_info;
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
	  $scope.sequence_objects = so;
	  add_features_to_sequence_objects();
	  return $scope.sequence_objects;
	});
    };
//    $scope.$watch('sequence_info', get_sequence_objects);

    function add_features_to_sequence_objects() {
      var features = $scope.features;
      var si = $scope.sequence_info;
      var soa = $scope.sequence_objects.sequenceObjectsArray;
      _.each(features.features, function(f) {
	// Mark beginning & end of the type represented by this node

	// Skip features that are completely outside the sequence
	if (f.span[1] <= si.start || f.span[0] >= si.end) return;

	var k = {gene:'g', transcript:'t', exon:'x'}[f.type] || f.type;
	soa[Math.max(0, f.span[0]-si.start)][k] = f.type;
	soa[Math.min(soa.length-1, f.span[1]-si.start)][k] = null;
      });
      return $scope.soa = soa;
    };

  }]).

  controller('Dev', ['_', '$scope', 'getTree', function(_, $scope, getTree) {
    $scope.done = false;


  }]);
