import unittest
from itertools import chain

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
                           target_primer_span=2000,
                           maximum_primer_span=4000,
                           minimum_overlap=1000,
                           fuzz=500)
#        self.maker.config_for(prime)

    def tearDown(self):
        pass

    def test1_SplitIntervals(self):
        self.prime.primer_windows = [ [ 1, 100 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.split_interval())
        assert t == [ [ 1, 100 ] ]
        
    def test2_SplitIntervals(self):
        self.prime.primer_windows = [ [ 1000, 3000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.split_interval())
        assert t == [ [ 1000, 3000 ] ]

    def test3_SplitIntervals(self):
        self.prime.primer_windows = [ [ 1000, 4000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.split_interval())
        assert t == [ [ 1000, 4000 ] ]

    def test4_SplitIntervals(self):
        self.prime.primer_windows = [ [ 1000, 5000 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.split_interval())
        assert t == [ [ 1000, 3000 ],
                      [ 2000, 4000 ],
                      [ 3000, 5000 ] ]

    def test5_SplitIntervals(self):
        self.prime.primer_windows = [ [ 43520, 44020 ],
                                      [ 44222, 48383 ],
                                      [ 48647, 49591 ],
                                      [ 49731, 53349 ],
                                      [ 53410, 53845 ],
                                      [ 53909, 54483 ],
                                      [ 54653, 57711 ],
                                      [ 58315, 59919 ] ]
        self.maker.config_for(self.prime)
        t = list(self.maker.split_interval())
        assert t == "TBD" # The expected result is yet to be determined

    # Note the leading 'x' in the test name below - that x'es it out of the
    # set of tests that get run. Easy to delete the x and thereby include it
    def xtestMakePrimers(self):
        primers = [x for x in self.maker]
        assert len(primers) == 14
        assert all(isinstance(x, PrimerPairPossibilities) for x in primers)

        assert all(len(ppp.primer_pairs) == 5 for ppp in primers)
        assert all(map(lambda x: isinstance(x, PrimerPair),
                   chain.from_iterable(ppp.primer_pairs for ppp in primers)))
        assert all(map(lambda x: set(['left',
                                      'num_returned',
                                      'penalty',
                                      'product_size',
                                      'right']) - set(dir(x)) == set(),
                   chain.from_iterable(ppp.primer_pairs for ppp in primers)))
        assert all(map(lambda x: isinstance(x, Primer),
                       chain.from_iterable((pp.left, pp.right)
                                           for ppp in primers
                                           for pp in ppp.primer_pairs)))
        assert all(map(lambda x: set(['end_stability',
                                      'gc_percent',
                                      'hairpin_th',
                                      'length',
                                      'min_seq_quality',
                                      'num_returned',
                                      'penalty',
                                      'pos_len',
                                      'self_any_th',
                                      'self_end_th',
                                      'sequence',
                                      'start',
                                      'tm']) - set(dir(x)) == set(),
                       chain.from_iterable((pp.left, pp.right)
                                           for ppp in primers
                                           for pp in ppp.primer_pairs)))

#        assert False            # to drop into pdb with --pdb switch to noestests


def main():
    unittest.main()

if __name__ == '__main__':
    main()
