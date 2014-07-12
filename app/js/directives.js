'use strict';

/* Directives */


angular.module('sprockApp.directives', [])
  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version)
    }
  }])
  .directive('formatSequence', ['_', function(_) {
    function link(scope, elm, attrs) {
      console.log(elm)
      console.log(attrs)
      elm.append('<h2>This is about the sequence</h2>')

      function updateSequenceDisplay(seq) {
	elm.empty()
	elm.append('<span class=sequence>'
		   + seq
		   + '</span>')
      }

      scope.$watch(attrs.formatSequence, function(seq) {
	updateSequenceDisplay(seq)
      })

    }

    return {
      link: link
    }
  }])
