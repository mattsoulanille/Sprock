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

});
