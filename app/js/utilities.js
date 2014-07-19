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

  factory('integrateSequenceEventsToHTML', ['eachInOrder', '_', function(eachInOrder, _) {
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
	if (e.seq) {
	  s += '<span class="' + classes_string + '">';
	  s += e.seq;
	  s += '</span>';
	};
      });
      return s;
    }
  }]).

  factory('differentiateSequenceToEvents', ['eachInOrder', '_', function(eachInOrder, _) {
    return function differentiate(seqInfo) {
      var events = [{a: 'seq'}];
      var quality = seqInfo.quality;
      var sequence = seqInfo.sequence;
      var prior_quality = -1;
      var e = {};
      for (var i = 0, length = sequence.length; i < length; i++) {
	var q = quality[i];
	if (q != prior_quality) {
	  if (!_.isEmpty(e)) { events.push(e); };
	  e = {q: 'qual' + q, seq: sequence[i]}
	} else {
	  e.seq += sequence[i];
	};
	prior_quality = q;
      };
      if (!_.isEmpty(e)) { events.push(e); };
      return events;
    };
  }]);
