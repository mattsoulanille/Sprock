beforeEach(function () { 
  this.addMatchers({ 

    toBeFunction: function () { 
      return this.actual instanceof Function
    },

    toBeInstanceOf: function (klass) { 
      return this.actual instanceof klass
    },

    toBeArray: function () { 
      return this.actual instanceof Array
    },

    toBePositive: function () {
      return this.actual >= 0
    },

    toBeAngularEqual: function (expected) { 
      return angular.equals(this.actual, expected)
    },

    toBeAPromise: function (expected) {
      return !!this.actual.then
    },

    toHaveProperty: function (expected) { 
      return expected in this.actual
    },

    toHaveClass: function (expected) { 
      var actual = this.actual.hasClass ? 
        this.actual : 
        angular.element(this.actual)

      return actual.hasClass(expected)
    },

    toBeString: function() {
      return typeof(this.actual) == "string" || this.actual instanceof String
//      return angular.isString(this.actual) // Not what I want, because angular.isString is
//      function isString(value){return typeof value == 'string';}      
    },

    toBeURL: function() {
      // TODO: improve
      return this.actual && !!this.actual.match(/^https?:\/\/.+/)
    }, 

    toBeAwesome: function () {
      // ummm.  to be awesome you must have functions!
      return !! _.functions(this.actual).length;
    },

    toBeHTMLEqual: function (html) {
      if (this.actual === html) return true;
      var me = angular.element(this.actual);
      var he = angular.element(html);
      return me.html() === he.html();
    }

  })

})

describe("matchers", function () {

  describe("toBeFunction()", function () {
    it("should recognize a function", function () {
      expect(function () {}).toBeFunction()
    })
    it("should not think a string is a function", function () {
      expect("").not.toBeFunction()
    })
    it("should not think an object is a function", function () {
      expect({}).not.toBeFunction()
    })
  })

  describe("toBeString()", function () {
    it("should recognize literal string", function () {
      expect("foo").toBeString()
    })
    it("should recognize String object", function () {
      expect(new String).toBeString()
    })
    it("should recognize String object that is initialized", function () {
      expect(new String("bar")).toBeString()
    })
    it("should not falsely think others are strings", function () {
      expect({}).not.toBeString()
    })
  })

  describe("toBeURL()", function () {
    it("should recognize 'http://www.example.com/'", function () {
      expect('http://www.example.com/').toBeURL()
    })

    it("should recognize 'https://www.example.com/'", function () {
      expect('https://www.example.com/').toBeURL()
    })

    it("should not recognize 'htp://www.example.com/'", function () {
      expect('htp://www.example.com/').not.toBeURL()
    })

    it("should not recognize 'http://'", function () {
      expect('http://').not.toBeURL()
    })

  })

  describe("toBeAwesome()", function () {
    it("should reject a number", function () {
      expect(1).not.toBeAwesome()
    })

    it("should reject an object that contains no functions", function () {
      var t = { foo: 1, bar: "bar" }
      expect(t).not.toBeAwesome()
    })

    it("should accept an object that contains a function", function () {
      var t = { foo: 1, bar: function () {} }
      expect(t).toBeAwesome()
    })
  })

  describe('toBeHTMLEqual()', function() {
    it("should consider empty strings equal", function() {
      expect('').toBeHTMLEqual('');
    });
    it("should consider identical HTML strings equal", function() {
      expect('<br/>').toBeHTMLEqual('<br/>');
    });
    it("should consider equivalent HTML strings equal", function() {
      expect('<br/>').toBeHTMLEqual('<br></br>');
    });
    it("should consider equivalent when attributes merely in different order", function() {
      expect('<span data-name="foo" class="bar"></span>').
	toBeHTMLEqual('<span class="bar" data-name="foo"></span>');
    });
    it("should consider equivalent when classes are merely in different order", function() {
      expect('<span class="foo bar"></span>').
	toBeHTMLEqual('<span class="bar foo"></span>');
    });
  });

});

