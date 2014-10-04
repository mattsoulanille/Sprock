'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('sprock'));

  describe('MyCtrl4', function() {
    var myCtrl4;

    beforeEach(inject(function($controller, $rootScope) {
      myCtrl4 = $controller('MyCtrl4', {$scope: $rootScope});
    }));

    it('should exist', function() {
      expect(myCtrl4).toBeDefined();
    });

  });

  describe('Dev', function() {
    var myCtrl5;

    beforeEach(inject(function($controller, $rootScope) {
      myCtrl5 = $controller('Dev', {$scope: $rootScope});
    }));

    it('should exist', function() {
      expect(myCtrl5).toBeDefined();
    });

  });

});
