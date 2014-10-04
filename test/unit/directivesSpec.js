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
      expect(fs(soa)).
	toBe(header +
	     '<span class="seq">' +
	       '<span class="foo">' +
	         '<span class="q90">A</span>' +
		 '<span class="q45">T</span>' +
	       '</span>' +
	       '<span class="foo bar">' +
	         '<span class="q90">CG</span>' +
	       '</span>' +
	       '<span class="bar">' +
	         '<span class="q90">A</span>' +
	       '</span>' +
	       '<span class="q90">T</span>' +
	     '</span>');
    });

  });

  describe('formatTree', function() {
    var header = '<h3>format-tree</h3>';
    var si;
    var a_tree;

    beforeEach(function() {
      a_tree = {
        "children": [
          {
            "children": [
              {
                "children": [], 
                "name": "SPU_022066_3UTR:0\"", 
                "scaffold": "Scaffold694", 
                "span": [10480, 10513], 
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


    function fs(tree) {
      var rv;
      inject(function($compile, $rootScope) {
	$rootScope.tree = tree;
	var myScope = $rootScope.$new()
        var element = $compile('<format-tree tree="tree"></format-tree>')(myScope);
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
	toBe(header+'<span class="bitty">root</span>');
    });

    it('should make a tree in the DOM', function() {
      expect(fs(a_tree)).
	toBe(header +
	     '<span class="gene">' +
	       '<span class="transcript">' +
	         '<span class="three_prime_UTR">SPU_022066_3UTR:0"</span>' +
	         '<span class="exon">SPU_022066:0"</span>' +
		 '<span class="exon">SPU_022066:1"</span>' +
		 '<span class="exon">SPU_022066:2"</span>' +
		 '<span class="exon">SPU_022066:3"</span>' +
		 '<span class="exon">SPU_022066:4"</span>' +
		 '<span class="exon">SPU_022066:5"</span>' +
		 '<span class="exon">SPU_022066:6"</span>' +
	       '</span>' +
	     '</span>');

    });


    xit('should handle a teeny case', function() {
      var soa = [{b: 'A', q: 90}];
      expect(fs(soa)).
	toBe(header+'<span class="seq"><span class="q90">A</span></span>');
    });

    xit('should handle a small case', function() {
      var soa = [{b: 'A', q: 90},
		 {b: 'T', q: 90},
		 {b: 'C', q: 90},
		 {b: 'G', q: 90}
		];
      expect(fs(soa)).
	toBe(header+'<span class="seq"><span class="q90">ATCG</span></span>');
    });

    xit('should handle a simple case', function() {
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

    xit('should handle simple case 2', function() {
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

    xit('should handle modest case 1', function() {
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

    xit('should handle modest case 2', function() {
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
      expect(fs(soa)).
	toBe(header +
	     '<span class="seq">' +
	       '<span class="foo">' +
	         '<span class="q90">A</span>' +
		 '<span class="q45">T</span>' +
	       '</span>' +
	       '<span class="foo bar">' +
	         '<span class="q90">CG</span>' +
	       '</span>' +
	       '<span class="bar">' +
	         '<span class="q90">A</span>' +
	       '</span>' +
	       '<span class="q90">T</span>' +
	     '</span>');
    });

  });


});
