from __future__ import print_function

import json
import unittest
from itertools import chain, product, izip_longest

from get_sequence import FQDB
from prime import Prime, PrimerMaker, Primer, PrimerPair, PrimerPairPossibilities


fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")

class Thing(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

def compare_spans(a, b):
    return ''.join('<' if t[0] < t[1] else '>' if t[0] > t[1] else '='
                   for t in product(a,b))

class ReturnBoolean(Exception):
    pass

class ReturnTrue(ReturnBoolean):
    pass

class ReturnFalse(ReturnBoolean):
    pass

def deeplyEqualWithFuzz(a, b, fuzz=0.01, verbose=False):
    '''returns True iff equal

    >>> deeplyEqualWithFuzz(0, 0)
    True

    >>> deeplyEqualWithFuzz(1, 1)
    True

    >>> deeplyEqualWithFuzz(1, 0)
    False

    >>> deeplyEqualWithFuzz(0, 1)
    False

    >>> deeplyEqualWithFuzz(1, 'cat')
    False

    >>> deeplyEqualWithFuzz("cat", 'cat')
    True

    >>> deeplyEqualWithFuzz("cat", "dog")
    False

    >>> deeplyEqualWithFuzz(range(3), tuple(range(3)))
    True

    >>> deeplyEqualWithFuzz(range(3), tuple(range(4)))
    False

    >>> deeplyEqualWithFuzz([1,2,[3,4,[5],6],7], (1,2,(3,4,(5,),6),7))
    True

    >>> deeplyEqualWithFuzz([1,2,[3,4,[5],6],7], (1,2,(3,4,(5,9),6),7))
    False

    >>> deeplyEqualWithFuzz(0, 0.005)
    False

    >>> deeplyEqualWithFuzz(1, 1.005)
    False

    >>> deeplyEqualWithFuzz(1.0, 1.005)
    True

    >>> deeplyEqualWithFuzz(1.0, 1.005, fuzz=0.004)
    False

    >>> deeplyEqualWithFuzz(Thing(one=1), Thing(two=2))
    False

    >>> deeplyEqualWithFuzz(Thing(one=1, two=2), Thing(two=2, one=1))
    True

    >>> deeplyEqualWithFuzz(Thing(one=1, two=2), Thing(two=2, one=3))
    False

    >>> deeplyEqualWithFuzz(Thing(one=1, foo=range(3)), Thing(one=1, foo=[0,1,2]))
    True

    >>> deeplyEqualWithFuzz(Thing(one=1, foo=[Thing(a=1), Thing(b=2)]), Thing(one=1, foo=[Thing(a=1), Thing(b=2)]))
    True

    >>> deeplyEqualWithFuzz(Thing(one=1, foo=[Thing(a=1), Thing(b=2)]), Thing(one=1, foo=[Thing(a=1), Thing(b=2), Thing(c=3)]))
    False

    >>> deeplyEqualWithFuzz(Thing(one=1, foo=[Thing(a=1), Thing(b=2)]), Thing(one=1, foo=[Thing(b=2), Thing(a=1)]))
    False

    This one is too difficult for lazy programming:
    #>>> deeplyEqualWithFuzz(Thing(one=1, foo=set([Thing(a=1), Thing(b=2)])), Thing(one=1, foo=set([Thing(b=2), Thing(a=1)])))
    True

    '''
    try:
        if hasattr(a, '__dict__') and hasattr(b, '__dict__'):
            if set(a.__dict__) != set(b.__dict__):
                a_remove_b = set(a.__dict__) - set(b.__dict__)
                b_remove_a = set(b.__dict__) - set(a.__dict__)
                raise ReturnFalse('keys not same: %s in a not b, %s in b not a'
                                  % (a_remove_b, b_remove_a))
            if not all(deeplyEqualWithFuzz(a.__dict__[k], b.__dict__[k],
                                           fuzz=fuzz, verbose=verbose)
                       for k in set(a.__dict__)):
                raise ReturnFalse('failed object dive-in keys %r' % \
                                  list(k for k in set(a.__dict__)
                                  if not deeplyEqualWithFuzz(a.__dict__[k], b.__dict__[k],
                                                             fuzz=fuzz, verbose=verbose)))
            else:
                raise ReturnTrue
        if hasattr(a, '__iter__') and hasattr(b, '__iter__'):
            if all(deeplyEqualWithFuzz(ta, tb, fuzz=fuzz, verbose=verbose)
                   for ta, tb in izip_longest(a, b)):
                raise ReturnTrue
            else:
                raise ReturnFalse('iter fail')
        if isinstance(a, float) and isinstance(b, float):
            #print(".", end='')
            t = bool(a) + bool(b)
            #print(t, end='')
            if t == 1:
                raise ReturnFalse('floats one is zero: a=%f, b=%f' % (a, b))
            if t == 0:
                raise ReturnTrue
            if abs((a - b) / min(a, b)) > fuzz:
                raise ReturnFalse('floats exceed fuzz: a=%f, b=%f' % (a, b))
            else:
                raise ReturnTrue
        if a != b:
            raise ReturnFalse('compare unequal: a=%r, b=%r' % (a, b))
        else:
            raise ReturnTrue
    except ReturnFalse as e:
        if verbose:
            print(e)
            assert False
        return False
    except ReturnTrue as e:
        return True


class primeTestCase(unittest.TestCase):

    def xxx__init__(self):
        unittest.TestCase.__init__(self)
        self.fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")
        seq_data = self.fqdb.get_sequence_data_entire_scaffold("Scaffold578")
        self.whole_sequence = seq_data['sequence']
        self.whole_quality = seq_data['quality']

    def use_sequence_from_scaffold(self, scaffold):
        self.d = fqdb.get_sequence_data_entire_scaffold(scaffold)
        self.prime.whole_sequence = self.d['sequence']
        self.prime.whole_quality = self.d['quality']

    def setUp(self):
        self.maker = PrimerMaker()
        self.maker.useSimulatedBindings = True
        self.prime = Prime(minimum_primer_span=800,
                           target_primer_span=2000,
                           maximum_primer_span=4000,
                           minimum_overlap=1000,
                           fuzz=500,
                           primer_windows=[ [ 43520, 44020 ],
                                            [ 44222, 48383 ],
                                            [ 48647, 49591 ],
                                            [ 49731, 53349 ],
                                            [ 53410, 53845 ],
                                            [ 53909, 54483 ],
                                            [ 54653, 57711 ],
                                            [ 58315, 59919 ] ],

                           excluded_spans=[ [ 44020, 44222 ],
                                            [ 48383, 48647 ],
                                            [ 49591, 49731 ],
                                            [ 53349, 53410 ],
                                            [ 53845, 53909 ],
                                            [ 54483, 54653 ],
                                            [ 57711, 58315 ] ])
        self.use_sequence_from_scaffold('Scaffold578')
        self.maker.config_for(self.prime)

    def tearDown(self):
        pass


    def test0_hot_MakePrimers(self):
        # The "hot" test is the one currently the focus of development.
        # Once settled it is moved down the numbered list
        # IndexError priming SPU_000439
        s = '{"minimum_primer_span":100,"target_primer_span":2000,"maximum_primer_span":4000,"minimum_overlap":1000,"fuzz":500,"excluded_spans":[[44020,44222],[48383,48647],[49591,49731],[53349,53410],[53845,53909],[54483,54653],[57711,58315]],"primer_windows":[[39020,44020],[44222,48383],[48647,49591],[49731,53349],[53410,53845],[53909,54483],[54653,57711],[58315,64419]],"scaffold":"Scaffold578"}'
        pd = json.loads(s)
        scaffold = pd['scaffold']
#        self.prime.__dict__.update(pd)
#        self.use_sequence_from_scaffold(scaffold)

        d = fqdb.get_sequence_data_entire_scaffold(scaffold)
        whole_sequence = d['sequence']
        whole_quality = d['quality']

        sim_maker = PrimerMaker()
        sim_maker.useSimulatedBindings = True
        bind_maker = PrimerMaker()
        bind_maker.useSimulatedBindings = False
        simp = Prime(**pd)
        binp = Prime(**pd)
        for prime in (simp, binp):
            prime.whole_sequence = whole_sequence
            prime.whole_quality = whole_quality
        sim_maker.config_for(simp) # separate but equal
        bind_maker.config_for(binp)
        #self.maker.input_log = open('primer3_core_input.log', 'w')
        #self.maker.output_log = open('primer3_core_output.log', 'w')
	#self.maker.err_log = open('primer3_core_err.log', 'w')
	for sim_ppp, bind_ppp in izip_longest(sim_maker, bind_maker):
            self.assert_ppp_basics(sim_ppp)
            self.assert_ppp_basics(bind_ppp)
            for ppp in (sim_ppp, bind_ppp):
                for k in set(['',
                              'primer_product_size_range',
                              'sequence_template_length',
                              'sequence_excluded_region',
                              'primer_explain_flag',
                              'sequence_primer_pair_ok_region_list',
                              'sequence_quality_length',
                              'primer_thermodynamic_parameters_path']) \
                    | set(filter(lambda k: k.endswith('explain'), ppp.__dict__)):
                    if hasattr(ppp, k):
                        #FIXME: some of these should actually appear
                        del(ppp.__dict__[k])
                if hasattr(ppp, 'primer_pairs'):
                    for pp in ppp.primer_pairs:
                        for k in filter(lambda k: k.endswith('explain'), pp.__dict__):
                            del(pp.__dict__[k])
            assert deeplyEqualWithFuzz(sim_ppp, bind_ppp, fuzz=0.1, verbose=True)

    def xtest0_hot_MakePrimers(self):
        # The "hot" test is the one currently the focus of development.
        # Once settled it is moved down the numbered list
        # IndexError priming SPU_000439
        self.use_sequence_from_scaffold('Scaffold107')
        self.prime.primer_windows = [ [ 246264, 251264 ],
                                      [ 251339, 268059 ],
                                      [ 268234, 268527 ],
                                      [ 269473, 269821 ],
                                      [ 269978, 274921 ],
                                      [ 275028, 275583 ],
                                      [ 275679, 284966 ] ]

        self.prime.excluded_spans = [ [ 251264, 251339 ],
                                      [ 268059, 268234 ],
                                      [ 268527, 269473 ],
                                      [ 269821, 269978 ],
                                      [ 274921, 275028 ],
                                      [ 275583, 275679 ] ]

        self.maker.config_for(self.prime)
        self.maker.input_log = open('primer3_core_input.log', 'w')
        self.maker.output_log = open('primer3_core_output.log', 'w')
        self.maker.err_log = open('primer3_core_err.log', 'w')
        for ppp in self.maker:
            self.assert_ppp_basics(ppp)


    def assert_ppp_list_basics(self, ppp_list):
        return all(self.assert_ppp_basics(ppp) for ppp in ppp_list)

    def assert_ppp_basics(self, ppp):
        try:
            assert isinstance(ppp, PrimerPairPossibilities), "expected PrimerPairPossibilities"
            assert not hasattr(ppp, 'primer_error'), ppp.primer_error
            assert len(ppp.primer_pairs) == ppp.primer_pair_num_returned 
            assert all(isinstance(pp, PrimerPair) for pp in ppp.primer_pairs)
            assert all(set(['compl_any_th',
                            'compl_end_th',
                            'left',
                            'num_returned',
                            'penalty',
                            'product_size',
                            'right']) - set(dir(pp)) == set()
                       for pp in ppp.primer_pairs)

            assert all(isinstance(x, Primer)
                       for pp in ppp.primer_pairs
                       for x in (pp.left, pp.right))

            assert all(set(['end_stability',
                            #'explain',
                            'gc_percent',
                            'min_seq_quality',
                            'num_returned',
                            'penalty',
                            'pos_len',
                            #'self_any_th',
                            #'self_end_th',
                            #'self_hairpin_th',
                            'sequence',
                            'tm']) - set(dir(x)) == set()
                       for pp in ppp.primer_pairs
                       for x in (pp.left, pp.right))


            # DEBUG
            t = list((primer.span, excluded_span, compare_spans(primer.span, excluded_span))
                     for pp in ppp.primer_pairs
                     for primer in (pp.left, pp.right)
                     for excluded_span in self.prime.excluded_spans)

            for pp in ppp.primer_pairs:
                for primer in (pp.left, pp.right):
                    for excluded_span in self.prime.excluded_spans:
                        assert compare_spans(primer.span, excluded_span) in ['<<<<', '>>>>', '<<=<'], \
"primer %s span %r intersects excluded span %r; ok regions %r excluded region %r" % \
                            (primer.sequence,
                             primer.span,
                             excluded_span,
                             ppp.sequence_primer_pair_ok_region_list,
                             ppp.sequence_excluded_region)
        except AssertionError:
            raise
        else:
            return True

    def test1_IntervalsToPrime(self):
        self.prime.primer_windows = [ [ 1, 100 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.intervals_to_prime())
        assert t == [ ]

    def test2_IntervalsToPrime(self):
        self.prime.primer_windows = [ [ 1000, 3000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.intervals_to_prime())
        assert t == [ [ 1000, 3000 ] ]

    def test3_IntervalsToPrime(self):
        self.prime.primer_windows = [ [ 1000, 4000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.intervals_to_prime())
        assert t == [ [ 1000, 3000], [ 2000, 4000 ] ]

    def test4_IntervalsToPrime(self):
        self.prime.primer_windows = [ [ 1000, 5000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.intervals_to_prime())
        assert t == [ [ 1000, 3000 ],
                      [ 2000, 4000 ],
                      [ 3000, 5000 ] ]

    # Note the leading 'x' in the test name below - that x'es it out of the
    # set of tests that get run. Easy to delete the x and thereby include it
    def xtest5_IntervalsToPrime(self):
        self.prime.primer_windows = [ [ 43520, 44020 ],
                                      [ 44222, 48383 ],
                                      [ 48647, 49591 ],
                                      [ 49731, 53349 ],
                                      [ 53410, 53845 ],
                                      [ 53909, 54483 ],
                                      [ 54653, 57711 ],
                                      [ 58315, 59919 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.intervals_to_prime())
        assert t == "TBD"

    def xtest6_MakePrimers(self):
        self.maker.input_log = open('primer3_core_input.log', 'w')
        self.maker.output_log = open('primer3_core_output.log', 'w')
        self.maker.err_log = open('primer3_core_err.log', 'w')
        for ppp in self.maker:
            self.assert_ppp_basics(ppp)

    def xtest7_MakePrimers(self):
        # blowup at GGTGGTGGTAGTCGAGAGGA:
        # SEQUENCE_PRIMER_PAIR_OK_REGION_LIST=46328,500,47881,500
        def just():
            yield [ 46328, 47881+500 ]

        self.prime.primer_windows = [ [ 44222, 48383 ] ]
        self.maker.config_for(self.prime)
        self.maker.intervals_to_prime = just # Monkey-patch
        self.maker.input_log = open('primer3_core_input.log', 'w')
        self.maker.output_log = open('primer3_core_output.log', 'w')
        self.maker.err_log = open('primer3_core_err.log', 'w')
        for ppp in self.maker:
            self.assert_ppp_basics(ppp)

    def test8_MakePrimers(self):
        # blowup at GGTGGTGGTAGTCGAGAGGA:
        # SEQUENCE_PRIMER_PAIR_OK_REGION_LIST=46328,500,47881,500
        bot = 44000
        def just_this_interval():
            yield [ 46328-bot, 47881+500-bot ]

        self.prime.whole_sequence = self.d['sequence'][bot:49000]
        self.prime.whole_quality = self.d['quality'][bot:49000]
        self.prime.primer_windows = [ [ 44222-bot, 48383-bot ] ]
        self.prime.excluded_spans=[ [ 48383-bot, 48647-bot ] ]
        self.maker.config_for(self.prime)
        self.maker.intervals_to_prime = just_this_interval # Monkey-patch
        self.maker.input_log = open('primer3_core_input.log', 'w')
        self.maker.output_log = open('primer3_core_output.log', 'w')
        self.maker.err_log = open('primer3_core_err.log', 'w')
        for ppp in self.maker:
            self.assert_ppp_basics(ppp)


def main():
    unittest.main()

if __name__ == '__main__':
    main()
