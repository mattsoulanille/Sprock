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
    /*
    if (false) {
      // example input:
      var seq_events = { events: [[11, {x: null}],
				  [0, {q: 'qual90', x: 'exon'}],
				  [14, {q: 'qual20'}],
				  [0, {a: 'seq'}],
				  [5, {q: 'qual70'}]
				 ],
			 seq: 'GACCTACATCAGGCT' };
    };*/
    return function integrate(seq_events) {
      var sequence = seq_events['seq'];
      var len_sequence = sequence.length;
      var grouped_events = _.groupBy(seq_events['events'],
				     function(pep) { return pep[0] })//.sort();
      var sequence_index = 0;
      var s = '';
      var state = {};

      function classes_string(state) {
	var rv = '';
	eachInOrder(_.pairs(state).sort(), function(p) {
	  if (p[1]) {
	    if (rv) { rv += ' '; };
	    rv += p[1];
	  };
	});
	return rv;
      };

      eachInOrder(grouped_events, function(event_group) {
	var event_position = event_group[0][0];
	state = _.reduce(event_group,
			 function(state, pep) {
			   return _.extend(state, pep[1]);
			 },
			 state);
	if (s) {
	  while (sequence_index < event_position) {
	    s += sequence[sequence_index++];
	  };
	  s += '</span>'; 
	};
	s += '<span class="' + classes_string(state) + '">';
      });
      while (sequence_index < len_sequence) {
	s += sequence[sequence_index++];
      };
      s += '</span>'; 
      return s;
    }
  }]).

  factory('differentiateSequenceToEvents', ['eachInOrder', '_', function(eachInOrder, _) {
    return function differentiate(seqInfo) {
      var events = [[0, {a: 'seq'}]];
      var quality = seqInfo.quality;
      var prior_quality = -1;
      var e = {};
      for (var i = 0, length = quality.length; i < length; i++) {
	var q = quality[i];
	if (q != prior_quality) {
	  events.push([i, {q: 'qual' + q}]); 
	};
	prior_quality = q;
      };
      return {events: events, seq: seqInfo.sequence};
    };
  }]).

  factory('convertExonsToEvents', ['eachInOrder', '_', function(eachInOrder, _) {
    return function convertExons(exons, offset) {

//{"request": {"name": "SPU_022066"}, "results": {"start": 10480, "scaffold": "Scaffold694", "end": 18337, "name": "SPU_022066", "exons": {"ID": "SPU_022066gn", "exons": {"SPU_022066:5\"": [14180, 14538], "SPU_022066:6\"": [17988, 18337], "SPU_022066:0\"": [10514, 10683], "SPU_022066:1\"": [11406, 11633], "SPU_022066:2\"": [11875, 11997], "SPU_022066:3\"": [12713, 12826], "SPU_022066:4\"": [13329, 13541]}}}}

      offset = offset || 0;
      var events = _.reduce(exons.exons, function(memo, exon, key) {
	memo.push([exon[0] - offset, {x: 'exon'}], [exon[1] - offset, {x: null}]);
	return memo;
      }, []);
      return {'events': events};
    };
  }]);
