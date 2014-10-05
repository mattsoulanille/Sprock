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

  directive('formatTree',
	    ['_',
	     function factory(_) {
	       var directiveDefinitionObject = {
		 //template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 restrict: 'E',

		 scope: {
		   tree: '=',
		   sequenceInfo: '='
		 },

		 link: function postLink(scope, iElement, iAttrs, controller) {
		   var spins = 0;
		   // An object used to flag a leaf
		   var leaf = {};

		   function updateTreeDisplay() {
		     iElement.empty();
		     //iElement.append('<h3>format-tree</h3>');

		     if (!scope.tree) return;

		     var r = angular.element('<span class="seq"></span>');

		     // Walk the tree and create the corresponding DOM tree of spans
		     var treeForDOM = _.walk(function(obj) {
		       return _.has(obj, 'children') || _.isElement(obj) ? obj.children : obj;
		       //return obj.children;
		     }).reduce(
		       scope.tree, function(memo, v) {
			 var e = angular.element('<span class="' +
						    v.type +
						    '"></span>');
			 e.data('span', v.span.slice(0));
			 if (memo == leaf) {
			   e.attr('data-name', v.name);
			 } else {
			   //_.each(memo, e.append);
			   _.each(memo, function(v) {
			     e.append(v);
			   });
			 };
			 return e;
		       }, leaf);

		     r.append(treeForDOM);
		     iElement.append(r);
		   };
		   scope.$watch('tree', updateTreeDisplay);

		   function putSequenceInTree() {

		     function sequenceFragment(left, right) {
		       var seq_start = si.span[0];
		       var seq = si.sequence.slice(left-seq_start, right-seq_start);
		       var qual = si.quality.slice(left-seq_start, right-seq_start);
		       var html = '<span class="q' + si.quality[left-seq_start] + '">' +
			     _.map(_.zip(si.sequence.slice(left-seq_start, right-seq_start),
					 si.quality.slice(left-seq_start, right-seq_start),
					 si.quality.slice(left-seq_start + 1, right-seq_start)),
				   function(triple) {
				     var rv = triple[0];
				     if (triple[1] !== triple[2]) {
				       rv += '</span>';
				       if (triple[2] !== undefined) {
					 rv += '<span class="q' + triple[2] + '">';
				       };
				     };
				     return rv;
				   }).join('');
		       var rv = angular.element('<span class="seqFrag"></span>');
		       rv.append(html); //FIXME
		       return rv;
		     };

		     var si = scope.sequenceInfo;
		     iElement.children().eq(0).data('span', si.span.slice(0));
		     _.walk(function(elem) {
		       return _.map(elem.children(), angular.element);
		     }).postorder(iElement, function(node) {
		       var span = node.data().span;
		       if (!span) return;
		       var children = _.map(node.children(), angular.element);
		       // angular's jqLite doesn't have element.before(), only .after()
		       // so we scan from "right to left"
		       var gap_right = span[1];
		       var gap_left;
		       try {
			 if (!!children[0].data().span) {
			   for (var i=children.length-1; i>=0; i--) {
			     var child = children[i];
			     var child_span = child.data().span;
			     gap_left = child_span[1];
			     if (gap_left < gap_right) {
			       child.after(sequenceFragment(gap_left, gap_right));
			     };
			     gap_right = child_span[0];
			   };
			 };
		       } catch (e) {
		       }
		       gap_left = span[0];
		       if (gap_left < gap_right) {
			 node.prepend(sequenceFragment(gap_left, gap_right));
		       };
		     });

		   };
		   scope.$watch('sequenceInfo', putSequenceInTree);

		 } //link
	       };

	       return directiveDefinitionObject;
	     }]).

  directive('formatScience',
	    ['_', 'differentiateSequenceToEvents', 'integrateSequenceEventsToHTML', 'convertFeaturesToEvents',
	     function factory(_, differentiateSequenceToEvents, integrateSequenceEventsToHTML, convertFeaturesToEvents ) {
	       var directiveDefinitionObject = {
		 //template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 restrict: 'E',

		 scope: {
		   sequenceObjectsArray: '=',
		   tickleCounter: '='
		 },

		 link: function postLink(scope, iElement, iAttrs, controller) { 
		   var spins = 0;
		   function updateSequenceDisplay() {
		     iElement.empty();
		     iElement.append('<h3>format-science</h3>');
		     if (scope.sequenceObjectsArray) {
		       iElement.append(render_to_html(scope.sequenceObjectsArray));
		       //iElement.append('<p>' + ++spins + 'spins</p>');
		     };
		   };
		   scope.$watch('sequenceObjectsArray', updateSequenceDisplay);
		   scope.$watch('tickleCounter', updateSequenceDisplay);

		   function render_to_html(soa) {
		     var rv = '<span class="seq">'; // it's all a sequence
		     var lastq = null;
		     var terminated_quality_span;
		     _.each(soa, function(o) {
		       terminated_quality_span = false;
		       if (o.q !== lastq && lastq !== null) {
			 rv += '</span>';	// change of quality so terminate prior qual span
			 terminated_quality_span = true;
		       };
		       var classes = _.difference(_.keys(o), ['b', 'q']).sort();
		       if (classes.length > 0) {
			 if (!terminated_quality_span && lastq !== null) {
			   rv += '</span>';	// change of quality so terminate prior qual span
			   terminated_quality_span = true;
			 };
			 _.each(classes.reverse(), function(k) {
			   if (o[k] === null) {
			     rv += '</span>'; // close indicated classes in reverse alphabetic order
			   }});
			 _.each(classes.reverse(), function(k) { // this second reverse restores original order
			   if (_.isString(o[k])) {
			     rv += '<span class="' + o[k] + '">'; // open indicated classes
			   }});
		       };
		       if (terminated_quality_span || lastq === null) {
			 rv += '<span class="q' + o.q + '">'; // open the quality class span
			 lastq = o.q;
		       };
		       rv += o.b;
		     });
		     if (lastq !== null) {
		       rv += '</span>';	// close quality class
		     }
		     rv += '</span>';	// close seq class
		     return rv;
		   };
		 }

	       };
	       return directiveDefinitionObject;
	     }]);
