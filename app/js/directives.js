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
	    ['_', 'differentiateSequenceToEvents', 'integrateSequenceEventsToHTML', 'convertFeaturesToEvents',
	     function factory(_, differentiateSequenceToEvents, integrateSequenceEventsToHTML, convertFeaturesToEvents ) {
	       var directiveDefinitionObject = {
		 //template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 restrict: 'E',

		 scope: {
		   sequenceInfo: '='
		 },

		 link: function postLink(scope, iElement, iAttrs, controller) { 
		   function updateSequenceDisplay() {
		     iElement.empty();
		     iElement.append('<h3>format-science</h3>');
		     if (scope.sequenceInfo) {
		       //console.log(scope.sequenceInfo);
		       //iElement.append(scope.sequenceInfo.render_to_html());
		       //DEBUG scope.sequenceInfo.render_to_html(iElement.append); //inverted control, with iElement.append as the callback
		       //scope.sequenceInfo.render_to_html(console.log); //DEBUG
		       //scope.sequenceInfo.render_to_html(function(v) {console.log(v)}); //DEBUG
		       scope.sequenceInfo.render_to_html(function(v) { iElement.append(v) });
		     };
		   };
		   scope.$watch('sequenceInfo', updateSequenceDisplay);
		 }

	       };

	       return directiveDefinitionObject;

	     }]);
