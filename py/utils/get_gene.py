from __future__ import print_function

import argparse
import sys
import gffutils

class GFFDB(object):
    """A .gff database using gffutils.

    gffutils uses SQLite, which is not threadsafe. We create a
    gffutils.FeatureDB every time as a workaround.
    """

    def __init__(self, dbname):
        self.dbname = dbname

    def create_from(self, filename, forceCreate=False):
        gffutils.create_db(filename,
                           dbfn=self.dbname,
                           force=forceCreate,
                           keep_order=False,
                           merge_strategy='merge')
    def open(self):
        return self.db()        # Convenience

    def name_to_ID_dict(self):
        return dict((v['Name'][0], v['ID'][0]) for v in self.db().features_of_type('gene'))

    def db(self):
        return gffutils.FeatureDB(self.dbname)


class GeneDB(object):
    def __init__(self, gffdb):
#        self.db = gffdb.gimme_the_db() # FIXME: Ugly
#        self.name_to_id = dict((v['Name'][0], v['ID'][0]) for v in self.db.features_of_type('gene'))
        self.gffdb = gffdb
        
    def get_gene(self, geneID):
        return self.gffdb.db()[geneID]

    def get_location(self, geneID):
        gene = self.get_gene(geneID)
        scaffold = gene.seqid
        return {'ID':geneID, 'scaffold':scaffold, 'start':gene.start, 'end':gene.end}
    
    def get_exons(self, geneID):
        gene = self.get_gene(geneID)
        exons = self.gffdb.db().children(gene, featuretype='exon')
        return {'ID':geneID, 'exons':dict((x.id, [x.start, x.end]) for x in exons)}


def main(argv):
    from pprint import pprint
    import sys
    parser = argparse.ArgumentParser(description='Find data from a gff3 file about specific genes.')
    parser.add_argument('-f', '--force', action='store_true', default=False,
                        help='Force create a database with the filename specified by the database argument. Overwrites any existing files with the same name.')
    parser.add_argument('database', type=str,
                        help='Database file to use. Will be created if nonexistent and if a .gff3 file is specified')
    parser.add_argument('-g', '--gff3_file', type=str, nargs=1, default=[None],
                        help='Specify a .gff3 file to use as the template for database creation.')
    parser.add_argument('-e', '--exons', action='store_true', default=False,
                        help='Display exon information about a gene')
    parser.add_argument('gene', type=str, nargs='?', default=None,
                        help='A gene name to find out more about')

    args = parser.parse_args()
    #OLD db = GFFDB(args.database, args.gff3_file[0], args.force)

    # in steps for debugging:
    gffdb = GFFDB(args.database)
    gffdb.open()
    db = GeneDB(gffdb)

    if args.gene:
        gene_ID = gffdb.name_to_ID_dict()[args.gene]
        if args.exons:
            pprint(db.get_exons(gene_ID))
            sys.exit()
        pprint(db.get_location(gene_ID))


if __name__ == '__main__':
    main(sys.argv)


