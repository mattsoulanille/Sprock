import unittest
from get_sequence import FQDB
from get_primers import get_primers
from get_gene import GeneDB
import primer3, sys, argparse
from Bio import SeqIO


gff_name = 'data/GLEAN-UTR-3.1.db'
sequence_name = 'data/Spur_3.1.LinearScaffold.fq'
prime = get_primers(4000, 50000, 'Scaffold1')
fqdb = FQDB(sequence_name)
primers = open('py/utils/test_data/get_primers_test_data.txt', 'r')

class GetGeneTestCase(unittest.TestCase):
    def setUp(self):
        self.prime = prime
        self.gff_name = gff_name
        self.interval = [[4000, 6000], [5000, 7000], [6000, 8000], [7000, 9000], [8000, 10000], [9000, 11000], [10000, 12000], [11000, 13000], [12000, 14000], [13000, 15000], [14000, 16000], [15000, 17000], [16000, 18000], [17000, 19000], [18000, 20000], [19000, 21000], [20000, 22000], [21000, 23000], [22000, 24000], [23000, 25000], [24000, 26000], [25000, 27000], [26000, 28000], [27000, 29000], [28000, 30000], [29000, 31000], [30000, 32000], [31000, 33000], [32000, 34000], [33000, 35000], [34000, 36000], [35000, 37000], [36000, 38000], [37000, 39000], [38000, 40000], [39000, 41000], [40000, 42000], [41000, 43000], [42000, 44000], [43000, 45000], [44000, 46000], [45000, 47000], [46000, 48000], [47000, 49000], [48000, 50000]]
        self.finterval = [[4000, 6000], [5000, 7000], [6000, 8000], [7000, 9000], [8000, 10000], [9000, 11000], [10000, 12000], [19000, 21000], [20000, 22000], [21000, 23000], [22000, 24000], [23000, 25000], [24000, 26000], [25000, 27000], [26000, 28000], [33000, 35000], [34000, 36000], [35000, 37000], [36000, 38000], [37000, 39000], [38000, 40000], [39000, 41000], [40000, 42000], [41000, 43000], [42000, 44000], [43000, 45000], [44000, 46000], [45000, 47000], [46000, 48000], [47000, 49000], [48000, 50000]]
        self.primers = primers
        self.seq = fqdb.get_seq_object('Scaffold1', 4000, 50000)
    def tearDown(self):
        self.prime = None

    def testsplitInterval(self):
        split = self.prime.splitInterval(4000, 50000, 2000, 1000)
        assert split == self.interval

    def testfilterInterval(self):
        filtered = self.prime.filterInterval(self.interval, self.gff_name)
        assert filtered == self.finterval

    def testmakePrimers(self):
        testprimers = self.prime.makePrimers(self.seq, self.finterval, 500)
        assert reduce(lambda a, b: a == b == True, map(lambda x: x == self.primers.next(), testprimers))



def main():
    unittest.main()

if __name__ == '__main__':
    main()
