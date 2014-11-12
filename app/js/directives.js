'use strict';

/* Directives */
// see https://docs.angularjs.org/api/ng/service/$compile

angular.module('sprock.directives',
	       ['underscore',
		'sprock.utilities',
		'ui.bootstrap.modal'
	       ]).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    }
  }]).

  /*** UNUSED
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

   *** END UNUSED */

  directive('formatTree',
	    ['_',
	     '$compile',
	     '$modal',
	     '$log',
	     'compareSpans',
	     'findLeastElemContainingSpan',
	     'PrimerPairPossibilitiesDB',
	     'round',
	     function factory(_, $compile, $modal, $log, compareSpans, findLeastElemContainingSpan, PrimerPairPossibilitiesDB, round) {
	       var directiveDefinitionObject = {
		 //template: '<div></div>', // or // function(tElement, tAttrs) { ... },
		 //transclude: true,
		 restrict: 'E',

		 scope: {
		   tree: '=',
		   sequenceInfo: '=',
		   pppList: '=',
		   updateCounter: '='
		 },

		 link: function postLink(scope, iElement, iAttrs, controller) {
		   var spins = 0;
		   var leaf = {}; // An object used to flag a leaf
		   scope.lightSwitches = {}; // used to control hightlighting of specific primer pairs

		   function updateTreeDisplay() {
		     if (!scope.tree) return;
		     iElement.empty();
		     var r = angular.element('<span class="seq"></span>');

		     // Walk the tree and create the corresponding DOM tree of spans
		     var treeForDOM = _.walk(function(obj) {
		       // FIXME: why this complexity?
		       return _.has(obj, 'children') || _.isElement(obj) ? obj.children : obj;
		       //return obj.children;
		     }).reduce(
		       scope.tree, function(memo, v) {
			 var e = angular.element('<span class="' +
						    v.type +
						    '"></span>');
			 // Record span in the DOM element itself, for later traversal:
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
		     // new sequence so DB contents are obsolete
		     PrimerPairPossibilitiesDB.drop_all();

		     var si = scope.sequenceInfo;
		     if (si === undefined) return; // bail if no sequence to install
		     // set the "seq" wrapper to have the span of the sequence:
		     iElement.children().eq(0).data('span', si.span.slice(0));
		     putSequenceInSubtree(iElement, si);
		   };
		   scope.$watch('sequenceInfo', putSequenceInTree);

		   function putSequenceInSubtree(rootElem, si) {

		     function sequenceFragment(left, right) {
		       // Provides an element displaying the sequence in the span [left, right]
		       var rv = angular.element('<span class="seqFrag"></span>');
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
		       rv.append(html);
		       rv.data("span", [left, right]); // Record the span for DOM traversal
		       return rv;
		     };

		     _.walk(function(elem) {
		       return _.map(elem.children(), angular.element);
		     }).postorder(rootElem, function(node) {
		       if (node.hasClass("seqFrag")) {
			 node.remove(); // dump the old sequence fragments
		       } else {
			 var span = node.data().span;
			 if (!span) return;
			 var children = _.map(node.children(), angular.element);
			 // angular's jqLite doesn't have element.before(), only .after()
			 // so we scan from "right to left"
			 var gap_right = span[1];
			 var gap_left;
			 try {
			   if (children.length && !!children[0].data().span) {
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
			   // no span, so nothing to install
			 }
			 gap_left = span[0];
			 if (gap_left < gap_right) {
			   node.prepend(sequenceFragment(gap_left, gap_right));
			 };
		       };
		     });

		   };


		   function unPrime(elem) {
		     chai.expect(elem.hasClass('primer')).to.be.true;
		     var children = _.map(elem.children(), angular.element);
		     while (children.length) {
		       elem.after(children.pop());
		     };
		     elem.remove();
		   };

		   function removePPP(ppp) {
		     var d = PrimerPairPossibilitiesDB.get_by_ppp(ppp);
		     chai.expect(d).to.include.keys('elements');
		     _.each(d.elements, unPrime);
		     PrimerPairPossibilitiesDB.drop_by_ppp(ppp);
		   };


		   function makeDOMMatchPrimerPairPossibilitiesList() {
		     if (!scope.pppList || !scope.pppList.length) return;

		     // First clear away primers that are not in the current pppList
		     var keysInPPPList =
			   _.filter(_.map(scope.pppList,
					  PrimerPairPossibilitiesDB.key_from_ppp),
				    _.identity);
		     var keysNotInPPPList =
			   _.difference(PrimerPairPossibilitiesDB.all_keys(),
					keysInPPPList);

		     _.map(scope.pppList, function(ppp) {
		       chai.expect(ppp).to.be.an('object')});
		     _.map(PrimerPairPossibilitiesDB.all(), function(ppp) {
		       chai.expect(ppp).to.be.an('object')});
		     _.map(keysInPPPList, function(k) {
		       chai.expect(k).to.be.a('string')});
		     _.map(keysNotInPPPList, function(k) {
		       chai.expect(k).to.be.a('string')});

		     /* Not always, hmmm...
		     chai.expect(
		       _.map(
			 _.difference(
			   PrimerPairPossibilitiesDB.all(),
			   _.map(
			     scope.pppList,
			   PrimerPairPossibilitiesDB.get_by_ppp)),
			 PrimerPairPossibilitiesDB.key_from_ppp).sort()).
		       to.deep.equal(keysNotInPPPList.sort());
		      */

		     _.each(
		       _.difference(
			 PrimerPairPossibilitiesDB.all(),
			 _.map(scope.pppList, PrimerPairPossibilitiesDB.get_by_ppp)
			 ), function(d) {
			   chai.expect(d).to.include.keys('elements');
			   _.each(d.elements, unPrime);
			   PrimerPairPossibilitiesDB.drop(d);
			 });

		     // Ensure each ppp in pppList is or gets put in the DOM
		     _.each(scope.pppList, function(ppp) {
		       if (!ppp.primer_pair_num_returned) {
			 //console.log("where's my primers?:");
			 //console.log(ppp);
		       } else {
			 ensurePrimerPairPossibilitiesInTree(ppp);
		       }});

		     scope.updateCounter++;
		     //console.log('scope.updateCounter = ' + scope.updateCounter);
		   };
		   scope.$watchCollection('pppList', makeDOMMatchPrimerPairPossibilitiesList);


		   function ensurePrimerPairPossibilitiesInTree(ppp, ppIndex) {
		     var ppp_data = PrimerPairPossibilitiesDB.get_by_ppp(ppp);
		     if (!ppp_data.elements) { // ppp is not installed in the DOM.
		       _.extend(ppp_data, putPrimerPairPossibilitiesInTree(ppp, ppIndex || 0));
		     };
		   };


		   function putPrimerPairPossibilitiesInTree(ppp, ppIndex) {
		     var rv = {elements: {}};
		     var seq_elem = iElement.children().eq(0); // get our root sequence element
		     chai.assert(seq_elem.hasClass("seq"),
				 'putPrimerPairInTree() expected a "seq" element');
		     var pp = ppp.primer_pairs[ppIndex];
		     var switchName = 'lightSwitches.' +
			   pp.left.sequence + pp.right.sequence;
		     var pair_span = pp.right.span[1] - pp.left.span[0];
		     var pair_tm = _.map([pp.left.tm, pp.right.tm], function(v) {
		       return round(v, 2);
		     });
		     _.each(
		       [[pp.left, "left"], [pp.right, "right"]], function(t) {
			 var primer = t[0];
			 var side_name = t[1];
			 var elem = findLeastElemContainingSpan(seq_elem, primer.span);
			 if (elem) {
			   var e = putPrimerIn(elem, primer);
			   e.addClass("primer-" + side_name);
			   e.attr('ng-class', '{lit: ' + switchName + '}');
			   e.attr('ng-mouseenter', switchName + '=true');
			   e.attr('ng-mouseleave', switchName + '=false');
			   e.attr('tooltip', pair_span + ' ' + pair_tm +
				 ' ' + primer.sequence);
			   e.attr('tooltip-placement', 'top');
			   e.data('ppp', ppp);
			   e.data('ppIndex', ppIndex);
			   e.attr('ng-click',
				  "primerModal($event, '" +
				  pp.left.sequence + "', '" +
				  pp.right.sequence + "')");
			   $compile(e)(scope);
			   rv.elements[side_name] = e;
			 } else {
			   console.log("no place for primer:");
			   console.log(primer);
			 };
		       });
		     return rv;
		   };


		   function putPrimerIn(elem, primer) {
		     chai.assert(elem.hasClass("seqFrag"),
				 'putPrimerIn(elem, primer) expected a "seqFrag" element' +
				 ', got a ' + '"' + elem.attr("class") + '" element');
		     var elem_span = elem.data().span;
		     _.each(primer.span, function(v) {
		       chai.expect(v).to.be.within(elem_span[0], elem_span[1]);
		     });
		     var primer_start = primer.span[0];
		     var primer_end = primer.span[1];

		     // Find leftmost child whose end > primer_start
		     // If its start < primer_start, then split it
		     var child = elem.children().eq(0);
		     var prev_child = null;
		     chai.expect(child).to.have.length(1); // meaning it isn't []
		     chai.assert(angular.isElement(child), "expected angular element");
		     var child_start = elem_span[0];
		     var child_end;
		     var child_text;
		     var new_child;

		     while (child.length) {
		       child_text = child.text();
		       child_end = child_start + child_text.length;
		       if (child_end > primer_start) break;
		       prev_child = child;
		       child = child.next();
		       child_start = child_end;
		     };
		     chai.expect(child).to.have.length(1);
		     chai.expect(child_start).to.be.at.most(primer_start);
		     if (child_start < primer_start) {
		       // split it
		       var how_far_into_child_to_cut = primer_start - child_start;
		       new_child = child.clone();
		       child.text(child_text.slice(0, how_far_into_child_to_cut));
		       new_child.text(child_text.slice(how_far_into_child_to_cut));
		       child.after(new_child);
		       prev_child = child;
		       child = new_child;
		       child_start = primer_start;
		       child_text = child.text(); // unnecessary
		     };
		     chai.expect(child).to.have.length(1);
		     chai.assert(angular.isElement(child),
				 "putPrimerIn() ran out of children looking for end");

		     chai.expect(child_start).to.equal(primer_start);
		     // Here child's start aligns with primer start
		     // prev_child is the immediately-leftward child
		     // We place the primer element between them
		     var primer_elem = angular.element('<span class="primer"></span>');
//		     primer_elem.attr("tooltip", "so nice");
//		     var primer_elem = angular.element('<span class="primer" tooltip="lovely"></span>');
		     if (prev_child === null) { // It has no child before it
		       elem.prepend(primer_elem); // so it goes first
		     } else {
		       prev_child.after(primer_elem);
		     };

		     // Transfer children into primer_elem, until
		     // the first child whose end >= primer_end
		     // If its end is > primer_end, then split it
		     // Include it in primer_elem
		     while (child.length) {
		       child_text = child.text();
		       child_end = child_start + child_text.length;
		       //console.log("child_start=" + child_start + ", child_end=" + child_end);
		       if (child_end > primer_end) {
			 var how_far_into_child_to_cut = primer_end - child_start;
			 new_child = child.clone();
			 child.text(child_text.slice(0, how_far_into_child_to_cut));
			 new_child.text(child_text.slice(how_far_into_child_to_cut));
			 child.after(new_child);
			 child_text = child.text();
			 child_end = child_start + child_text.length;
			 chai.expect(child_end).to.equal(primer_end);
		       };
		       var child_venir = child.next();
		       primer_elem.append(child);
		       if (child_end === primer_end) break;
		       child = child_venir;
		       child_start = child_end;
		       //console.log(elem);
		     };
		     chai.expect(child).to.have.length(1);
		     return primer_elem;
		   };


		   scope.primerModal = function(clickEvent, left_seq, right_seq) {

		     var targetElement = angular.element(clickEvent.currentTarget);

		     var modalInstance = $modal.open({
		       templateUrl: 'partials/primerModalContent.html',
		       controller: 'primerModalCtrl',
		       //size: size,
		       resolve: {
			 me: function () {
			   return targetElement;
			 }
		       }
		     });

		     modalInstance.result.then(function (selected) {
		       $log.info('Modal gives ' + JSON.stringify(selected));
		       if (selected.index !== selected.original_index) {
			 var ppp = targetElement.data('ppp');
			 removePPP(ppp);
			 ensurePrimerPairPossibilitiesInTree(ppp, selected.index);
			 scope.updateCounter++;
		       };
		     }, function (why) {
		       $log.info('Modal dismissed at: ' + new Date() +
				 ' because of ' + why);
		     });
		   };

		 } //link
	       };

	       return directiveDefinitionObject;
	     }]);
  /*** UNUSED 
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
   *** END UNUSED */
