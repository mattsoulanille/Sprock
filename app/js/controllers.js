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

  controller('MyCtrl6', ['_', '$log', '$q', '$http', '$scope', 'getTree', 'getGene', 'getFeatures', 'getSequence', 'GeneSequenceInfo', 'eachFromServer', 'compareSpans', 'PrimerPairPossibilitiesDB', 'downloadData', function(_, $log, $q, $http, $scope, getTree, getGene, getFeatures, getSequence, GeneSequenceInfo, eachFromServer, compareSpans, PrimerPairPossibilitiesDB, downloadData) {
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
      primeButtonText: 'No Gene!'
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
    $scope.$watch('gene_name', get_gene);

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
      if ($scope.gene == undefined) return null;
      return $scope.desired_sequence_span = [Math.max(0, $scope.gene.span[0] - $scope.margin),
				      $scope.gene.span[1] + $scope.margin];
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
	  $scope.settings.primeButtonClasses['btn-primary'] = true;
	  return $scope.sequence_info = v;
	});
    };
    $scope.$watchCollection('desired_sequence_span', get_sequence);


    $scope.makePrimers = function() {
      $scope.makePrimersPromise = makePrimers();
    };

    function makePrimers() {
      $scope.tv.makingPrimers = 'started';
      $scope.settings.primeButtonText = 'making...';
      $scope.pppList = [];
      calc_primer_windows();
      $scope.prime.scaffold = $scope.gene.scaffold;
      return eachFromServer('primers', function(v) {
	$scope.pppList.push(v);
	$scope.settings.primeButtonText = 'made ' +
	  countOfGoodPrimers() + ' pairs';

      }, [], $scope.prime).then(function(v) {
	$scope.pppList_eventually_was = v;
	$scope.tv.makingPrimers = 'finished';
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
	      });
      return rv;
    };

    // Some UI status control
    $scope.$watch('tv.makingPrimers', function(newValue, oldValue) {
      $scope.settings.primeButtonClasses['btn-primary'] = false;
      $scope.settings.primeButtonClasses['btn-warning'] = newValue == 'started';
      $scope.settings.primeButtonClasses['btn-success'] = newValue == 'finished';
      if (newValue == 'started') {
	$scope.settings.primeButtonText = 'making primers';
      };
      if (newValue == 'finished') {
	$scope.settings.primeButtonText = 'Done: ' + $scope.settings.primeButtonText;
      };
    });

    $scope.$watch('prime', function() {
      $scope.settings.primeButtonText = 'make primers';
      $scope.settings.primeButtonClasses['btn-primary'] = true;
      $scope.settings.primeButtonClasses['btn-warning'] = false;
      $scope.settings.primeButtonClasses['btn-success'] = false;
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
      //console.log('primer tab info says treeUpdates is ' + $scope.tv.treeUpdates);
      $scope.primer_report_info =
	_.sortBy(
	  _.map(PrimerPairPossibilitiesDB.all(), function(ppp_info) {
	    var d = ppp_info.elements.left.data();
	    var pp = d.ppp.primer_pairs[d.ppIndex];
	    return {
	      left: {
		sequence: pp.left.sequence,
		span: pp.left.span
	      },
	      right: {
		sequence: pp.right.sequence,
		span: pp.right.span
	      }
	    };
	  }), function(v) {
	    return v.left.span[0];
	  });
    };
    $scope.$watch('tv.treeUpdates', update_primer_report_info);
    $scope.$watch('gene_name', update_primer_report_info);


    function updatePrimerOrderContents() {
      $scope.primer_order_contents =
	_.map(
	  _.zip(_.range($scope.primer_report_info.length),
		$scope.primer_report_info),
	  function(v) {
	    return $scope.settings.primerNameHead +
	      '_' + v[0] +
	      '_L\t' +
	      v[1].left.sequence + '\n' +
	      $scope.settings.primerNameHead +
	      '_' + v[0] +
	      '_R\t' +
	      v[1].right.sequence
	  }).join('\n') + '\n';
    };
    $scope.$watch('primer_report_info', updatePrimerOrderContents);
    $scope.$watch('settings.primerNameHead', updatePrimerOrderContents);
    $scope.$watch('gene_name', function(newValue, oldValue) {
      $scope.settings.primerNameHead = newValue;
    });


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

  controller('Dev', ['_', '$scope', 'getTree', function(_, $scope, getTree) {
    $scope.done = false;
  }]);
