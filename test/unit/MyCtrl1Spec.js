'use strict';

/* jasmine specs for controllers go here */

describe('MyCtrl1', function(){
  var MyCtrl1, $rootScope

  beforeEach(function() { module("sprock") })

  beforeEach(inject(function($injector) { 
//      MyCtrl1 = $injector.get('MyCtrl1')
      $rootScope  = $injector.get('$rootScope')
    }))


  it('should ....', function () {
    //spec body
//    expect(MyCtrl1).toBeDefined()
  })

});
