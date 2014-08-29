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

  describe('formatSequence', function() {
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

  });


});
