import unittest

from get_gene import GeneDB

gff_name = 'data/GLEAN-UTR-3.1.db'
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

    def testGetFeaturesDataByInterval(self):
        data = db.get_features_data_by_interval('Scaffold1', 0, 50000, featureType='transcript')
        assert data == [{'span': (28271, 32294), 'type': 'transcript', 'id': 'SPU_001114-tr', 'strand': '+'},
                        {'span': (13028, 18195), 'type': 'transcript', 'id': 'SPU_016802-tr', 'strand': '-'}]
        data = db.get_features_data_by_interval('Scaffold1', 0, 50000, featureType='gene')
        assert data == [{'span': (28271, 32294), 'type': 'gene', 'id': 'SPU_001114gn', 'strand': '+'},
                        {'span': (13028, 18195), 'type': 'gene', 'id': 'SPU_016802gn', 'strand': '-'}]
        data = db.get_features_data_by_interval('Scaffold1', 0, 50000)
        assert data == [{'span': (28271, 32294), 'type': 'gene', 'id': 'SPU_001114gn', 'strand': '+'},
                        {'span': (28271, 32294), 'type': 'transcript', 'id': 'SPU_001114-tr', 'strand': '+'},
                        {'span': (28271, 28616), 'type': 'exon', 'id': 'SPU_001114:0', 'strand': '+'},
                        {'span': (28905, 29027), 'type': 'exon', 'id': 'SPU_001114:1', 'strand': '+'},
                        {'span': (30064, 30272), 'type': 'exon', 'id': 'SPU_001114:2', 'strand': '+'},
                        {'span': (32106, 32294), 'type': 'exon', 'id': 'SPU_001114:3', 'strand': '+'},
                        {'span': (13028, 18195), 'type': 'gene', 'id': 'SPU_016802gn', 'strand': '-'},
                        {'span': (13028, 18195), 'type': 'transcript', 'id': 'SPU_016802-tr', 'strand': '-'},
                        {'span': (18163, 18195), 'type': 'exon', 'id': 'SPU_016802:0', 'strand': '-'},
                        {'span': (15818, 16028), 'type': 'exon', 'id': 'SPU_016802:1', 'strand': '-'},
                        {'span': (15263, 15412), 'type': 'exon', 'id': 'SPU_016802:2', 'strand': '-'},
                        {'span': (13880, 13989), 'type': 'exon', 'id': 'SPU_016802:3', 'strand': '-'},
                        {'span': (13028, 13193), 'type': 'exon', 'id': 'SPU_016802:4', 'strand': '-'}]


    def testGetTreeDataByName(self):
        data = db.get_tree_data_by_name('SPU_022066')
        assert data == {'span': (10480, 18337), 'name': 'SPU_022066', 'scaffold': 'Scaffold694', 'type': 'gene', 'children':
                        [{'span': (0, 7857), 'name': 'Sp-Shmt2_1', 'scaffold': 'Scaffold694', 'type': 'transcript', 'children':
                          [{'span': (0, 33), 'name': 'SPU_022066_3UTR:0"', 'scaffold': 'Scaffold694',
                            'type': 'three_prime_UTR', 'children': [], 'strand': '-'},
                           {'span': (34, 203), 'name': 'SPU_022066:0"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (926, 1153), 'name': 'SPU_022066:1"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (1395, 1517), 'name': 'SPU_022066:2"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (2233, 2346), 'name': 'SPU_022066:3"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (2849, 3061), 'name': 'SPU_022066:4"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (3700, 4058), 'name': 'SPU_022066:5"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'},
                           {'span': (7508, 7857), 'name': 'SPU_022066:6"', 'scaffold': 'Scaffold694',
                            'type': 'exon', 'children': [], 'strand': '-'}],
                          'strand': '-'}],
                        'strand': '-'}

def main():
    unittest.main()

if __name__ == '__main__':
    main()
