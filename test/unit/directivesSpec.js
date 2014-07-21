'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
  beforeEach(module('sprock.directives'));

//  beforeEach(inject(function($injector) {
//    injector = $injector;
//  }));

//  beforeEach(inject(function($injector) { 
//    $rootScope  = $injector.get('$rootScope')
//  }));

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

//  describe('$rootScope', function() {
//    it('should exist', function($rootScope) {
//      expect($rootScope).toBeDefined()
//    });
//  });

//  describe('$injector', function() {
//    it('should exist', function($injector) {
//      expect($injector).toBeDefined()
//    });
//  });

//  describe('formatSequence', function() {

//    it('should exist', inject(function(formatSequence) {
//      expect(formatSequence).toBeDefined();
/*
      module(function($provide) {
        $provide.value('version', 'TEST_VER');
      });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect(element.text()).toEqual('TEST_VER');
      });
*/
//    }));
//  });
});
