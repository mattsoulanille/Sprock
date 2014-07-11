'use strict';

/* Controllers */
angular.module('sprockApp.controllers', [])
  .controller('MyCtrl1', ['$scope', '$http', function($scope, $http) {
    $scope.serverError = ''
    $scope.calcN = function() {
      $scope.N = Math.max(Math.min(20, parseInt($scope.text_N)))
      $http.post('/data/n', {N: $scope.N})
	.success(function (v) {
	  console.log(v)
	  $scope.results = v['count']
	  $scope.serverError = ''
	  console.log($scope.results)
	})
	.error(function(data, status, headers, config) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.results = []
	})
    }
  }])
  .controller('MyCtrl2', ['$scope', '$http', 'getSequence',
			  function($scope, $http, getSequence) {
    $scope.serverError = ''
    $scope.getSeq = function() {
      getSequence($scope.scaffold, $scope.start, $scope.end)
	.then(function (v) {
	  $scope.results = v
	  $scope.serverError = ''
	},
	function(data) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.results = []
	})
    }
  }])
  .controller('MyCtrl3', ['$scope', '_', '$http', 'getGene',
			  function($scope, _, $http, getGene) {
    $scope.serverError = ''
    $scope.getGene = function() {
/*
      $http.post('/data/getGene', {name: $scope.gene_name})
	.success(function (v) {
	  console.log(v)
	  $scope.gene = v['results']
	  $scope.serverError = ''
	  $scope.gene_exons_pairs = _.pairs($scope.gene.exons)
	})
	.error(function(data, status, headers, config) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.gene = []
	})
*/
      getGene($scope.gene_name)
	.then(function (v) {
	  $scope.gene = v
	  $scope.serverError = ''
	  $scope.gene_exons_pairs = _.pairs($scope.gene.exons)
	},
	function(data) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.results = []
	  $scope.gene_exons_pairs = []
	})
    }
  }])
