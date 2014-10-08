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


  describe('_.walk', function() {
    var nonTrivialTree;

    beforeEach(function() {
      nonTrivialTree = {
        "children": [
            {
                "children": [
                    {
                        "children": [],
                        "name": "SPU_022066_3UTR:0\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            10480,
                            10513
                        ],
                        "strand": "-",
                        "type": "three_prime_UTR"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:0\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            10514,
                            10683
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:1\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            11406,
                            11633
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:2\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            11875,
                            11997
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:3\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            12713,
                            12826
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:4\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            13329,
                            13541
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:5\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            14180,
                            14538
                        ],
                        "strand": "-",
                        "type": "exon"
                    },
                    {
                        "children": [],
                        "name": "SPU_022066:6\"",
                        "scaffold": "Scaffold694",
                        "span": [
                            17988,
                            18337
                        ],
                        "strand": "-",
                        "type": "exon"
                    }
                ],
                "name": "Sp-Shmt2_1",
                "scaffold": "Scaffold694",
                "span": [
                    10480,
                    18337
                ],
                "strand": "-",
                "type": "transcript"
            }
        ],
        "name": "SPU_022066",
        "scaffold": "Scaffold694",
        "span": [
            10480,
            18337
        ],
        "strand": "-",
        "type": "gene"
      };
    });

    it('should be a function', inject(function(_) {
      expect(_.walk).toBeFunction();
    }));

    it('should traverse simple nested arrays', inject(function(_) {
      var result = [];
      expect(_.walk.preorder).toBeFunction();
      var t = [1];
      _.walk.preorder(t, function(v) {
	result.push(JSON.stringify(v));
      });
      expect(result).toEqual([ '[1]', '1' ]);
      expect(_.walk.preorder).toBeFunction();
      expect(_.walk.map(t, _.walk.preorder, function(v) {
	return JSON.stringify(v);
      })).toEqual([ '[1]', '1' ]);
    }));

    it('should traverse nested arrays', inject(function(_) {
      var t = [1, [2, 3], 4, [5], [6, [7, 8], 9]];

      expect(_.walk.map(t, _.walk.preorder, function(v) {
	return JSON.stringify(v);
      })).toEqual([ '[1,[2,3],4,[5],[6,[7,8],9]]',
		    '1',
		    '[2,3]',
		    '2',
		    '3',
		    '4',
		    '[5]',
		    '5',
		    '[6,[7,8],9]',
		    '6',
		    '[7,8]',
		    '7',
		    '8',
		    '9' ]);

      expect(_.walk.map(t, _.walk.postorder, function(v) {
	return JSON.stringify(v);
      })).toEqual([ '1',
		    '2',
		    '3',
		    '[2,3]',
		    '4',
		    '5',
		    '[5]',
		    '6',
		    '7',
		    '8',
		    '[7,8]',
		    '9',
		    '[6,[7,8],9]',
		    '[1,[2,3],4,[5],[6,[7,8],9]]' ]);

      expect(_.walk.reduce(t, function(memo, v) {
	return memo + '<' + JSON.stringify(v) + '>';
      }, 'leaf')).
	toEqual('leaf<1>,leaf<2>,leaf<3><[2,3]>,leaf<4>,leaf<5><[5]>,leaf<6>,leaf<7>,leaf<8><[7,8]>,leaf<9><[6,[7,8],9]><[1,[2,3],4,[5],[6,[7,8],9]]>'); // why the commas?

      var leaf = {};		// to indicate a leaf
      expect(_.walk.reduce(t, function(memo, v) {
	if (memo == leaf) {
	  return v;
	} else {
	  return _.reduce(memo, function(m, x) {
	    return m + x;
	  }, 0);
	};
      }, leaf)).
	toEqual(45);

      expect(_.walk.reduce(t, function(memo, v) {
	if (memo == leaf) {
	  return v;
	} else {
	  return '(' + memo.join() + ')';
	};
      }, leaf)).
	toEqual('(1,(2,3),4,(5),(6,(7,8),9))');

      expect(_.walk(function(obj) {
	return _.has(obj, 'children') || _.isElement(obj) ? obj.children : obj;
	//return obj.children;	//also works here
      }).reduce(nonTrivialTree, function(memo, v) {
	if (memo == leaf) {
	  return v.type;
	} else {
	  return '(' +
	    v.type + ':' +
	    _.reduce(memo, function(m, v) {
	      return m + ',' + v;
	    }) +
	    ')';
	};
      }, leaf)).
	toEqual('(gene:(transcript:three_prime_UTR,exon,exon,exon,exon,exon,exon,exon))');

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

    // This was for the tree-merge approach, which required too much brainpower to implement
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

  describe('findLeastElemContainingSpan', function() {

    /*
    beforeEach(inject(function(_) {
      var leaf = {};
      function makeTree(root) {
	return _.walk.reduce(root, function(memo, node) {
	  if (memo === leaf) return node;
	  _.reduce(
	    _.map(memo, function(v) {
	      if (v.length === 2 &&
		  typeof(v[0] === "number")) {
		var elem = angular.element('<span></span>');
		elem.data("span", v);
		return elem;
	      } else return v;
	    }), function(memo, v) {
	      
	    }, angular.element('<span></span>')
	    



	  if (typeof(memo[0]) === "number") {


	  }
	}, leaf);
      };
    }));
     */

    it('should exist',
       inject(function(findLeastElemContainingSpan) {
	 expect(findLeastElemContainingSpan).toBeDefined();
       }));

    it('should return null for an element with no span',
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 expect(findLeastElemContainingSpan(elem, [7, 11])).toBe(null);
       }));

    it('should return null when span is outside element span',
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 11]);
	 expect(findLeastElemContainingSpan(elem, [3, 5])).toBe(null);
	 expect(findLeastElemContainingSpan(elem, [13, 17])).toBe(null);
       }));

    it('should return null when span has some part outside element span',
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 11]);
	 expect(findLeastElemContainingSpan(elem, [7, 12])).toBe(null);
	 expect(findLeastElemContainingSpan(elem, [6, 11])).toBe(null);
       }));

    it('should return element when span is same as element span',
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 11]);
	 expect(findLeastElemContainingSpan(elem, [7, 11])).toBe(elem);
       }));

    it('should return element when span is within element span',
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 11]);
	 expect(findLeastElemContainingSpan(elem, [8, 11])).toBe(elem);
	 expect(findLeastElemContainingSpan(elem, [8, 10])).toBe(elem);
	 expect(findLeastElemContainingSpan(elem, [7, 10])).toBe(elem);
       }));

    it("should return outer element when it's the only one fully containing span",
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 17]);
	 var child = angular.element('<span></span>');
	 child.data("span", [11, 13]);
	 elem.append(child);
	 expect(findLeastElemContainingSpan(elem, [7, 11])).toBe(elem);
	 expect(findLeastElemContainingSpan(elem, [10, 12])).toBe(elem);
	 expect(findLeastElemContainingSpan(elem, [12, 14])).toBe(elem);
	 expect(findLeastElemContainingSpan(elem, [14, 17])).toBe(elem);
       }));

    it("should return inner element when it has the span we seek",
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span></span>');
	 elem.data("span", [7, 17]);
	 var child = angular.element('<span></span>');
	 child.data("span", [11, 13]);
	 elem.append(child);
	 expect(findLeastElemContainingSpan(elem, [11, 13])).toBeAngularEqual(child);
       }));

    it("should not return an element without a span",
       inject(function(findLeastElemContainingSpan) {
	 var elem = angular.element('<span>parent</span>');
	 elem.data("span", [7, 17]);
	 var child = angular.element('<span>child</span>');
	 child.data("span", [11, 13]);
	 elem.append(child);
	 var grandchild = angular.element('<span>grandchild</span>');
	 expect(findLeastElemContainingSpan(elem, [11, 13])).toBeAngularEqual(child);
       }));

  });// findLeastElemContainingSpan


});
