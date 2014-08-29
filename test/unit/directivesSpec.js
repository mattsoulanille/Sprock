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
        var element = $compile('<format-science sequence-objects-array="soa"></format-science>')($rootScope);
	$rootScope.$digest();	// fire the $watch'es
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

  });


});
