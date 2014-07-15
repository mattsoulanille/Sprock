from __future__ import print_function

import argparse
import sys
import gffutils
import get_gene

class get_features(object):
    
    def __init__(self, databasePath):
        self.database = get_gene.GFFDB(databasePath)
    def open(self):
        return self.database.open()
    def featuregen(self, scaffold, start, end, featureType=None, completely_within=False): # featureType of None means all features are included. Returns a list
        self.features = self.open().region((scaffold, start, end), featureType, completely_within)
        self.featurelist = [x for x in self.features]
        return self.featurelist
    def info(self):
        try: tmplist = self.featurelist
        except: raise Exception('self.featurelist is undefined. run featuregen first to define it.') #fixme
        return [[x['Name'][0], x['ID'][0], x.start, x.end] for x in self.featurelist]


def main(argv):
    from pprint import pprint
    import sys
    parser = argparse.ArgumentParser(description='Find data from a gff3 file about specific genes.')

    parser.add_argument('database_path', type=str, help='A path to a gffutils feature database (make this using the get_gene.py program)')
    parser.add_argument('scaffold', type=int, help='The number of a scaffold to search through. eg "Scaffold423" would be "423".')
    parser.add_argument('start', type=int, help='Where to start searching for features on the scaffold. The range is zero based. eg if the scaffold had 5 bases, they would start at 0 and end at 4.')
    parser.add_argument('end', type=int, help='Where to stop searching for features on the scaffold.')
    parser.add_argument('-t', '--feature_type', nargs='?', default=None, help='Filter search based on feature type')
    parser.add_argument('-w', '--completely_within', action='store_true', default=False, help='Only return features that are completely within the defined region')
    args = parser.parse_args()
    
    
    features = get_features(args.database_path)
    scaffold = 'Scaffold' + str(args.scaffold)
    features.featuregen(scaffold, args.start, args.end, args.feature_type, args.completely_within)
    pprint(features.info())


    # in steps for debugging:

if __name__ == '__main__':
    main(sys.argv)


