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

  describe('eachInOrder', function() {
    it('should exist', inject(function(eachInOrder) {
      expect(eachInOrder).toBeDefined();
    }));
    it('should go through an array in order', inject(function(eachInOrder) {
      var cat = '';
      eachInOrder([1,2,3,4,5], function(e) { cat += e })
      expect(cat).toEqual('12345');
    }));
    it('should go through an array in order when elements added out of order',
       inject(function(eachInOrder) {
	 var cat = '';
	 var a = [];
	 a[2] = 3; a[0] = 1; a[4] = 5; a[1] = 2; a[3] = 4;
	 eachInOrder(a, function(e) { cat += e })
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

});
