'use strict';

/* Controllers */

angular.module('sprockApp.controllers', [])
    .controller('MyCtrl1', ['$scope', '$http', function($scope, $http) {
	$scope.serverError = ''
	$scope.calcN = function() {
	    $scope.N = Math.max(Math.min(20, parseInt($scope.text_N)))
	    $http.post('/data', {N: $scope.N})
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
	    $http.post('/getSeq', {scaffold: $scope.scaffold,
				   start: $scope.start,
				   end: $scope.end
				  })
		.success(function (v) {
		    console.log(v)
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
