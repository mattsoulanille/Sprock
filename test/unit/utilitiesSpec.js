'use strict';

/* jasmine specs for utilities go here */

/* farting around:
describe('module interface', function() {
  describe('before running module function', function() {
    it('should not have inject function', function() {
      expect(inject).not.toBeDefined();
    });
  });
});
*/

describe('service', function() {
  beforeEach(module('sprock.utilities'));

  describe('underscore each()', function() {
    it('should exist', inject(function(_) {
      expect(_.each).toBeDefined();
    }));
    it('should go through an array in order', inject(function(_) {
      var cat = '';
      _.each([1,2,3,4,5], function(e) { cat += e })
      expect(cat).toEqual('12345');
    }));
    it('should go through an array in order when elements added out of order',
       // http://ecma-international.org/ecma-262/5.1/#sec-15.4.4.18
       inject(function(_) {
	 var cat = '';
	 var a = [];
	 a[2] = 3; a[0] = 1; a[4] = 5; a[1] = 2; a[3] = 4;
	 _.each(a, function(e) { cat += e })
	 expect(cat).toEqual('12345');
       }));
  });

  describe('integrateSequenceEventsToHTML', function() {
    it('should be a function', inject(function(integrateSequenceEventsToHTML) {
      expect(integrateSequenceEventsToHTML).toBeFunction();
    }));
    it('should do the right thing with events in sequence', inject(function(integrateSequenceEventsToHTML) {
      var seq_events = { events: [[0, {a: 'seq'}],
				  [0, {q: 'qual90', x: 'exon'}],
				  [5, {q: 'qual70'}],
				  [11, {x: null}],
				  [14, {q: 'qual20'}]
				 ],
			 seq: 'GACCTACATCAGGCT' }
      var html = integrateSequenceEventsToHTML(seq_events);
      expect(html).toBe('<span class="seq qual90 exon">GACCT</span>' +
			'<span class="seq qual70 exon">ACATCA</span>' +
			'<span class="seq qual70">GGC</span>' +
			'<span class="seq qual20">T</span>');
    }));
    it('should do the right thing with events out of sequence', inject(function(integrateSequenceEventsToHTML) {
      var seq_events = { events: [[11, {x: null}],
				  [0, {q: 'qual90', x: 'exon'}],
				  [14, {q: 'qual20'}],
				  [0, {a: 'seq'}],
				  [5, {q: 'qual70'}]
				 ],
			 seq: 'GACCTACATCAGGCT' }
      var html = integrateSequenceEventsToHTML(seq_events);
      expect(html).toBe('<span class="seq qual90 exon">GACCT</span>' +
			'<span class="seq qual70 exon">ACATCA</span>' +
			'<span class="seq qual70">GGC</span>' +
			'<span class="seq qual20">T</span>');
    }));
  });

  describe('differentiateSequenceToEvents', function() {
    it('should be a function', inject(function(differentiateSequenceToEvents) {
      expect(differentiateSequenceToEvents).toBeFunction();
    }));
    it('should do the right thing', inject(function(differentiateSequenceToEvents) {
      var sequence = {quality: [56, 51, 51, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 51, 51, 51, 51],
		      sequence: 'TCATTTATATTATTTAGATGTG'};
      expect(differentiateSequenceToEvents(sequence)).toEqual({ events: [[0, {a: 'seq'}],
									 [0, {q: 'qual56'}],
									 [1, {q: 'qual51'}],
									 [3, {q: 'qual45'}],
									 [18, {q: 'qual51'}]
									],
								seq: 'TCATTTATATTATTTAGATGTG' });
    }));
  });

  describe('convertExonsToEvents', function() {
    it('should be a function', inject(function(convertExonsToEvents) {
      expect(convertExonsToEvents).toBeFunction();
    }));
    it('should do the right thing', inject(function(convertExonsToEvents) {
      var exons = {ID: "fooExon",
		   exons: { 'xfone': [100, 110],
			    'xftwo': [112, 116] }};
      expect(convertExonsToEvents(exons, 100)).toEqual({ events: [[0, {x: 'exon'}],
							     [10, {x: null}],
							     [12, {x: 'exon'}],
							     [16, {x: null}]]});
    }));
  });

  describe('convertFeaturesToEvents', function() {
    it('should be a function', inject(function(convertFeaturesToEvents) {
      expect(convertFeaturesToEvents).toBeFunction();
    }));
    it('should do the right thing', inject(function(convertFeaturesToEvents) {
      var features = [{"span": [13028, 18195], "type": "gene", "id": "SPU_016802gn", "strand": "-"},
		      {"span": [13028, 18195], "type": "transcript", "id": "SPU_016802-tr", "strand": "-"},
		      {"span": [15818, 16028], "type": "exon", "id": "SPU_016802:1", "strand": "-"},
		      {"span": [15263, 15412], "type": "exon", "id": "SPU_016802:2", "strand": "-"},
		      {"span": [13880, 13989], "type": "exon", "id": "SPU_016802:3", "strand": "-"},
		      {"span": [13028, 13193], "type": "exon", "id": "SPU_016802:4", "strand": "-"}];

      expect(convertFeaturesToEvents(features, 13000)).toEqual({"events":
								[[28,{"gene":"gene"}],
								 [28,{"transcript":"transcript"}],
								 [28,{"exon":"exon"}],
								 [193,{"exon":null}],
								 [880,{"exon":"exon"}],
								 [989,{"exon":null}],
								 [2263,{"exon":"exon"}],
								 [2412,{"exon":null}],
								 [2818,{"exon":"exon"}],
								 [3028,{"exon":null}],
								 [5195,{"gene":null}],
								 [5195,{"transcript":null}]]});

    }));
  });

});