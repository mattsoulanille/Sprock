'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){

  beforeEach(function () { 
    module("sprock")

    inject(function($injector) { 
      $controller = $injector.get('$controller')
      $rootScope  = $injector.get('$rootScope')
    })

    $scope = $rootScope.$new()
    $controller('myCtrl1', { $scope: $scope} )

  })

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl1 = $controller('MyCtrl1', { $scope: {} });
    expect(myCtrl1).toBeDefined();
  }));

  it('should ....', inject(function($controller) {
    //spec body
    var myCtrl2 = $controller('MyCtrl2', { $scope: {} });
    expect(myCtrl2).toBeDefined();
  }));
});
