import unittest

from get_sequence import FQDB

fastq_name = 'data/Spur_3.1.LinearScaffold.fq'

class GetSequenceTestCase(unittest.TestCase):
    def setUp(self):
        self.db = FQDB(fastq_name)

    def tearDown(self):
        self.db = None

    def testGetSequenceDatq(self):
        seq = self.db.get_sequence_data('Scaffold1', 1, 23)
        assert seq == {'quality': [35, 35, 35, 32, 35, 53, 47, 41, 42, 46, 45, 29, 29, 29, 32, 33, 51, 51, 51, 51, 51, 51],
                       'sequence': 'ACATTTTATCACCAGTTCGATT',
                       'span': [1, 23]}

    def testGetSequenceDatq2(self):
        seq = self.db.get_sequence_data('Scaffold1', 2, 34)
        assert seq == {'quality': [35, 35, 32, 35, 53, 47, 41, 42, 46, 45,
                                   29, 29, 29, 32, 33, 51, 51, 51, 51, 51, 51, 46,
                                   46, 46, 46, 40, 40, 40, 44, 44, 39, 32],
                       'sequence': 'CATTTTATCACCAGTTCGATTTTCCCCTTGTT',
                       'span': [2, 34]}

def main():
    unittest.main()

if __name__ == '__main__':
    main()
