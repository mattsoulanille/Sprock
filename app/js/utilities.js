'use strict';


angular.module('sprock.utilities', ['underscore']).

  factory('eachInOrder', [function() {
    var breaker = {};
    return function eachInOrder(obj, iterator, context) {
      if (obj == null) return obj;
      if (obj.length === +obj.length) {
	for (var i = 0, length = obj.length; i < length; i++) {
	  if (iterator.call(context, obj[i], i, obj) === breaker) return;
	}
      } else {
	var keys = _.keys(obj);
	for (var i = 0, length = keys.length; i < length; i++) {
	  if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
	}
      }
      return obj;
    };
    }]).

  factory('integrateSequence', ['eachInOrder', '_', function(eachInOrder, _) {
    return function integrate(events) {
      var s = '';
      var state = {};
      eachInOrder(events, function(e) {
	_.extend(state, e);
	state.seq = null;
	var classes_string = '';
	eachInOrder(_.pairs(state).sort(), function(p) {
	  if (p[1]) {
	    if (classes_string) { classes_string += ' '; }
	    classes_string += p[1];
	  };
	});
	s += '<span class="' + classes_string + '">';
	s += e.seq;
	s += '</span>';
      });

//      var v = _.reduce(events, function(memo, e) {
//	return memo;
//      }, {r:'', s:{}});
 
      return s;
    }
  }]);


/*
  .factory('getSequence', ['$http', '$q', function($http, $q) {
    return function (scaffold, start, end) {
      var deferred = $q.defer()
      $http.post('/data/getSeq', {scaffold: scaffold, start: start, end: end})
	.success(function (v) {
	  deferred.resolve(v['results'])
	})
	.error(function(data, status, headers, config) {
	  console.log(data)
	  deferred.reject(data)
	})
      return deferred.promise
    }
  }])

*/
