'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('sprock.services'));

  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1.1');
    }));
  });

  describe('getSequence', function() {
    it('should be a function', inject(function(getSequence) {
      expect(getSequence).toBeFunction();
    }));
    it('should return a promise', inject(function(getSequence) {
      expect(getSequence()).toBeAPromise();
    }));
    xit('should produce good sequence data', inject(function(getSequence, $rootScope, $httpBackend) {
      // FIXME
      var sequence;
      getSequence('Scaffold1', 2, 34).then(function(v) { sequence = v; });
      expect(sequence).toBeUndefined();
      $rootScope.$apply();
      expect(sequence).toBe('getSequence happy');
    }));
  });

  describe('getTree', function() {
    it('should be a function', inject(function(getTree) {
      expect(getTree).toBeFunction();
    }));
    it('should return a promise', inject(function(getTree) {
      expect(getTree()).toBeAPromise();
    }));
  });

  // unused
  xdescribe('getSeqInfo', function() {
    it('should be a function', inject(function(getSeqInfo) {
      expect(getSeqInfo).toBeFunction();
    }));
    it('should return a promise', inject(function(getSeqInfo) {
      expect(getSeqInfo()).toBeAPromise();
    }));
    xit('should produce good sequence data', inject(function(getSeqInfo, $rootScope, $httpBackend) {
      // FIXME
      var sequence;
      getSeqInfo('Scaffold1', 2, 34).then(function(v) { sequence = v; });
      expect(sequence).toBeUndefined();
      $rootScope.$apply();
      expect(sequence).toBe('getSeqInfo happy');
    }));
  });


  describe('PrimerPairPossibilitiesDB', function() {
    var ppp_1, ppp_2;

    beforeEach(function() {
      ppp_1 = {
	primer_pair_num_returned: 1,
	primer_pairs: [{
	  left: {
	    sequence: 'ABCD'
	  },
	  right: {
	    sequence: 'EFGH'
	  }
	}]};

      ppp_2 = {
	primer_pair_num_returned: 1,
	primer_pairs: [{
	  left: {
	    sequence: 'IJKL'
	  },
	  right: {
	    sequence: 'MNOP'
	  }
	}]};
    });

    it('should exist', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB).toBeAwesome();
    }));

    it('should provide a key_from_ppp function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.key_from_ppp).toBeFunction();
    }));

    it('should provide a get_by_ppp function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.get_by_ppp).toBeFunction();
    }));

    it('should provide a get_by_key function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.get_by_key).toBeFunction();
    }));

    it('should provide an all_keys function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.all_keys).toBeFunction();
    }));

    it('should provide an all function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.all).toBeFunction();
    }));

    it('should provide a drop_by_ppp function', inject(function(PrimerPairPossibilitiesDB) {
      expect(PrimerPairPossibilitiesDB.drop_by_ppp).toBeFunction();
    }));

    describe('basic operations', function() {

      it('should produce keys', inject(function(PrimerPairPossibilitiesDB) {
	expect(PrimerPairPossibilitiesDB.key_from_ppp(ppp_1)).toBe("ABCDEFGH");
	expect(PrimerPairPossibilitiesDB.key_from_ppp(ppp_2)).toBe("IJKLMNOP");
      }));

      it('should produce null key for non-ppp', inject(function(PrimerPairPossibilitiesDB) {
	expect(PrimerPairPossibilitiesDB.key_from_ppp(null)).toBe(null);
	expect(PrimerPairPossibilitiesDB.key_from_ppp({})).toBe(null);
	expect(PrimerPairPossibilitiesDB.key_from_ppp({frogs: 7})).toBe(null);
      }));

      it('should return null for get of non-ppp', inject(function(PrimerPairPossibilitiesDB) {
	expect(PrimerPairPossibilitiesDB.get_by_ppp(null)).toBe(null);
	expect(PrimerPairPossibilitiesDB.get_by_ppp({})).toBe(null);
	expect(PrimerPairPossibilitiesDB.get_by_ppp({frogs: 7})).toBe(null);
      }));

      it('should provide object from ppp', inject(function(PrimerPairPossibilitiesDB) {
	var t = PrimerPairPossibilitiesDB.get_by_ppp(ppp_1);
	expect(t.foo).not.toBeDefined();
	t.foo = "bar";
	expect(t.foo).toBe("bar");
      }));

      it('should retrieve object', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).toBe("bar");
      }));

      it('should retrieve objects w/o confusion', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).toBe("bar");
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo).toBe("restaurant");
      }));

      it('should produce all keys', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	expect(PrimerPairPossibilitiesDB.all_keys()).toBeAngularEqual(["ABCDEFGH", "IJKLMNOP"]);
      }));

      it('should produce all objects', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	expect(PrimerPairPossibilitiesDB.all().sort()).
	  toBeAngularEqual([
	    { key: 'ABCDEFGH', foo : 'bar' },
	    { key: 'IJKLMNOP', foo : 'restaurant' } ].sort());
      }));

      it('should drop object by ppp', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.drop_by_ppp(ppp_1);
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).not.toBeDefined();
      }));

      it('should drop object by answer', inject(function(PrimerPairPossibilitiesDB) {
	var d = PrimerPairPossibilitiesDB.get_by_ppp(ppp_1)
	d.foo = "bar";
	PrimerPairPossibilitiesDB.drop(d);
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).not.toBeDefined();
      }));

      it('should forget key of dropped object', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.drop_by_ppp(ppp_1);
	expect(PrimerPairPossibilitiesDB.all_keys()).toEqual([]);
      }));

      it('should drop correct object', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	PrimerPairPossibilitiesDB.drop_by_ppp(ppp_1);
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).not.toBeDefined();
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo).toBe("restaurant");
      }));

      it('should drop all correctly', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	PrimerPairPossibilitiesDB.drop_all();
	expect(PrimerPairPossibilitiesDB.all_keys()).toEqual([]);
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).not.toBeDefined();
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo).not.toBeDefined();
      }));

    }); // basic operations

    describe('basic operations', function() {

      it('should do several thing right', inject(function(PrimerPairPossibilitiesDB) {
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo = "bar";
	PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo = "restaurant";
	_.each(PrimerPairPossibilitiesDB.all_keys(), PrimerPairPossibilitiesDB.drop_by_key);
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_1).foo).not.toBeDefined();
	expect(PrimerPairPossibilitiesDB.get_by_ppp(ppp_2).foo).not.toBeDefined();
	expect(PrimerPairPossibilitiesDB.get_by_key('ABCDWXYZ')).
	  toBeAngularEqual({ key : 'ABCDWXYZ' });
	expect(PrimerPairPossibilitiesDB.get_by_key('ABCDWXYZ').foo).not.toBeDefined();
      }));

    });

  });

  describe('downloadData', function() {
    var data;

    beforeEach(function() {
      var data_array = [['a', 'b', 'c'],[1,2,3]];
      data = _.map(data_array, function(v) {
	return v.join('\t');
      }).join('\n') + '\n';
      expect(data).toEqual('a\tb\tc\n1\t2\t3\n');
    });

    it('should exist', inject(function(downloadData) {
      expect(downloadData).toBeFunction();
    }));

    // This spec is expected to pass. Because it litters the download destination it is x'd out.
    // It should be re-enabled upon any suspicion about the correct functioning of downloadData
    xit('should download data', inject(function(downloadData) {
      expect(downloadData(data, 'trashMe.tsv')).toBe(true);
    }));

  });
});
