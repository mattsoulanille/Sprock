import unittest

from get_gene import GeneDB

gff_name = '/Users/soul/Projects/Bioinformatics/Echinobase/derived_data/GLEAN-UTR-3.1.db'
db = GeneDB(gff_name)

class GetGeneTestCase(unittest.TestCase):
    def setUp(self):
        self.db = db

    def tearDown(self):
        self.db = None

    def testId(self):
        gene_ID = self.db.id('SPU_022066')
        assert gene_ID == 'SPU_022066gn'

    def testGetLocationDataByID(self):
        loc = self.db.get_location_data_by_ID('SPU_022066gn')
        assert loc == {'ID': 'SPU_022066gn', 'end': 18337, 'scaffold': 'Scaffold694', 'start': 10480}

    def testGetLocationDataByName(self):
        loc = self.db.get_location_data_by_name('SPU_022066')
        assert loc == {'ID': 'SPU_022066gn', 'end': 18337, 'scaffold': 'Scaffold694', 'start': 10480}

    def testGetExonsDataByName(self):
        exons = self.db.get_exons_data_by_name('SPU_022066')
        assert exons == {'ID': 'SPU_022066gn',
                         'exons': {'SPU_022066:5"': [14180, 14538],
                                   'SPU_022066:6"': [17988, 18337],
                                   'SPU_022066:0"': [10514, 10683],
                                   'SPU_022066:1"': [11406, 11633],
                                   'SPU_022066:2"': [11875, 11997],
                                   'SPU_022066:3"': [12713, 12826],
                                   'SPU_022066:4"': [13329, 13541]}}
def main():
    unittest.main()

if __name__ == '__main__':
    main()
