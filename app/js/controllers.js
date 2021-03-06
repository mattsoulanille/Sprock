'use strict';

/* Controllers */
angular.module('sprock.controllers', []).

  controller('Tester1', ['_', '$scope', '$injector', function(_, $scope, $injector) {
    var expect = chai.expect;
    var test_names = ['eachFromServer_test',
//		      'data_muks_test',
//		      'mukmuk_test',
		      'data_getTree_test',
		      'data_getGene_test',
		      'data_getFeatures_test',
		      'data_getSeq_test',
//		      'GeneSequenceInfo_test'
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

  controller('MyCtrl6', ['_', '$scope', '$log', '$q', '$http', 'getTree', 'getSequence', 'eachFromServer', 'PrimerPairPossibilitiesDB', 'downloadData', 'version', 'round', function(_, $scope, $log, $q, $http, getTree, getSequence, eachFromServer, PrimerPairPossibilitiesDB, downloadData, version, round) {

    $scope.tv = {
      treeUpdates: 0,
      makingPrimers: false
    };
    $scope.margin = 5000;	//FIXME
    $scope.prime = {
      minimum_primer_span: 100,
      target_primer_span: 2000,
      maximum_primer_span: 4000,
      minimum_overlap: 1000,
      fuzz: 500
    };
    $scope.log = $log;
    $scope.settings = {
      downloadFileBasename: 'sprock_primers',
      downloadFileSuffix: '.tsv',
      primerNameHead: 'TBS',
      primeButtonClasses: {},
      primeButtonText: 'No Gene!',
      primerReportSeparator: ',',
      maxSequencePosition: 1000000000
    };

    // A polyfill hack for compatibility with angular1.2
    // no guarantee of correctness
    if (angular.version.major == 1 &&
	angular.version.minor <=26) {
      $scope.$watchGroup = function(watchExpressions, listener) {
	//var name = _.uniqueId('polyfill_watchGroup_');
	_.each(watchExpressions, function(ex) { $scope.$watch(ex, listener) });
      };
    };


    // An ngKeyup suited for ng-model-options="{ updateOn: 'blur' }" fields
    $scope.cancelFormChanges = function (e, formName) {
      if (e.keyCode == 27) {
        eval("$scope." + formName).$rollbackViewValue(); // FIXME: find a safer way
      }
    };


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
	    calc_excluded_spans(v);
	  },
	  function(why) {
	    $scope.gene = null;
	  });
    };
    $scope.$watch('gene_name', function() {
      $scope.abortMakingPrimers = true;
      PrimerPairPossibilitiesDB.drop_all(); // New name means old primers don't apply
      get_gene();
    });

    function calc_excluded_spans(gene) {
      var w = _.walk(function(node) {
	return node.children;
      });
      $scope.prime.excluded_spans =
	_.sortBy(
	  _.compact(
	    w.map(gene, w.postorder, function(node) {
	      if (node.type === "exon") {
		return node.span;
	      } else {
		return null;
	      };
	    })));

    };


    function init_desired_sequence_boundaries_from_gene() {
      var rv = null;
      if ($scope.gene) {
	rv = [Math.max(0, $scope.gene.span[0] - $scope.margin),
	      $scope.gene.span[1] + $scope.margin];
      };
      $scope.settings.maxSequencePosition = 1000000000; // FIXME: not quite right
      return $scope.desired_sequence_span = rv;
    };
    $scope.$watch('gene', init_desired_sequence_boundaries_from_gene);


    function get_sequence() {
      if ($scope.gene == undefined) return null;
      $scope.settings.primeButtonText = 'getting sequence';
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
      return $scope.sequence_info_promise =
	getSequence(gene.scaffold, want_span[0], want_span[1]).
	then(function(v) {
	  $scope.settings.primeButtonText = 'make primers';
	  $scope.settings.primeButtonClasses = {'btn-primary': true};
	  if (v.span[1] < want_span[1]) {
	    $scope.settings.maxSequencePosition = want_span[1] = v.span[1];
	  };
	  return $scope.sequence_info = v;
	});
    };
    $scope.$watchCollection('desired_sequence_span', get_sequence);


    $scope.makePrimersPromise = $q.when(null);
    $scope.abortMakingPrimers = false;
    $scope.makeNewPrimers = false;
    $scope.makePrimers = function() {
      $scope.abortMakingPrimers = true;
      $scope.pleaseMakeNewPrimers = true;
    };

    function abortMaybeRestart() {
      if ($scope.abortMakingPrimers) {
	$q.when($scope.makePrimersPromise).then(
	  function(v) {
	    $scope.abortMakingPrimers = false;
	    if ($scope.pleaseMakeNewPrimers) {
	      $scope.pleaseMakeNewPrimers = false;
	      $scope.makePrimersPromise = makePrimers();
	    };
	  });
      };
    };
    $scope.$watch('abortMakingPrimers', abortMaybeRestart);

    function makePrimers() {
      $scope.tv.makingPrimers = 'started';
      $scope.settings.primeButtonText = 'making...';
      $scope.primingRunStart = new Date();
      $scope.primingRunFinish = null;
      $scope.pppList = [];
      PrimerPairPossibilitiesDB.drop_all(); // just to be sure
      calc_primer_windows();
      $scope.prime.scaffold = $scope.gene.scaffold;
      return eachFromServer('primers', function(v) {
	if ($scope.abortMakingPrimers) {
	  return 'abort';
	} else {
	  $scope.pppList.push(v);
	  $scope.settings.primeButtonText = 'Working, made ' +
	    countOfGoodPrimers() + ' pairs so far';
	  return '';
	};
      }, [], $scope.prime).then(function(v) {
	$scope.pppList_eventually_was = v;
	$scope.tv.makingPrimers = 'finished';
	$scope.primingRunFinish = new Date();
      }, function(why) {
	$scope.settings.primeButtonText = 'Failed'
	$scope.settings.primeButtonClasses = {'btn-warning': true};
	$scope.tv.makingPrimers = 'error';
	$scope.tv.mpErr = why;
      });
    };

    function countOfGoodPrimers() {
      var rv =
	    _.reduce(
	      _.map($scope.pppList, function(ppp) {
		return ppp.primer_pair_num_returned > 0 ? 1 : 0;
	      }),
	      function(memo, v) {
		return memo + v;
	      }, 0);
      return rv;
    };

    // Some UI status control
    $scope.$watch('tv.makingPrimers', function(newValue, oldValue) {
      $scope.settings.primeButtonClasses = {
	'btn-info': newValue == 'started',
	'btn-success': newValue == 'finished',
	'btn-warning': newValue == 'error'
      };

      if (newValue == 'started') {
	$scope.settings.primeButtonText = 'Working...';
      };
      if (newValue == 'finished') {
	$scope.settings.primeButtonText = 'Done: made ' + countOfGoodPrimers() + ' pairs';
      };
    });

    $scope.$watch('prime', function() {
      $scope.settings.primeButtonText = 'make primers';
      $scope.settings.primeButtonClasses = {'btn-primary': true};
    });


    function calc_primer_windows() {
      var gene = $scope.gene;
      var want_span = $scope.desired_sequence_span;
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


    function update_primer_report_info() {
      $scope.primer_report_info =
	_.sortBy(
	  _.map(PrimerPairPossibilitiesDB.all(), function(ppp_info) {
	    var d = ppp_info.elements.left.data();
	    var pp = d.ppp.primer_pairs[d.ppIndex];
	    return {
	      left: {
		sequence: pp.left.sequence,
		span: pp.left.span,
		tm: pp.left.tm
	      },
	      right: {
		sequence: pp.right.sequence,
		span: pp.right.span,
		tm: pp.right.tm
	      }
	    };
	  }), function(v) {
	    return v.left.span[0];
	  });
    };
    $scope.$watchGroup(['tv.treeUpdates',
			'gene_name'], update_primer_report_info);


    function updatePrimerOrderContents() {
      if ($scope.primer_report_info.length == 0) {
	return;
      };
      var t = _.flatten(
	_.map(
	  _.zip(_.range($scope.primer_report_info.length),
		$scope.primer_report_info), // [ [n,info]* ]
	  function(v) {
	    var n = v[0] + 1;
	    return [[$scope.settings.primerNameHead + '_' + n + '_L',
		     v[1].left.sequence],
		    [$scope.settings.primerNameHead + '_' + n + '_R',
		     v[1].right.sequence]];
	    // [[name, seq], [name,seq]]
	  }),	// [ [[name, seq], [name,seq]]* ]
	true);  // [ [name, seq]* ]
      $scope.primer_order_contents =
	'Sprock v' + version + ' at ' + $scope.primingRunStart.toISOString() + '\n' +
	stringifyColumnar([ ['Primer Name', 'Primer Sequence'] ].concat(t),
//		stringifyColumnar(t,
			  $scope.settings.primerReportSeparator, '\n');
    };
    $scope.$watchGroup(['primer_report_info',
			'settings.primerNameHead',
			'settings.primerReportSeparator'],
		       updatePrimerOrderContents);
    $scope.$watch('gene_name', function(newValue, oldValue) {
      $scope.settings.primerNameHead = newValue;
    });


    function updatePiecesReportContents() {
      if ($scope.primer_report_info.length == 0) {
	return;
      };
      var t = _.map(
	_.zip(_.range($scope.primer_report_info.length),
	      $scope.primer_report_info), // [ [n,info]* ]
	function(v) {
	  var n = v[0] + 1;
	  var scaffold = $scope.prime.scaffold;
	  var h = $scope.settings.primerNameHead + '_' + n + '_' ;
	  return [h + 'L', v[1].left.sequence, round(v[1].left.tm,2),
		  h + 'R', v[1].right.sequence, round(v[1].right.tm,2),
		  scaffold, v[1].left.span[0], v[1].right.span[1]];
	});
      $scope.pieces_report_contents =
	'Sprock v' + version + ' at ' + $scope.primingRunStart.toISOString() + '\n' +
	stringifyColumnar([ ['Left Name',
			     'Left Sequence',
			     'Left Tm',
			     'Right Name',
			     'Right Sequence',
			     'Right Tm',
			     'Scaffold',
			     'Left Pos',
			     'Right Pos'] ].concat(t),
			  $scope.settings.primerReportSeparator, '\n');
    };
    $scope.$watchGroup(['primer_report_info',
			'settings.primerNameHead',
			'settings.primerReportSeparator'],
		       updatePiecesReportContents);

    function stringifyColumnar(data, columnSeparator, lineSeparator) {
      columnSeparator = columnSeparator || ',';
      lineSeparator = lineSeparator || '\n';
      return _.map(data, function(v) { // [col1, col2, ...]
	return v.join(columnSeparator);
      }).join(lineSeparator);
    };


    $scope.downloadPrimerOrder = function() {
      var filename = $scope.settings.downloadFileBasename +
	    $scope.settings.downloadFileSuffix;
      $log.info('clicked download for ' + filename);
      downloadData($scope.primer_order_contents, filename);
    };

  }]).

  controller('primerModalCtrl', function ($scope, $modalInstance, me) {

    $scope.ppp = me.data('ppp');
    $scope.ppIndex = me.data('ppIndex');
    $scope.round = $injector.get('round');

    $scope.selected = {
      original_index: $scope.ppIndex,
      index: $scope.ppIndex
    };

    $scope.ok = function () {
      $modalInstance.close($scope.selected);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  }).

  controller('Dev', ['_', '$scope', function(_, $scope) {
    $scope.done = false;
  }]);
