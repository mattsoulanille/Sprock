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
  .controller('MyCtrl2', ['$scope', '$http', function($scope, $http) {
    $scope.serverError = ''
    $scope.getSeq = function() {
      $http.post('/data/getSeq', {scaffold: $scope.scaffold,
				  start: $scope.start,
				  end: $scope.end
				 })
	.success(function (v) {
	  $scope.results = v['results']
	  $scope.serverError = ''
	})
	.error(function(data, status, headers, config) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.results = []
	})
    }
  }])
  .controller('MyCtrl3', ['$scope', '$http', function($scope, $http) {
    $scope.serverError = ''
    $scope.getGene = function() {
      $http.post('/data/getGene', {name: $scope.gene_name})
	.success(function (v) {
	  $scope.results = v['results']
	  $scope.serverError = ''
	})
	.error(function(data, status, headers, config) {
	  console.log(data)
	  angular.element(data)
	  $scope.serverError = data
	  $scope.results = []
	})
    }
  }])
