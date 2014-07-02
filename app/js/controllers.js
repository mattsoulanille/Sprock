'use strict';

/* Controllers */

angular.module('sprockApp.controllers', [])
    .controller('MyCtrl1', ['$scope', '$http', function($scope, $http) {
	      $scope.calcN = function() {
		  $scope.N = Math.max(Math.min(20, parseInt($scope.text_N)))
		  $http.post('/data', {N: $scope.N})
		  .success(function (v) {
			  console.log(v)
			  $scope.results = v['count']
			  console.log($scope.results)
		      })
	      }

  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
