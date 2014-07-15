'use strict';

/* Directives */


angular.module('sprock.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version)
    }
  }])
  .directive('formatSequence', ['_', function(_) {
    function link(scope, elm, attrs) {
      //console.log(elm)

      function updateSequenceDisplay(seq) {
	elm.empty()
	seq && elm.append(function(sequence, quals) {

	  function integrate(events) {
	    // I wish native forEach() could be trusted to be in-order
	    /* 
	     * => '<span class="foo bar">ATCGC</span><span class="foo bar etc">...'
	     */
	    var s = ''
	    for (var i = 0, length = events.length; i < length; i++) {
	      var e = events[i]
	      
	    }
	  }

	  var l_sequence = sequence.length
	  var s = '<span class="seq qual' + quals[0] + '">'
	  var prev_q = quals[0]
	  s += sequence[0]
	  var i = 1

	  while (i < l_sequence) {
	    var q = quals[i]
	    if (q != prev_q) {
	      s += '</span><span class="seq qual' + q + '">'
	      prev_q = q
	    }
	    s += sequence[i]
	    i += 1
	  }
	  s += '</span>'
	  return s
	}(seq['sequence'], seq['quality']))
      }

      scope.$watch(attrs.formatSequence, function(seq) {
	updateSequenceDisplay(seq)
      })
    }

    return {
      link: link
    }
  }])
