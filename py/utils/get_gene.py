from __future__ import print_function

import argparse
import sys
import gffutils

class GDB(object):
    def __init__(self, dbname, filename=None, forceCreate=False):
        if filename != None:
            print('Creating database...')
            self.db = gffutils.create_db(filename, dbfn=dbname, force=forceCreate, keep_order=False, merge_strategy='merge')
            print('Database created.')
        else:
            self.db = gffutils.FeatureDB(dbname)
        self.name_to_id = dict((v['Name'][0], v['ID'][0]) for v in self.db.features_of_type('gene'))
        

    def get_gene(self, geneName):
        return self.db[self.name_to_id[geneName]]

    def get_location(self, geneName):
        gene = self.get_gene(geneName)
        scaffold = gene.seqid
        return {'Name':geneName, 'scaffold':scaffold, 'start':gene.start, 'end':gene.end}
    
    def get_exons(self, geneName):
        gene = self.get_gene(geneName)
        exons = self.db.children(gene, featuretype='exon')
        return {'Name':geneName, 'exons':dict((x.id, [x.start, x.end]) for x in exons)}


def main(argv):
    from pprint import pprint
    import sys
    parser = argparse.ArgumentParser(description='Find data from a gff3 file about specific genes.')
    parser.add_argument('-f', '--force', action='store_true', default=False, help='Force create a database with the name specified by the database argument. Overwrites any existing files with the same name.')
    parser.add_argument('database', type=str, help='Database file to use. Will be created if nonexistant and if a .gff3 file is specified')
    parser.add_argument('-g', '--gff3_file', type=str, nargs=1, default=[None], help='Specify a .gff3 file to use as the template for database creation.')
    parser.add_argument('-e', '--exons', action='store_true', default=False, help='Display exon information about a gene')
    parser.add_argument('gene', type=str, nargs='?', default=None, help='A gene name to find out more about')

    args = parser.parse_args()
    db = GDB(args.database, args.gff3_file[0], args.force)
    if args.gene:
        if args.exons:
            pprint(db.get_exons(args.gene))
            sys.exit()
        pprint(db.get_location(args.gene))


    
if __name__ == '__main__':
    main(sys.argv)
