import unittest

from get_sequence import FQDB
from prime import Prime, PrimerMaker



fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")
d = fqdb.get_sequence_data('Scaffold1', 0, 50000)
prime = Prime()
prime.set_up_to_prime()
prime.whole_sequence = d['sequence']
prime.whole_quality = d['quality']
prime.primer_windows = [[1337, 9001], [14493, 23757]]
prime.minimum_overlap = 1000
prime.maximum_primer_span = 4000
prime.target_primer_span = 2000
prime.fuzz = 500


class primeTestCase(unittest.TestCase):

    def setUp(self):
        self.maker = PrimerMaker()
        self.maker.config_for(prime)

    def tearDown(self):
        pass

    def testSplitIntervals(self):
        assert [x for x in self.maker.split_interval()] == \
            [[1837, 3837], [2885, 4885], [3933, 5933], [4981, 6981], \
             [6029, 8029], [7077, 9077], [8125, 10125], [14993, 16993], \
             [16075, 18075], [17157, 19157], [18239, 20239], [19321, 21321], \
             [20403, 22403], [21485, 23485], [22567, 24567], [23649, 25649]]
        
    def testMakePrimers(self):
        primers = [x for x in self.maker]
        assert primers == 'kittens'
        return False


def main():
    unittest.main()

if __name__ == '__main__':
    main()
