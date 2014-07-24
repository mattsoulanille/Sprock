'use strict';

/* Directives */
// see https://docs.angularjs.org/api/ng/service/$compile

angular.module('sprock.directives', ['underscore', 'sprock.utilities']).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    }
  }]).

  directive('formatSequence',
	    ['_',
	     'differentiateSequenceToEvents',
	     'integrateSequenceEventsToHTML',
	     function(_,
		      differentiateSequenceToEvents,
		      integrateSequenceEventsToHTML ) {
			function link(scope, elm, attrs) {
			  function updateSequenceDisplay(seqInfo) {
			    elm.empty();
			    //elm.append('<p>Hello there! ' + _.uniqueId() + '</p>');
			    seqInfo && elm.append(function(seqInfo) {
			      return integrateSequenceEventsToHTML(differentiateSequenceToEvents(seqInfo));
			    }(seqInfo));
			  };

			  scope.$watch(attrs.formatSequence, function(seqInfo) {
			    updateSequenceDisplay(seqInfo);
			  });
			};

			return {
			  link: link
			};
		      }]).

  directive('formatScience',
	    ['_', 'differentiateSequenceToEvents', 'integrateSequenceEventsToHTML',
	     function factory(_, differentiateSequenceToEvents, integrateSequenceEventsToHTML ) {
	       var directiveDefinitionObject = {
		 //template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 restrict: 'E',

		 scope: {
		   sequenceData: '=',
		   featuresData: '='
		 },

		 link: function postLink(scope, iElement, iAttrs, controller) { 
		   function updateSequenceDisplay(something) {
		     iElement.empty();
		     //iElement.append('<p>Hello there! ' + _.uniqueId() + '</p>');
		     //iElement.append('<p>something is ' + something + '</p>');
		     iElement.append('<h3>format-science</h3>');
		     scope.sequenceData && iElement.
		       append(
			 integrateSequenceEventsToHTML(
			   differentiateSequenceToEvents(
			     scope.sequenceData
			   )));
		   };

		   // I wish for $watchGroup(), but don't find it, hence this:
		   scope.tickle = 0;
		   scope.$watch('sequenceData', function(newVal, oldVal, scope) {
		     scope.tickle++;
		   });
		   scope.$watch('featuresData', function(newVal, oldVal, scope) {
		     scope.tickle++;
		   });
		   scope.$watch('tickle', updateSequenceDisplay);
		 }
	       };

	       return directiveDefinitionObject;

	     }]);
