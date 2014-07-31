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
        #assert [x for x in pmake.split_interval()] == [[1837, 3837], [2885, 4885], [3933, 5933], [4981, 6981], [6029, 8029], [7077, 9077], [8125, 10125], [14993, 16993], [16075, 18075], [17157, 19157], [18239, 20239], [19321, 21321], [20403, 22403], [21485, 23485], [22567, 24567], [23649, 25649]]
        
    def testMakePrimers(self):
        primers = [x for x in pmake]
        assert primers == 'kittens'
        return False

        

def main():
    unittest.main()

if __name__ == '__main__':
    main()
