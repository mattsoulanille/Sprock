import unittest
from itertools import chain, product

from get_sequence import FQDB
from prime import Prime, PrimerMaker, Primer, PrimerPair, PrimerPairPossibilities



fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")
d = fqdb.get_sequence_data_entire_scaffold('Scaffold578')
prime = Prime()
prime.whole_sequence = d['sequence']
prime.whole_quality = d['quality']
prime.minimum_overlap = 1000
prime.maximum_primer_span = 4000
prime.target_primer_span = 2000
prime.fuzz = 500


def compare_spans(a, b):
    return ''.join('<' if t[0] < t[1] else '>' if t[0] > t[1] else '='
                   for t in product(a,b))

class primeTestCase(unittest.TestCase):

    def xxx__init__(self):
        unittest.TestCase.__init__(self)
        self.fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")
        seq_data = self.fqdb.get_sequence_data_entire_scaffold("Scaffold578")
        self.whole_sequence = seq_data['sequence']
        self.whole_quality = seq_data['quality']

    def setUp(self):
        self.maker = PrimerMaker()
        self.prime = Prime(whole_sequence=d['sequence'],
                           whole_quality=d['quality'],
                           minimum_primer_span=800,
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
        self.maker.config_for(self.prime)

    def tearDown(self):
        pass

    def test0_hot_MakePrimers(self):
        # The "hot" test is the one currently the focus of development.
        # Once settled it is moved down the numbered list
        # blowup at GGTGGTGGTAGTCGAGAGGA:
        # SEQUENCE_PRIMER_PAIR_OK_REGION_LIST=46328,500,47881,500
        def just_this_interval():
            yield [ 6328, 7881+500 ]

        self.prime.whole_sequence = d['sequence'][40000:60000]
        self.prime.whole_quality = d['quality'][40000:60000]
        self.prime.primer_windows = [ [ 4222, 8383 ] ]
        self.prime.excluded_spans=[ [ 8383, 8647 ] ]
        self.maker.config_for(self.prime)
        self.maker.intervals_to_prime = just_this_interval # Monkey-patch
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
                        assert compare_spans(primer.span, excluded_span) in ['<<<<', '>>>>'], \
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
        assert t == [ [ 1000, 4000 ] ]

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

    def xtest8_hot_MakePrimers(self):
        # blowup at GGTGGTGGTAGTCGAGAGGA:
        # SEQUENCE_PRIMER_PAIR_OK_REGION_LIST=46328,500,47881,500
        def just_this_interval():
            yield [ 46328, 47881+500 ]

        self.prime.whole_sequence = d['sequence'][:60000]
        self.prime.whole_quality = d['quality'][:60000]
        self.prime.primer_windows = [ [ 44222, 48383 ] ]
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
