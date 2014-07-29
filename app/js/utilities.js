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
			 sequence: 'GACCTACATCAGGCT' };
    };*/
    return function integrate(seq_events) {
      console.log('A: ' + JSON.stringify(seq_events.events));
      var sequence = seq_events['sequence'];
      var len_sequence = sequence.length;
//      var grouped_events = _.sortBy(_.groupBy(seq_events['events'],
//					      function(pep) { return pep[0] }),
//				    function(g) { return g[0][0] });
      var grouped_events = _.groupBy(seq_events['events'],
				     function(pep) { return pep[0] });
//      console.log('B: ' + JSON.stringify(grouped_events));
//      var t1 = _.map(grouped_events, function(event_array, pos) {
      var t2 = _.groupBy(seq_events['events'], _.property(0))
      console.log('t2: ' + JSON.stringify(t2));
//      expect(grouped_events).toBeAngularEqual(t2);
//      console.log('D: ' + JSON.stringify(function(t) {return _.flatten(_.map(_.pluck(t, 1), _.pairs), true)}(t2[0])));
//      console.log('E: ' + JSON.stringify(_.flatten(_.map(_.pluck(t2[0], 1), _.pairs), true)));

//      var t3 = _.map(t2, function(t) {return _.flatten(_.map(_.pluck(t, 1), _.pairs), true)});
//      console.log('t3: ' + JSON.stringify(t3));

//      var t4 = _.map(t2, function(t) {return _.sortBy(_.flatten(_.map(_.pluck(t, 1), _.pairs), true), _.property(0))});
//      console.log('t4: ' + JSON.stringify(t4));

//      var t5 = _.map(t2, function(t) {return _.flatten(_.map(_.pluck(t, 1), _.pairs), true).sort()});
//      console.log('t5: ' + JSON.stringify(t5));
//      expect(t4).toEqual(t5);

//      var t6 = _.map(t2, function(t) {
//	return [t[0][0], _.sortBy(_.flatten(_.map(_.pluck(t, 1), _.pairs), true), _.property(0))];
//      });
//      console.log('t6: ' + JSON.stringify(t6));

      var t7 = _.sortBy(_.map(t2, function(t) {
	return [t[0][0], _.sortBy(_.flatten(_.map(_.pluck(t, 1), _.pairs), true), _.property(0))];
      }), _.property(0));
      console.log('t7: ' + JSON.stringify(t7));


      var sequence_index = 0;
      var s = '';
      var state = {};

      function classes_string(state) {
	//console.log('classes_string: ' + JSON.stringify(state));
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
	if (sequence_index < len_sequence) {
	  var event_position = event_group[0][0];
	  state = _.reduce(event_group,
			   function(state, pep) {
			     return _.extend(state, pep[1]);
			   },
//			   state);
			   {});
	  if (event_position >= 0) { //just integrate state until we actually get to the sequence
	    if (s) {
	      while (sequence_index < event_position && sequence_index < len_sequence) {
		s += sequence[sequence_index++];
	      };
	      s += '</span>'; 
	    };
	    if (sequence_index < len_sequence) {
	      s += '<span class="' + classes_string(state) + '">';
	    }}};
      });
      if (sequence_index < len_sequence) {
	while (sequence_index < len_sequence) {
	  s += sequence[sequence_index++];
	};
	s += '</span>'; 
      };
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
      return {events: events, sequence: seqInfo.sequence};
    };
  }]).

  factory('convertExonsToEvents', ['_', function(_) {
    return function convertExons(exons, offset) {
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
      offset = offset || features.start || 0;
      var events = [];
      _.each(features.features, function(f) {
	var t;
	events.push([f.span[0] - offset, (t={},t[f.type]=f.type,t)]);
	events.push([f.span[1] - offset, (t={},t[f.type]=null,t)]);
      });
      var rv = {'events': _.sortBy(events, function(e) { return e[0]})};
      return rv;
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
      _.has(this, 'features') && this.add_features(this);
      return this;
    };

    si.prototype.render_to_html =
      function() {
	//return '<strong><blink>Unimplemented</blink></strong>'
	//return integrateSequenceEventsToHTML(differntiateSequenceToEvents(this));
	return integrateSequenceEventsToHTML(this);
      };

    si.prototype.add_features =
      function(features) {
	//console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	//console.log(convertFeaturesToEvents(features));
	this.events = _.union(this.events, convertFeaturesToEvents(features).events); //FIXME: screwy what's an event
	//console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	//Unimplemented
	return this
      };

    return si;
  }]).

  factory('GeneSequenceInfo_test', ['GeneSequenceInfo', function(GeneSequenceInfo) {
    return function() {
      var expect = chai.expect;
      var g = new GeneSequenceInfo('SPU_022066');
      expect(g.get_sequence()).eventually.to.have.property('scaffold').equal('Scaffold694');
      expect(g.get_sequence()).eventually.to.have.property('start').equal(10480);
      expect(g.get_sequence()).eventually.to.have.property('sequence').a('string').of.length(7857);
      expect(g.get_sequence()).eventually.to.have.property('sequence').to.contain('ATGGCTGATGCTGGCTTATTGTTGGGTCTGTTTTTACAGAACTTCATGACCAGGTAATGGGAACCTTACAGCAAAAGATTCGACCTCCTTTTCAAGGGCAGCAAGTTTGGA');
      expect(g.get_sequence()).eventually.to.have.property('sequence').to.contain('GACTCCCATCGCCATTGCCATTGCTAACTTTCTTGAGACTCCCATCACCATTGCCATTGGTGACTGTCTTTAGACTCCCATCACCATTCATCGCTGTCTTGATCACTGTCTTGGTTCCGTTAACAGTAGCCAT');
      expect(g.get_sequence()).eventually.to.have.property('quality').an('array').of.length(7857);

      expect(g.get_feature_tree()).eventually.to.have.property('name').equal('SPU_022066');
      expect(g.get_feature_tree()).eventually.to.have.property('scaffold').equal('Scaffold694');
      expect(g.get_feature_tree()).eventually.to.have.property('type').equal('gene');
      expect(g.get_feature_tree()).eventually.to.have.property('children').of.length(1);
      expect(g.get_feature_tree()).eventually.to.have.property('children').property(0).property('children').of.length(8);

      };
    }]).

  factory('GeneSequenceInfo', ['_', '$q', 'differentiateSequenceToEvents', 'integrateSequenceEventsToHTML', 'convertFeaturesToEvents', 'getTree', 'getSequence', function(_, $q, differentiateSequenceToEvents, integrateSequenceEventsToHTML, convertFeaturesToEvents, getTree, getSequence ) {

    function gsi(name) {
      this.gene_name = name;
      return this;
    };

    gsi.prototype.render_to_html =
      function() {
	//return '<strong><blink>Unimplemented</blink></strong>'
	//return integrateSequenceEventsToHTML(differentiateSequenceToEvents(this));
	return integrateSequenceEventsToHTML(this);
      };

    gsi.prototype.get_sequence =
      function() {
	if (this.sequence_promise && this.sequence_promise !== null)
	  return this.sequence_promise;

	var that = this;
	this.sequence_promise = this.get_feature_tree().
	  then(function(ft) {
	    return getSequence(ft.scaffold, ft.span[0], ft.span[1]). //FIXME: margins
	      then(function(si) {
		return that.sequence_info = si;
	      });
	  });
	return this.sequence_promise;
      };

    gsi.prototype.get_feature_tree =
      function() {
	if (this.feature_tree_promise && this.feature_tree_promise !== null)
	  return this.feature_tree_promise;
	this.feature_tree_promise = getTree(this.gene_name);
	return this.feature_tree_promise;
      };

    gsi.prototype.get_informed =
      function() {
	if (this.informed_promise && this.informed_promise !== null)
	  return this.informed_promise;
	this.informed_promise = $q.all(this.get_feature_tree,
				       this.get_sequence);
	return this.informed_promise;
      };

    //OLD:
    gsi.prototype.add_features =
      function(features) {
	//console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	//console.log(convertFeaturesToEvents(features));
	this.events = _.union(this.events, convertFeaturesToEvents(features).events); //FIXME: screwy what's an event
	//console.log(_.uniq(_.flatten(_.map(this.events, function(v) { return _.keys(v[1]) }))));
	//Unimplemented
	return this
      };

    return gsi;
  }]);
