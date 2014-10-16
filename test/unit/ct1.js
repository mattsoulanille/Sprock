'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('sprock'));

  describe('MyCtrl6', function() {
    var myCtrl;

    beforeEach(inject(function($controller, $rootScope) {
      myCtrl = $controller('MyCtrl6', {$scope: $rootScope});
    }));

    it('should exist', function() {
      expect(myCtrl).toBeDefined();
    });

  });

  xdescribe('primerModalCtrl', function() {
    var myCtrl;
    var howExited;

    beforeEach(inject(function($controller, $rootScope) {
      $rootScope.modalInstance = {
	close: function(msg) {
	  howExited = 'close: ' + msg;
	},
	cancel: function(msg) {
	  howExited = 'cancel: ' + msg;
	}
      };
      myCtrl = $controller('primerModalCtrl', {$scope: $rootScope});
    }));

    it('should exist', function() {
      expect(myCtrl).toBeDefined();
    });

  });

  describe('Dev', function() {
    var myCtrl;

    beforeEach(inject(function($controller, $rootScope) {
      myCtrl = $controller('Dev', {$scope: $rootScope});
    }));

    it('should exist', function() {
      expect(myCtrl).toBeDefined();
    });

  });

});
