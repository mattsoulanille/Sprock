'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  beforeEach(module('sprock.directives'));

  describe('app-version', function() {
    it('should print current version', function() {
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
    });
  });

  describe('formatScience', function() {
    var si;
    var header = '<h3>format-science</h3>';

    function fs(soa) {
      var rv;
      inject(function($compile, $rootScope) {
	$rootScope.soa = soa;
	//expect($rootScope.soa).toEqual(soa);
	var myScope = $rootScope.$new()
        var element = $compile('<format-science sequence-objects-array="soa"></format-science>')(myScope);
	myScope.$digest();	// fire the $watch'es
	rv = element.html();
      });
      return rv;
    };

    it('should exist', function() {
      inject(function($compile, $rootScope) {
	$rootScope.soa = [];
	expect($rootScope.soa).toBeDefined();
        var element = $compile('<format-science sequence-objects-array="soa"></format-science>')($rootScope);
	$rootScope.$digest();	// fire the $watch'es
        expect(element.html()).toEqual(header + '<span class="seq"></span>');
      });
    });

    it('should exist', function() {
      var soa = [];
      expect(fs(soa)).
	toBe(header+'<span class="seq"></span>');
    });

    it('should handle a teeny case', function() {
      var soa = [{b: 'A', q: 90}];
      expect(fs(soa)).
	toBe(header+'<span class="seq"><span class="q90">A</span></span>');
    });

    it('should handle a small case', function() {
      var soa = [{b: 'A', q: 90},
		 {b: 'T', q: 90},
		 {b: 'C', q: 90},
		 {b: 'G', q: 90}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq"><span class="q90">ATCG</span></span>');
    });

    it('should handle a simple case', function() {
      var soa = [{b: 'A', q: 90},
		 {b: 'T', q: 90},
		 {b: 'C', q: 90},
		 {b: 'G', q: 90},
		 {b: 'N', q: 0}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq"><span class="q90">ATCG</span>' +
	     '<span class="q0">N</span></span>');
    });

    it('should handle simple case 2', function() {
      var soa = [{b: 'A', q: 90},
		 {b: 'T', q: 45},
		 {b: 'C', q: 90},
		 {b: 'G', q: 90},
		 {b: 'N', q: 0},
		 {b: 'G', q: 20}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq">' +
	     '<span class="q90">A</span>' +
	     '<span class="q45">T</span>' +
	     '<span class="q90">CG</span>' +
	     '<span class="q0">N</span>' +
	     '<span class="q20">G</span>' +
	     '</span>');
    });

    it('should handle modest case 1', function() {
      var soa = [{b: 'A', q: 90, gene: 'gene', transcript: 'transcript'},
		 {b: 'T', q: 45},
		 {b: 'C', q: 90},
		 {b: 'G', q: 90},
		 {b: 'N', q: 0},
		 {b: 'G', q: 20},
		 {b: 'C', q: 90, gene: null, transcript: null}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq">' +
	       '<span class="gene">' +
		 '<span class="transcript">' +
		   '<span class="q90">A</span>' +
		   '<span class="q45">T</span>' +
		   '<span class="q90">CG</span>' +
		   '<span class="q0">N</span>' +
		   '<span class="q20">G</span>' +
		 '</span>' +
	       '</span>' +
	       '<span class="q90">C</span>' +
	     '</span>');
    });

    it('should handle modest case 2', function() {
      var soa = [{b: 'A', q: 90, gene: 'gene', transcript: 'transcript'},
		 {b: 'T', q: 45},
		 {b: 'C', q: 90, exon: 'exon'},
		 {b: 'G', q: 90},
		 {b: 'G', q: 90},
		 {b: 'G', q: 90, exon: null},
		 {b: 'G', q: 90},
		 {b: 'N', q: 0},
		 {b: 'G', q: 20},
		 {b: 'C', q: 90, gene: null, transcript: null}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq">' +
	       '<span class="gene">' +
		 '<span class="transcript">' +
		   '<span class="q90">A</span>' +
		   '<span class="q45">T</span>' +
		   '<span class="exon">' +
		     '<span class="q90">CGG</span>' +
		   '</span>' +
		   '<span class="q90">GG</span>' +
		   '<span class="q0">N</span>' +
		   '<span class="q20">G</span>' +
		 '</span>' +
	       '</span>' +
	       '<span class="q90">C</span>' +
	     '</span>');
    });

    xit('should handle overlaps', function() {
      var soa = [{b: 'A', q: 90, foo: 'foo'},
		 {b: 'T', q: 45},
		 {b: 'C', q: 90, bar: 'bar'},
		 {b: 'G', q: 90},
		 {b: 'A', q: 90, foo: null},
		 {b: 'T', q: 90, bar: null},
		];
      expect(fs(soa)).toBe('something that works');
    });

  });

  describe('formatTree', function() {
    //var header = '<h3>format-tree</h3>';
    var header = '';
    var si;
    var a_tree;

    beforeEach(function() {
      a_tree = {
        "name": "SPU_022066",
        "scaffold": "Scaffold694",
        "span": [10480, 18337],
        "strand": "-",
        "type": "gene",
        "children": [
          {
            "name": "Sp-Shmt2_1",
            "scaffold": "Scaffold694",
            "span": [10480, 18337],
            "strand": "-",
            "type": "transcript",
            "children": [
              {
                "children": [],
                "name": "SPU_022066_3UTR:0",
                "scaffold": "Scaffold694",
                "span": [10480, 10513],
                "strand": "-",
                "type": "three_prime_UTR"
              },
              {
                "children": [],
                "name": "SPU_022066:0",
                "scaffold": "Scaffold694",
                "span": [10514, 10683],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:1",
                "scaffold": "Scaffold694",
                "span": [11406, 11633],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:2",
                "scaffold": "Scaffold694",
                "span": [11875, 11997],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:3",
                "scaffold": "Scaffold694",
                "span": [12713, 12826],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:4",
                "scaffold": "Scaffold694",
                "span": [13329, 13541],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:5",
                "scaffold": "Scaffold694",
                "span": [14180, 14538],
                "strand": "-",
                "type": "exon"
              },
              {
                "children": [],
                "name": "SPU_022066:6",
                "scaffold": "Scaffold694",
                "span": [17988, 18337],
                "strand": "-",
                "type": "exon"
              }
            ]
          }
        ]
      };
    });


    function fs(tree, seqInfo) {
      var rv;
      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = seqInfo;
	var myScope = $rootScope.$new()
        var element = $compile('<format-tree tree="tree" sequence-info="sequenceInfo"></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	rv = element.html();
      });
      return rv;
    };

    it('should exist', function() {
      var tree = {name: 'root',
		  type: 'bitty',
		  span: [12, 34],
		  children: []
		 };
      expect(fs(tree)).
	toBe(header +
	     '<span class="seq">' +
	       '<span class="bitty" data-name="root"></span>' +
	     '</span>');
    });

    it('should deal gracefully with null', function() {
      var tree = null;
      expect(fs(tree)).
	toBe(header);
    });

    it('should make a tree in the DOM', function() {
      expect(fs(a_tree)).
	toBe(header +
	     '<span class="seq">' +
	       '<span class="gene">' +
	         '<span class="transcript">' +
	           '<span class="three_prime_UTR" data-name="SPU_022066_3UTR:0"></span>' +
	           '<span class="exon" data-name="SPU_022066:0"></span>' +
		   '<span class="exon" data-name="SPU_022066:1"></span>' +
		   '<span class="exon" data-name="SPU_022066:2"></span>' +
		   '<span class="exon" data-name="SPU_022066:3"></span>' +
		   '<span class="exon" data-name="SPU_022066:4"></span>' +
		   '<span class="exon" data-name="SPU_022066:5"></span>' +
		   '<span class="exon" data-name="SPU_022066:6"></span>' +
	         '</span>' +
	       '</span>' +
	     '</span>');

    });

    it('should place sequence with quality into tree', function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [13, 25],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [15, 18],
		    children: []
		  },{
		    name: 'bar',
		    type: 'exon',
		    span: [21, 25],
		    children: []
		  }]
		 };

      var seqInfo = {
	sequence: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	quality: [1, 1, 3, 3, 5, 5, 7, 7, 9, 9, 11, 11, 13, 13,
		  15, 15, 17, 17, 19, 19, 21, 21, 23, 23, 25, 25],
	scaffold: "some scaffold",
	span: [7, 7 + 26]};

      expect(fs(tree, seqInfo)).
	toBe(header +
	     '<span class="seq">' +
	       '<span class="seqFrag">' +
	         '<span class="q1">AB</span>' +
	         '<span class="q3">CD</span>' +
	         '<span class="q5">EF</span>' +
	       '</span>' +
	       '<span class="gene">' +
	         '<span class="seqFrag">' +
	           '<span class="q7">GH</span>' +
	         '</span>' +
	         '<span class="exon" data-name="foo">' +
	           '<span class="seqFrag">' +
	     	'<span class="q9">IJ</span>' +
	     	'<span class="q11">K</span>' +
	           '</span>' +
	         '</span>' +
	         '<span class="seqFrag">' +
	           '<span class="q11">L</span>' +
	           '<span class="q13">MN</span>' +
	         '</span>' +
	         '<span class="exon" data-name="bar">' +
	           '<span class="seqFrag">' +
	     	'<span class="q15">OP</span>' +
	     	'<span class="q17">QR</span>' +
	           '</span>' +
	         '</span>' +
	       '</span>' +
	       '<span class="seqFrag">' +
	         '<span class="q19">ST</span>' +
	         '<span class="q21">UV</span>' +
	         '<span class="q23">WX</span>' +
	         '<span class="q25">YZ</span>' +
	       '</span>' +
	     '</span>');
    });

    it('should allow the sequence span to change', function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [13, 25],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [15, 18],
		    children: []
		  },{
		    name: 'bar',
		    type: 'exon',
		    span: [21, 25],
		    children: []
		  }]
		 };

      var first_seqInfo = {
	sequence: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	quality: [1, 1, 3, 3, 5, 5, 7, 7, 9, 9, 11, 11, 13, 13,
		  15, 15, 17, 17, 19, 19, 21, 21, 23, 23, 25, 25],
	scaffold: "some scaffold",
	span: [7, 7 + 26]};

      var second_seqInfo = {
	sequence: "DEFGHIJKLMNOPQRSTUVWXYZabc",
	quality: [3, 5, 5, 7, 7, 9, 9, 11, 11, 13, 13,
		  15, 15, 17, 17, 19, 19, 21, 21, 23, 23, 25, 25, 27, 27, 29],
	scaffold: "some scaffold",
	span: [10, 10 + 26]};

      var first_expect = header +
	     '<span class="seq">' +
	       '<span class="seqFrag">' +
	         '<span class="q1">AB</span>' +
	         '<span class="q3">CD</span>' +
	         '<span class="q5">EF</span>' +
	       '</span>' +
	       '<span class="gene">' +
	         '<span class="seqFrag">' +
	           '<span class="q7">GH</span>' +
	         '</span>' +
	         '<span class="exon" data-name="foo">' +
	           '<span class="seqFrag">' +
	     	'<span class="q9">IJ</span>' +
	     	'<span class="q11">K</span>' +
	           '</span>' +
	         '</span>' +
	         '<span class="seqFrag">' +
	           '<span class="q11">L</span>' +
	           '<span class="q13">MN</span>' +
	         '</span>' +
	         '<span class="exon" data-name="bar">' +
	           '<span class="seqFrag">' +
	     	'<span class="q15">OP</span>' +
	     	'<span class="q17">QR</span>' +
	           '</span>' +
	         '</span>' +
	       '</span>' +
	       '<span class="seqFrag">' +
	         '<span class="q19">ST</span>' +
	         '<span class="q21">UV</span>' +
	         '<span class="q23">WX</span>' +
	         '<span class="q25">YZ</span>' +
	       '</span>' +
	     '</span>';

      var second_expect = header +
	    '<span class="seq">' +
	      '<span class="seqFrag">' +
	        '<span class="q3">D</span>' +
	        '<span class="q5">EF</span>' +
	      '</span>' +
	      '<span class="gene">' +
	        '<span class="seqFrag">' +
	          '<span class="q7">GH</span>' +
	        '</span>' +
	        '<span class="exon" data-name="foo">' +
	          '<span class="seqFrag">' +
	    	'<span class="q9">IJ</span>' +
	    	'<span class="q11">K</span>' +
	          '</span>' +
	        '</span>' +
	        '<span class="seqFrag">' +
	          '<span class="q11">L</span>' +
	          '<span class="q13">MN</span>' +
	        '</span>' +
	        '<span class="exon" data-name="bar">' +
	          '<span class="seqFrag">' +
	    	'<span class="q15">OP</span>' +
	    	'<span class="q17">QR</span>' +
	          '</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
	        '<span class="q19">ST</span>' +
	        '<span class="q21">UV</span>' +
	        '<span class="q23">WX</span>' +
	        '<span class="q25">YZ</span>' +
	        '<span class="q27">ab</span>' +
	        '<span class="q29">c</span>' +
	      '</span>' +
	    '</span>';



      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = first_seqInfo;
	var myScope = $rootScope.$new()
        var element = $compile('<format-tree tree="tree" sequence-info="sequenceInfo"></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(first_expect);
	$rootScope.sequenceInfo = second_seqInfo;
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(second_expect);
      });
    });

    it('should display primer pairs in very simple case', function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [15, 20],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [15, 20],
		    children: []
		  }]
		 };

      var seqInfo = {
	span: [7, 7 + 20],
	sequence: "ABCDEFGHIJKLMNOPQRST",
	quality: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90,
		  90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
	scaffold: "some scaffold"};

      var primerPair = {
	left: {
	  span: [8, 11],
	  sequence: "LLL" },
	 right: {
	  span: [13, 15],
	  sequence: "RR" }
      };


      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = seqInfo;
	$rootScope.primerPairs = [primerPair];
	var myScope = $rootScope.$new()
        var element = $compile(
	  '<format-tree tree="tree"' +
	    ' sequence-info="sequenceInfo"' +
	    ' primer-pairs="primerPairs"' +
	    '></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(
	  '<span class="seq">' +
	    '<span class="seqFrag">' +
	      '<span class="q90">A</span>' +
	      '<span class="primer primer-left">' +
	        '<span class="q90">BCD</span>' +
	      '</span>' +
	      '<span class="q90">EF</span>' +
	      '<span class="primer primer-right">' +
	        '<span class="q90">GH</span>' +
	      '</span>' +
	    '</span>' +
	    '<span class="gene">' +
	      '<span class="exon" data-name="foo">' +
	        '<span class="seqFrag">' +
	  	'<span class="q90">IJKLM</span>' +
	        '</span>' +
	      '</span>' +
	    '</span>' +
	    '<span class="seqFrag">' +
	      '<span class="q90">NOPQRST</span>' +
	    '</span>' +
	  '</span>'
	);
      });
    });


    it("should display primer pairs in very simple case, with primers after feature", function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [8, 20],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [8, 12],
		    children: []
		  }]
		 };

      var seqInfo = {
	span: [7, 7 + 20],
	sequence: "ABCDEFGHIJKLMNOPQRST",
	quality: [90, 90, 90, 90, 90, 90, 90, 90, 90, 90,
		  90, 90, 90, 90, 90, 90, 90, 90, 90, 90],
	scaffold: "some scaffold"};

      var primerPair = {
	left: {
	  span: [13, 15],
	  sequence: "LL" },
	 right: {
	  span: [17, 19],
	  sequence: "RR" }
      };


      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = seqInfo;
	$rootScope.primerPairs = [primerPair];
	var myScope = $rootScope.$new()
        var element = $compile(
	  '<format-tree tree="tree"' +
	    ' sequence-info="sequenceInfo"' +
	    ' primer-pairs="primerPairs"' +
	    '></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(

	  '<span class="seq">' +
	    '<span class="seqFrag">' +
	      '<span class="q90">A</span>' +
	    '</span>' +
	    '<span class="gene">' +
	      '<span class="exon" data-name="foo">' +
	        '<span class="seqFrag">' +
	  	'<span class="q90">BCDE</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
	        '<span class="q90">F</span>' +
	        '<span class="primer primer-left">' +
	  	'<span class="q90">GH</span>' +
	        '</span>' +
	        '<span class="q90">IJ</span>' +
	        '<span class="primer primer-right">' +
	  	'<span class="q90">KL</span>' +
	        '</span>' +
	        '<span class="q90">M</span>' +
	      '</span>' +
	    '</span>' +
	    '<span class="seqFrag">' +
	      '<span class="q90">NOPQRST</span>' +
	    '</span>' +
	  '</span>'
	);
      });
    });


    it('should display primer pairs in simple case', function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [15, 20],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [15, 20],
		    children: []
		  }]
		 };

      var seqInfo = {
	span: [7, 7 + 20],
	sequence: "ABCDEFGHIJKLMNOPQRST",
	quality: [20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26,
		  27, 27, 28, 28, 29, 29],
	scaffold: "some scaffold"};

      var primerPair = {
	left: {
	  span: [8, 11],
	  sequence: "LLL" },
	 right: {
	  span: [13, 15],
	  sequence: "RR" }
      };


      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = seqInfo;
	$rootScope.primerPairs = [primerPair];
	var myScope = $rootScope.$new()
        var element = $compile(
	  '<format-tree tree="tree"' +
	    ' sequence-info="sequenceInfo"' +
	    ' primer-pairs="primerPairs"' +
	    '></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(
	    '<span class="seq">' +
	      '<span class="seqFrag">' +
		'<span class="q20">A</span>' +
		'<span class="primer primer-left">' +
		  '<span class="q20">B</span>' +
		  '<span class="q21">CD</span>' +
		'</span>' +
		'<span class="q22">EF</span>' +
	        '<span class="primer primer-right">' +
	          '<span class="q23">GH</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="gene">' +
		'<span class="exon" data-name="foo">' +
		  '<span class="seqFrag">' +
		    '<span class="q24">IJ</span>' +
		    '<span class="q25">KL</span>' +
		    '<span class="q26">M</span>' +
		  '</span>' +
		'</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
		'<span class="q26">N</span>' +
		'<span class="q27">OP</span>' +
		'<span class="q28">QR</span>' +
		'<span class="q29">ST</span>' +
	      '</span>' +
	    '</span>'
	);
      });
    });


    xit('should display primer pairs in mild complexity', function() {
      var tree = {name: 'root',
		  type: 'gene',
		  span: [23, 49],
		  children: [{
		    name: 'foo',
		    type: 'exon',
		    span: [25, 30],
		    children: []
		  },{
		    name: 'bar',
		    type: 'exon',
		    span: [46, 49],
		    children: []
		  }]
		 };

      var first_seqInfo = {
	span: [7, 7 + 49],
	sequence: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvw",
	quality: [20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26,
		  27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33,
		  34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40,
		  41, 41, 42, 42, 43, 43, 44, 44, 45, 45],
	scaffold: "some scaffold"};

      var second_seqInfo = {
	span: [10, 10 + 49],
	sequence: "DEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	quality: [20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26,
		  27, 27, 28, 28, 29, 29, 30, 30, 31, 31, 32, 32, 33, 33,
		  34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40, 40,
		  41, 41, 42, 42, 43, 43, 44, 44, 45, 45],
	scaffold: "some scaffold"};

      var first_primerPair = {
	left: {
	  span: [10, 15],
	  sequence: "LLLLL" },
	 right: {
	  span: [18, 22],
	  sequence: "RRRR" }
      };

      var second_primerPair = {
	left: {
	  span: [31, 34],
	  sequence: "lll" },
	 right: {
	  span: [40, 46],
	  sequence: "rrrrrr" }
      };


      var first_expect = header +
	    '<span class="seq">' +
	      '<span class="seqFrag">' +
	        '<span class="q20">AB</span>' +
	        '<span class="q21">CD</span>' +
	        '<span class="q22">EF</span>' +
	        '<span class="q23">GH</span>' +
	        '<span class="q24">IJ</span>' +
	        '<span class="q25">KL</span>' +
	        '<span class="q26">MN</span>' +
	        '<span class="q27">OP</span>' +
	      '</span>' +
	      '<span class="gene">' +
	        '<span class="seqFrag">' +
	          '<span class="q28">QR</span>' +
	        '</span>' +
	        '<span class="exon" data-name="foo">' +
	          '<span class="seqFrag">' +
	    	'<span class="q29">ST</span>' +
	    	'<span class="q30">UV</span>' +
	    	'<span class="q31">W</span>' +
	          '</span>' +
	        '</span>' +
	        '<span class="seqFrag">' +
	          '<span class="q31">X</span>' +
	          '<span class="q32">YZ</span>' +
	          '<span class="q33">ab</span>' +
	          '<span class="q34">cd</span>' +
	          '<span class="q35">ef</span>' +
	          '<span class="q36">gh</span>' +
	          '<span class="q37">ij</span>' +
	          '<span class="q38">kl</span>' +
	          '<span class="q39">m</span>' +
	        '</span>' +
	        '<span class="exon" data-name="bar">' +
	          '<span class="seqFrag">' +
	    	'<span class="q39">n</span>' +
	    	'<span class="q40">op</span>' +
	          '</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
	        '<span class="q41">qr</span>' +
	        '<span class="q42">st</span>' +
	        '<span class="q43">uv</span>' +
	        '<span class="q44">w</span>' +
	      '</span>' +
	    '</span>';

      var first_primed_expect = header +
	    '<span class="seq">' +
	      '<span class="seqFrag">' +
	        '<span class="q20">AB</span>' +
	        '<span class="q21">CD</span>' +
	        '<span class="q22">EF</span>' +
	        '<span class="q23">GH</span>' +
	        '<span class="q24">IJ</span>' +
	        '<span class="q25">KL</span>' +
	        '<span class="q26">MN</span>' +
	        '<span class="q27">OP</span>' +
	      '</span>' +
	      '<span class="gene">' +
	        '<span class="seqFrag">' +
	          '<span class="q28">QR</span>' +
	        '</span>' +
	        '<span class="exon" data-name="foo">' +
	          '<span class="seqFrag">' +
	    	'<span class="q29">ST</span>' +
	    	'<span class="q30">UV</span>' +
	    	'<span class="q31">W</span>' +
	          '</span>' +
	        '</span>' +
	        '<span class="seqFrag">' +
	          '<span class="q31">X</span>' +
	          '<span class="q32">YZ</span>' +
	          '<span class="q33">ab</span>' +
	          '<span class="q34">cd</span>' +
	          '<span class="q35">ef</span>' +
	          '<span class="q36">gh</span>' +
	          '<span class="q37">ij</span>' +
	          '<span class="q38">kl</span>' +
	          '<span class="q39">m</span>' +
	        '</span>' +
	        '<span class="exon" data-name="bar">' +
	          '<span class="seqFrag">' +
	    	'<span class="q39">n</span>' +
	    	'<span class="q40">op</span>' +
	          '</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
	        '<span class="q41">qr</span>' +
	        '<span class="q42">st</span>' +
	        '<span class="q43">uv</span>' +
	        '<span class="q44">w</span>' +
	      '</span>' +
	    '</span>';

      var second_expect = header +
	    '<span class="seq">' +
	      '<span class="seqFrag">' +
	        '<span class="q20">DE</span>' +
	        '<span class="q21">FG</span>' +
	        '<span class="q22">HI</span>' +
	        '<span class="q23">JK</span>' +
	        '<span class="q24">LM</span>' +
	        '<span class="q25">NO</span>' +
	        '<span class="q26">P</span>' +
	      '</span>' +
	      '<span class="gene">' +
	        '<span class="seqFrag">' +
	          '<span class="q26">Q</span>' +
	          '<span class="q27">R</span>' +
	        '</span>' +
	        '<span class="exon" data-name="foo">' +
	          '<span class="seqFrag">' +
	    	'<span class="q27">S</span>' +
	    	'<span class="q28">TU</span>' +
	    	'<span class="q29">VW</span>' +
	          '</span>' +
	        '</span>' +
	        '<span class="seqFrag">' +
	          '<span class="q30">XY</span>' +
	          '<span class="q31">Za</span>' +
	          '<span class="q32">bc</span>' +
	          '<span class="q33">de</span>' +
	          '<span class="q34">fg</span>' +
	          '<span class="q35">hi</span>' +
	          '<span class="q36">jk</span>' +
	          '<span class="q37">lm</span>' +
	        '</span>' +
	        '<span class="exon" data-name="bar">' +
	          '<span class="seqFrag">' +
	    	'<span class="q38">no</span>' +
	    	'<span class="q39">p</span>' +
	          '</span>' +
	        '</span>' +
	      '</span>' +
	      '<span class="seqFrag">' +
	        '<span class="q39">q</span>' +
	        '<span class="q40">rs</span>' +
	        '<span class="q41">tu</span>' +
	        '<span class="q42">vw</span>' +
	        '<span class="q43">xy</span>' +
	        '<span class="q44">z</span>' +
	      '</span>' +
	    '</span>';

      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	$rootScope.sequenceInfo = first_seqInfo;
	var myScope = $rootScope.$new()
        var element = $compile(
	  '<format-tree tree="tree"' +
	    ' sequence-info="sequenceInfo"' +
	    ' primer-pairs="primerPairs"' +
	    '></format-tree>')(myScope);
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(first_expect);
	$rootScope.primerPairs = [first_primerPair];
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(first_primed_expect);
	$rootScope.primerPairs = [first_primerPair,
				 second_primerPair];
	myScope.$digest();	// fire the $watch'es

	$rootScope.sequenceInfo = second_seqInfo;
	myScope.$digest();	// fire the $watch'es
	expect(element.html()).toBe(second_expect);
      });
    });

  });


});
