'use strict';

/* Controllers */
angular.module('sprock.controllers', []).
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
  controller('MyCtrl4', ['$scope', '$http', '$q', '_', 'getGene', 'getContextSeqInfo', 'getSeqInfo',
			 function($scope, $http, $q, _, getGene, getContextSeqInfo, getSeqInfo) {
    $scope.serverError = null;
    $scope.margin = 500;	//FIXME

    $scope.getGene = function() {
      getGene($scope.gene_name).
	then(function (gene) {
	  $scope.gene = gene;
	  $scope.gene_exons_pairs = _.pairs($scope.gene.exons);
	  $scope.serverError = null;
	  $scope.scaffold = gene.scaffold;
	  $scope.start = Math.max(gene.start - 500, 0);
	  $scope.end = gene.end + 500;
	  $scope.getSequenceInformation();
	},
	function(data) {
	  console.log(data);
	  angular.element(data);
	  $scope.serverError = data;
	  $scope.gene = null;
	  $scope.gene_exons_pairs = null;
	});
    };

    $scope.getContextInformation = function() {
      getContextSeqInfo($scope.gene_name, $scope.margin).
	then(function (si) {
	  $scope.sequenceInformation = si;
	  $scope.serverError = null;
	  $scope.scaffold = si.scaffold;
	  $scope.start = si.span[0]
	  $scope.end = si.span[1]
	},
	function(data) {
	  console.log(data);
	  angular.element(data);
	  $scope.serverError = data;
	  $scope.gene = null;
	  $scope.gene_exons_pairs = null;
	});
    };

    $scope.getSequenceInformation = function() {
      getSeqInfo($scope.scaffold, $scope.start, $scope.end).
	then(function (v) {
	  $scope.sequenceInformation = v;
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

  controller('Tester1', ['$scope', '$injector', function($scope, $injector) {
    var expect = chai.expect;
    var test_names = ['data_getTree_test',
		      'data_getContext_test',
		      'data_getGene_test',
		      'data_getFeatures_test',
		      'data_getSeq_test'
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
    
}]);
