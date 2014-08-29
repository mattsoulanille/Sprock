'use strict';

/* jasmine specs for utilities go here */

/* farting around:
describe('module interface', function() {
  describe('before running module function', function() {
    it('should not have inject function', function() {
      expect(inject).not.toBeDefined();
    });
  });
});
*/

describe('service', function() {
  beforeEach(module('sprock.utilities'));

  describe('underscore each()', function() {
    it('should exist', inject(function(_) {
      expect(_.each).toBeDefined();
    }));
    it('should go through an array in order', inject(function(_) {
      var cat = '';
      _.each([1,2,3,4,5], function(e) { cat += e })
      expect(cat).toEqual('12345');
    }));
    it('should go through an array in order when elements added out of order',
       // http://ecma-international.org/ecma-262/5.1/#sec-15.4.4.18
       inject(function(_) {
	 var cat = '';
	 var a = [];
	 a[2] = 3; a[0] = 1; a[4] = 5; a[1] = 2; a[3] = 4;
	 _.each(a, function(e) { cat += e })
	 expect(cat).toEqual('12345');
       }));
  });

  describe('compareSpans', function() {
    var s1, s2;
    it('should be a function', inject(function(compareSpans) {
      expect(compareSpans).toBeFunction();
    }));
    // these are in terms of half-open spans, e.g. [start, end), as in Python
    it('should recognize span completely below span', inject(function(compareSpans) {
      expect(compareSpans([-3,7], [9,12])).toEqual('<<<<');
    }));
    it('should recognize span completely above span', inject(function(compareSpans) {
      expect(compareSpans( [9,12], [-3,7])).toEqual('>>>>');
    }));
    it('should recognize span completely within span', inject(function(compareSpans) {
      expect(compareSpans([-3,12], [7,9])).toEqual('<<>>');
    }));
    it('should recognize span completely surrounding span', inject(function(compareSpans) {
      expect(compareSpans([7,9], [-3,12])).toEqual('><><');
    }));
    it('should recognize span equal to span', inject(function(compareSpans) {
      expect(compareSpans([-3,12], [-3, 12])).toEqual('=<>=');
    }));
    it('should recognize span overlapping span from below', inject(function(compareSpans) {
      expect(compareSpans([-3,7], [5,9])).toEqual('<<><');
    }));
    it('should recognize span overlapping span from above', inject(function(compareSpans) {
      expect(compareSpans([5,9], [-3,7])).toEqual('><>>');
    }));
    it('should recognize span left-contiguous with span', inject(function(compareSpans) {
      expect(compareSpans([5,9], [9,12])).toEqual('<<=<');
    }));
    it('should recognize span right-contiguous with span', inject(function(compareSpans) {
      expect(compareSpans([9, 12], [5,9])).toEqual('>=>>');
    }));
    it('should recognize span that is left partial of span', inject(function(compareSpans) {
      expect(compareSpans([3,5], [3,7])).toEqual('=<><');
    }));
    it('should recognize span that is right partial of span', inject(function(compareSpans) {
      expect(compareSpans([5,7], [3,7])).toEqual('><>=');
    }));


  });

  xdescribe('integrateSequenceEventsToHTML', function() {
    it('should be a function', inject(function(integrateSequenceEventsToHTML) {
      expect(integrateSequenceEventsToHTML).toBeFunction();
    }));

    it('should do the right thing with events in sequence', inject(function(integrateSequenceEventsToHTML) {
      var seq_events = { events: [[0, {a: 'seq'}],
				  [0, {q: 'qual90', x: 'exon'}],
				  [5, {q: 'qual70'}],
				  [11, {x: null}],
				  [14, {q: 'qual20'}]
				 ],
			 sequence: 'GACCTACATCAGGCT' }
      var html = integrateSequenceEventsToHTML(seq_events);
      expect(html).toBe('<span class="seq qual90 exon">GACCT</span>' +
			'<span class="seq qual70 exon">ACATCA</span>' +
			'<span class="seq qual70">GGC</span>' +
			'<span class="seq qual20">T</span>');
    }));

    it('should do the right thing with events out of sequence', inject(function(integrateSequenceEventsToHTML) {
      var seq_events = { events: [[11, {x: null}],
				  [0, {q: 'qual90', x: 'exon'}],
				  [14, {q: 'qual20'}],
				  [0, {a: 'seq'}],
				  [5, {q: 'qual70'}]
				 ],
			 sequence: 'GACCTACATCAGGCT' }
      var html = integrateSequenceEventsToHTML(seq_events);
      expect(html).toBe('<span class="seq qual90 exon">GACCT</span>' +
			'<span class="seq qual70 exon">ACATCA</span>' +
			'<span class="seq qual70">GGC</span>' +
			'<span class="seq qual20">T</span>');
    }));

    it('should do the right thing with complex events', inject(function(integrateSequenceEventsToHTML) {
      var seq_events = { events: [[0, {qual: 'qual90', exon: 'exon'}],
				  [5, {qual: 'qual70'}],
				  [11, {exon: null}],
				  [14, {qual: 'qual20'}],
				  [ -63, { gene : 'gene' } ],
				  [ -63, { transcript : 'transcript' } ],
				  [ -63, { exon : 'exon' } ],
				  [ 3, { exon : null } ],
				  [ 13, { exon : 'exon' } ],
				  [ 33, { gene : null } ],
				  [ 33, { transcript : null } ],
				  [ 33, { exon : null } ],
				  [ 111, { fun: 'fun' } ]
				 ],
			 sequence: 'GACCTACATCAGGCT' }
      var html = integrateSequenceEventsToHTML(seq_events);
      expect(html).toBe(


'<span class="seq qual90 exon">GACCT</span>' +
			'<span class="seq qual70 exon">ACATCA</span>' +
			'<span class="seq qual70">GGC</span>' +
			'<span class="seq qual20">T</span>');
    }));

  });

  describe('differentiateSequenceToEvents', function() {
    it('should be a function', inject(function(differentiateSequenceToEvents) {
      expect(differentiateSequenceToEvents).toBeFunction();
    }));
    it('should do the right thing', inject(function(differentiateSequenceToEvents) {
      var sequence = {quality: [56, 51, 51, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 51, 51, 51, 51],
		      sequence: 'TCATTTATATTATTTAGATGTG'};
      expect(differentiateSequenceToEvents(sequence)).toEqual({ events: [[0, {a: 'seq'}],
									 [0, {q: 'qual56'}],
									 [1, {q: 'qual51'}],
									 [3, {q: 'qual45'}],
									 [18, {q: 'qual51'}]
									],
								sequence: 'TCATTTATATTATTTAGATGTG' });
    }));
  });

  describe('convertExonsToEvents', function() {
    it('should be a function', inject(function(convertExonsToEvents) {
      expect(convertExonsToEvents).toBeFunction();
    }));
    it('should do the right thing', inject(function(convertExonsToEvents) {
      var exons = {ID: "fooExon",
		   exons: { 'xfone': [100, 110],
			    'xftwo': [112, 116] }};
      expect(convertExonsToEvents(exons, 100)).toEqual({ events: [[0, {x: 'exon'}],
							     [10, {x: null}],
							     [12, {x: 'exon'}],
							     [16, {x: null}]]});
    }));
  });

  describe('convertFeaturesToEvents', function() {
    it('should be a function', inject(function(convertFeaturesToEvents) {
      expect(convertFeaturesToEvents).toBeFunction();
    }));

    it('should create events from basic features', inject(function(convertFeaturesToEvents) {
      var t = {"request": {"start": 67, "scaffold": "Scaffold12345", "end": 89},
	       "results": {"start": 67, "scaffold": "Scaffold12345", "end": 89,
			   "quality": [56, 51, 51, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 51, 51, 51, 51],
			   "sequence": "TCATTTATATTATTTAGATGTG",
			   features: [{"span": [4, 100], "type": "gene", "id": "SPU_Random-gn", "strand": "+"},
				      {"span": [4, 100], "type": "transcript", "id": "SPU_Random-tr", "strand": "+"},
				      {"span": [4, 70], "type": "exon", "id": "SPU_Random:0", "strand": "+"},
				      {"span": [80, 100], "type": "exon", "id": "SPU_Random:1", "strand": "+"}]

			  }
	      };

      expect(convertFeaturesToEvents(t.results)).toEqual({ events : [ [ -63, { gene : 'gene' } ],
								      [ -63, { transcript : 'transcript' } ],
								      [ -63, { exon : 'exon' } ],
								      [ 3, { exon : null } ],
								      [ 13, { exon : 'exon' } ],
								      [ 33, { gene : null } ],
								      [ 33, { transcript : null } ],
								      [ 33, { exon : null } ]
								    ] });
    }));

    it('should create events from interesting features', inject(function(convertFeaturesToEvents) {
      var features = [{"span": [13028, 18195], "type": "gene", "id": "SPU_016802gn", "strand": "-"},
		      {"span": [13028, 18195], "type": "transcript", "id": "SPU_016802-tr", "strand": "-"},
		      {"span": [15818, 16028], "type": "exon", "id": "SPU_016802:1", "strand": "-"},
		      {"span": [15263, 15412], "type": "exon", "id": "SPU_016802:2", "strand": "-"},
		      {"span": [13880, 13989], "type": "exon", "id": "SPU_016802:3", "strand": "-"},
		      {"span": [13028, 13193], "type": "exon", "id": "SPU_016802:4", "strand": "-"}];

      var f_etc = {features: features, start: 13000};
      expect(convertFeaturesToEvents(f_etc)).toEqual({"events":
						      [[28,{"gene":"gene"}],
						       [28,{"transcript":"transcript"}],
						       [28,{"exon":"exon"}],
						       [193,{"exon":null}],
						       [880,{"exon":"exon"}],
						       [989,{"exon":null}],
						       [2263,{"exon":"exon"}],
						       [2412,{"exon":null}],
						       [2818,{"exon":"exon"}],
						       [3028,{"exon":null}],
						       [5195,{"gene":null}],
						       [5195,{"transcript":null}]]});

    }));
  });

  describe('ObjPlay', function() {
    it('should be a function', inject(function(ObjPlay) {
      expect(ObjPlay).toBeFunction();
    }));
    it('should construct with an arg', inject(function(ObjPlay) {
      var t = new ObjPlay('some foo');
      expect(t).toBeAwesome();
    }));
    it('should tell',  inject(function(ObjPlay) {
      var t = new ObjPlay('some foo');
      expect(t.tell('some bar')).toEqual("some foo walks into some bar");
    }));
    it('should have a default for contruction',  inject(function(ObjPlay) {
      var t = new ObjPlay();
      expect(t.tell('some bar')).toEqual("fooless walks into some bar");
    }));
  });

  xdescribe('SequenceInfo', function() {
    var si;

    beforeEach(inject(function(SequenceInfo) {
      var t = {"request": {"start": 67, "scaffold": "Scaffold12345", "end": 89},
	       "results": {"start": 67, "scaffold": "Scaffold12345", "end": 89,
			   "quality": [56, 51, 51, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 51, 51, 51, 51],
			   "sequence": "TCATTTATATTATTTAGATGTG",
			   features: [{"span": [4, 100], "type": "gene", "id": "SPU_Random-gn", "strand": "+"},
				      {"span": [4, 100], "type": "transcript", "id": "SPU_Random-tr", "strand": "+"},
				      {"span": [4, 70], "type": "exon", "id": "SPU_Random:0", "strand": "+"},
				      {"span": [80, 100], "type": "exon", "id": "SPU_Random:1", "strand": "+"}]

			  }
	      };

      si = new SequenceInfo(t.results);
    }));

    it('should be a function', inject(function(SequenceInfo) {
      expect(SequenceInfo).toBeFunction();
    }));
    it('should render to HTML', inject(function(SequenceInfo) {
      var html = si.render_to_html();
      expect(html).toBeString();
      expect(html).toEqual('<span class="seq qual56">T</span><span class="seq qual51">CA</span><span class="seq qual45">TTTATATTATTTAGA</span><span class="seq qual51">TGTG</span>');
    }));
    it('should accept addition of features', inject(function(SequenceInfo) {
      expect(si.add_features('TBS')).toBe(si);
    }));

    it('should ', inject(function(SequenceInfo) {
      expect().toBe();
    }));

  });

  xdescribe('GeneSequenceInfo', function() {
    var gsi, t1, t2, t3;

    beforeEach(inject(function(GeneSequenceInfo) {
      gsi = new GeneSequenceInfo('test', 500, {});

      // tree spans are half-open, in the style of Array.prototype.slice()

      //  0  1  2  3  4  5  6  7  8  9 10 11
      // [-  -  -] .  . [-  -  -] .  .  .  .
      t1 = {type: 't1_root', span: [10, 21],
	    children: [{type: 't1_c1', span: [0, 3]}, {type: 't1_c2', span: [5, 8]}] };

      //  0  1  2  3  4  5  6  7  8  9 10 11 12 13
      // [A  B  C][D][E  F  G  H][I  J  K  L][M]
      //  q1       q2 q3          q4          q5
      t2 = {type: 'seq', span: [7, 13],
	    children: [{type: 'q1', span: [0,3], data: 'ABC'},
		       {type: 'q2', span: [3,4], data: 'D' },
		       {type: 'q3', span: [4,8], data: 'EFGH' },
		       {type: 'q4', span: [8,12], data: 'IJKL' },
		       {type: 'q5', span: [12,13], data: 'M'}]};
			


      t3 = {type: 't1_root', span: [7, 21],
	    children: [{type: 'seq', span: [0, 3],
			children: [{type: 'q1', span: [0,3], data: 'ABC'}]},
		       {type: 't1_c1', span: [3, 6],
			children: [{type: 'seq', span: [0,3],
				   children: [{type: 'q2', span: [0,1], data: 'D'},
					      {type: 'q3', span: [1,3], data: 'EF'}]}
				  ]},
		       {type: 'seq', span: [6, 8],
			children: [{type: 'q3', span: [0,2], data: 'GH'}]},
		       {type: 't1_c2', span: [8, 11],
			children: [{type: 'seq', span: [0,3],
				   children: [{type: 'q4', span: [0,3], data: 'IJK'}]}
				  ]},
		       {type: 'seq', span: [11, 13],
			children: [{type: 'seq', span: [0,2],
				   children: [{type: 'q4', span: [0,1], data: 'L'},
					      {type: 'q5', span: [1,2], data: 'M'}]}
				   ]}
		      ]};
		       
    }));

  });
});
