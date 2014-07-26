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

  controller('Tester1',
    ['$scope', '$http', '$q', '$timeout', '_',
     'data_getSeq_test',
     'getGene', 'getContextSeqInfo', 'getSeqInfo',
     function($scope, $http, $q, $timeout, _,
	      data_getSeq_test,
	      getGene, getContextSeqInfo, getSeqInfo) {
    var expect = chai.expect;
    var tests = [

      function test1() {
	return expect(1+1).to.equal(2);
      },

      function test2() {
	return expect('foo').to.be.a('string');
      },

      function() {
	var tp = $timeout(function() { return 'good' }, 0);
	return chai.assert.eventually.equal(tp, 'good', 'bad goodness expectable');
      },

      function() {
	var tp = $timeout(function() { return 'happy' }, 1000);
	return expect(tp).to.eventually.equal('happy');
      },

      function() {
	return expect($http.post('/data/getSeq', {scaffold: 'Scaffold1', start: 2, end: 34})).
	  to.eventually.have.property('data').and.
	  to.eql({"request": {"start":2, "scaffold":"Scaffold1","end":34},
		  "results": {"start":2,"scaffold":"Scaffold1","end":34,
			      "quality":[35,35,32,35,53,47,41,42,46,45,29,29,29,32,33,51,51,51,
					 51,51,51,46,46,46,46,40,40,40,44,44,39,32],
			      "sequence":"CATTTTATCACCAGTTCGATTTTCCCCTTGTT"}});
      },

      function() {
	return expect($http.post('/data/getFeatures', {scaffold: 'Scaffold1', start: 1000, end: 18000})).
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
      },

      function() {
	return "NOT DONE";
	return expect($http.post('/data/getGene', {name: 'SPU_008174'})).
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
      },

      function() {

      },

      data_getSeq_test
    ];
    console.log(tests);

    $scope.test_results = function(tests) {
      var results = _.map(tests, function(test) {
	return test.call(test);
      });
      return results;
    }(tests);

/*    describe('/data/getSeq', function() {
      it('should give a good answer', inject(function($http, $q) {
      }));

    });
*/
}]);
