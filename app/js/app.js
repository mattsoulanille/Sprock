'use strict';


// Declare app level module which depends on filters, and services
angular.module('sprock', [
  'btford.markdown',
  'ngRoute',
  'ui.bootstrap',
  'underscore',
  'sprock.filters',
  'sprock.services',
  'sprock.directives',
  'sprock.controllers',
  'sprock.utilities'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/test1', {
	templateUrl: 'partials/partest1.html',
	controller: 'Tester1'
    }).
    when('/view6', {
	templateUrl: 'partials/partial6.html',
	controller: 'MyCtrl6'
    }).
    when('/dev', {
	templateUrl: 'partials/dev.html',
	controller: 'MyDev'
    }).
    otherwise({redirectTo: '/view6'})
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
