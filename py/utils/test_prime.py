import unittest, prime

from get_sequence import FQDB

fqdb = FQDB("data/Spur_3.1.LinearScaffold.fq")
d = fqdb.get_sequence_data('Scaffold1', 0, 50000)
pdata = prime.Prime()
pdata.set_up_to_prime()
pdata.whole_sequence = d['sequence']
pdata.whole_quality = d['quality']
pdata.primer_windows = [[1337, 9001], [14493, 23757]]
pdata.minimum_overlap = 1000
pdata.maximum_primer_span = 4000
pdata.target_primer_span = 2000
pdata.fuzz = 500
pmake = prime.PrimerMaker()
pmake.config_for(pdata)


class primeTestCase(unittest.TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def testSplitIntervals(self):
        self.split_interval = pmake.split_interval()
        assert [x for x in pmake.split_interval()] == [[6837, 8837], [7769, 9769], [8701, 10701], [9633, 11633], [10565, 12565], [11497, 13497], [21993, 23993], [22887, 24887], [23781, 25781], [24675, 26675], [25569, 27569], [26463, 28463], [27357, 29357], [28251, 30251]]
        
    def testMakePrimers(self):
        #primers = [x for x in pmake]
        #assert primers == 'kittens'
        return False

        

def main():
    unittest.main()

if __name__ == '__main__':
    main()
