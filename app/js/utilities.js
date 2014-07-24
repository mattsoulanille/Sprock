'use strict';


angular.module('sprock.utilities', ['underscore']).

  factory('integrateSequenceEventsToHTML', ['_', function(_) {
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
	_.each(_.pairs(state).sort(), function(p) {
	  if (p[1]) {
	    if (rv) { rv += ' '; };
	    rv += p[1];
	  };
	});
	return rv;
      };

      _.each(grouped_events, function(event_group) {
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

  factory('differentiateSequenceToEvents', ['_', function(_) {
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

  factory('convertExonsToEvents', ['_', function(_) {
    return function convertExons(exons, offset) {

//{"request": {"name": "SPU_022066"}, "results": {"start": 10480, "scaffold": "Scaffold694", "end": 18337, "name": "SPU_022066", "exons": {"ID": "SPU_022066gn", "exons": {"SPU_022066:5\"": [14180, 14538], "SPU_022066:6\"": [17988, 18337], "SPU_022066:0\"": [10514, 10683], "SPU_022066:1\"": [11406, 11633], "SPU_022066:2\"": [11875, 11997], "SPU_022066:3\"": [12713, 12826], "SPU_022066:4\"": [13329, 13541]}}}}

      offset = offset || 0;
      var events = [];
      _.each(exons.exons, function(exon) {
	events.push([exon[0] - offset, {x: 'exon'}], [exon[1] - offset, {x: null}]);
      });
      return {'events': events};
    };
  }]).

  factory('convertFeaturesToEvents', ['_', function(_) {
    return function convertFeatures(features, offset) {

//"results" member of: {"notes": ["\"span\" is with respect to the scaffold, not the start of the requested range"], "request": {"start": 0, "scaffold": "Scaffold1", "end": 18000}, "results": {"start": 0, "scaffold": "Scaffold1", "end": 18000, "features": [{"span": [13028, 18195], "type": "gene", "id": "SPU_016802gn", "strand": "-"}, {"span": [13028, 18195], "type": "transcript", "id": "SPU_016802-tr", "strand": "-"}, {"span": [15818, 16028], "type": "exon", "id": "SPU_016802:1", "strand": "-"}, {"span": [15263, 15412], "type": "exon", "id": "SPU_016802:2", "strand": "-"}, {"span": [13880, 13989], "type": "exon", "id": "SPU_016802:3", "strand": "-"}, {"span": [13028, 13193], "type": "exon", "id": "SPU_016802:4", "strand": "-"}]}}
      offset = offset || features.start || 0;
      var events = [];
      _.each(features.features, function(f) {
	var t;
	events.push([f.span[0] - offset, (t={},t[f.type]=f.type,t)]);
	events.push([f.span[1] - offset, (t={},t[f.type]=null,t)]);
      });
      return {'events': _.sortBy(events, function(e) { return e[0]})};
    };
  }]).

  factory('ObjPlay', ['_', function(_) {
    function si(foo) {
      this.foo = foo || 'fooless';
    };

    si.prototype.tell =
      function(bar) {
	return this.foo + ' walks into ' + bar;
      };

    return si;

  }]).

  factory('SequenceInfo', ['_', 'differentiateSequenceToEvents', 'integrateSequenceEventsToHTML', 'convertFeaturesToEvents', function(_, differentiateSequenceToEvents, integrateSequenceEventsToHTML, convertFeaturesToEvents ) {

    function si(seqInfo) {
      _.extend(this, seqInfo);
      _.extend(this,  differentiateSequenceToEvents(this));
      return this;
    };

    si.prototype.render_to_html =
      function() {
	//return '<strong><blink>Unimplemented</blink></strong>'
	//return integrateSequenceEventsToHTML(differentiateSequenceToEvents(this));
	return integrateSequenceEventsToHTML(this);
      };

    si.prototype.add_features =
      function(features) {
	console.log(this);
	console.log(features);
	console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	console.log(convertFeaturesToEvents(features));
	this.events = _.union(this.events, convertFeaturesToEvents(features).events); //FIXME: screwy what's an event
	console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	//Unimplemented
	return this
      };

    return si;
  }]);
