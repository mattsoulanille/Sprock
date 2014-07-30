'use strict';


// Declare app level module which depends on filters, and services
angular.module('sprock', [
  'ngRoute',
  'underscore',
  'ui.bootstrap',
  'sprock.filters',
  'sprock.services',
  'sprock.directives',
  'sprock.controllers',
  'sprock.utilities'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/test1', {
	templateUrl: 'partials/partest1.html',
	controller: 'Tester1'
    })
    .when('/view1', {
	templateUrl: 'partials/partial1.html',
	controller: 'MyCtrl1'
    })
    .when('/view2', {
	templateUrl: 'partials/partial2.html',
	controller: 'MyCtrl2'
    })
    .when('/view3', {
	templateUrl: 'partials/partial3.html',
	controller: 'MyCtrl3'
    })
    .when('/view4', {
	templateUrl: 'partials/partial4.html',
	controller: 'MyCtrl4'
    })
    .otherwise({redirectTo: '/view1'})
}]);

// some console hacks.. TODO put somewhere better
var $a = function () {
  return angular.element.apply(angular,_.toArray(arguments));
};

var $i = function (elem) {
  elem = elem || document.getElementsByTagName('body')[0];
  return $a(elem).injector();
};

var $injector,
    $browser,
    $location;

var init = function () {
  $injector = $i();

  if (!$injector) return setTimeout(init,100);

  $injector.invoke(function (_$browser_, _$location_) {
    $browser  = _$browser_;
    $location = _$location_;
  });
  return null;
};

init();
