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
//		 template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 restrict: 'E',
		 scope: {
		   sd: '=sequenceData',
		   //cuties: '=kittens',
		   kittens: '=',
		   essdee: '=essdee'
		 },
		 link: function postLink(scope, iElement, iAttrs, controller) { 
		   function updateSequenceDisplay(something) {
		     iElement.empty();
		     iElement.append('<p>Hello there! ' + _.uniqueId() + '</p>');
//		     iElement.append('<p>something is ' + something + '</p>');
//       iElement.append('<p>scope.cuties is ' + scope.cuties);
		     iElement.append('<p>scope.kittens is ' + scope.kittens + '</p>');
//		       iElement.append('<p>scope.sd is <pre>' + JSON.stringify(scope.sd) + '</pre></p>')
//		       iElement.append('<p>scope.essdee is <pre>' + JSON.stringify(scope.essdee) + '</pre></p>');
		     iElement.append('<p>scope is <pre>' + scope + '</pre></p>');
		     //console.log(scope);

//		       scope.seqData && iElement.append(function(data) {
//			 return integrateSequenceEventsToHTML(differentiateSequenceToEvents(data));
//		       }(scope.seqData));

		   };

//		     updateSequenceDisplay();
//		     scope.$watch(iAttrs.essdee, function(foo) {
//		     scope.$watch(scope.cuties, function(newValue, oldValue) {
		   scope.$watch(
		     'kittens',	// NOT 'scope.kittens'!!
		     // alternately can do: function(scope) { return scope.kittens },
		     function(newValue, oldValue) {
		     console.log('watch scope.kittens ' + _.uniqueId());
		     console.log(scope.kittens);
		     updateSequenceDisplay(newValue);
		   });

		 }
		 // or
		 // link: function postLink( ... ) { ... }
	       };
	       return directiveDefinitionObject;
	     }]);
