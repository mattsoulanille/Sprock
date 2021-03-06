from __future__ import print_function

import argparse
import sys
import gffutils

class GeneDB(object):
    """A .gff database using gffutils.

    gffutils uses SQLite, which is not threadsafe. We create a
    gffutils.FeatureDB every time as a workaround.
    """
    def __init__(self, dbname):
        self.dbname = dbname

    def create_from(self, filename, forceCreate=False):
        """Create the gffutils sqLite db for the specified .gff file"""
        gffutils.create_db(filename,
                           dbfn=self.dbname,
                           force=forceCreate,
                           keep_order=False,
                           merge_strategy='merge')
    def db(self):
        return gffutils.FeatureDB(self.dbname)
    
    def open(self):
        return self.db()        # Convenience method

    def name_to_ID_dict(self):
        try:
            return self.name_to_ID_dict_cache
        except AttributeError:
            self.name_to_ID_dict_cache = dict((v['Name'][0], v['ID'][0]) for v in self.db().all_features())
            return self.name_to_ID_dict_cache

    def id(self, name):
        return self.name_to_ID_dict()[name]

    def get_feature_by_ID(self, ID):
        return self.db()[ID]
       
    def get_feature_by_name(self, name):
        return self.get_feature_by_ID(self.id(name))

    def get_gene_by_ID(self, geneID):
        return self.get_feature_by_ID(geneID)

    def get_gene_by_name(self, name):
        return self.get_gene_by_ID(self.id(name))

    def get_location_data_by_ID(self, ID):  
        feature = self.get_feature_by_ID(ID)
        scaffold = feature.seqid
        return {'ID':ID, 'scaffold':scaffold, 'start':feature.start, 'end':feature.end}

    def get_location_data_by_name(self, name):
        return self.get_location_data_by_ID(self.id(name))

    def get_exons_data_by_ID(self, geneID):
        gene = self.get_gene_by_ID(geneID)
        exons = self.db().children(gene, featuretype='exon')
        return {'ID':geneID, 'exons':dict((x.id, [x.start, x.end]) for x in exons)}

    def get_exons_data_by_name(self, name):
        return self.get_exons_data_by_ID(self.id(name))

    def gen_features_by_interval(self, scaffold, start, end, featureType=None, completely_within=False):
        return self.db().region((scaffold, start, end), featureType, completely_within)

    def get_features_data_by_interval(self, scaffold, start, end, featureType=None, completely_within=False):
        return [ { 'type': f.featuretype,
                   'span': (f.start, f.stop),
                   'id': f.id,
                   'strand': f.strand } for f
                 in self.gen_features_by_interval(scaffold, start, end,
                                                  featureType=featureType,
                                                  completely_within=completely_within) ]

    def get_tree_by_name(self, name):
        """returns a tree of features that are descendents of name"""
        feature = self.get_feature_by_name(name)
        return { 'feature': feature,
                 'children' :
                 map(self.get_tree_by_name,
                     (v['Name'][0] for v in self.db().children(self.id(name), 1))) }

    def get_tree_data_by_name(self, name, relative_positions=False):
        """returns a tree of data of features that are descendents of name"""
        tree = self.get_tree_by_name(name)
        def datify(d):
            for c in d['children']:
                datify(c)
            f = d['feature']
            d['name'] = f.attributes['Name'][0]
            d['type'] = f.featuretype
            d['scaffold'] = f.seqid
            d['strand'] = f.strand
            d['span'] = (f.start, f.end)
            d['feature'] = None
            del(d['feature'])
            return d

        def children_sort(d):
            d['children'].sort(key=lambda x: x['span'][0])
            for c in d['children']:
                children_sort(c)
            return d

        def children_relative_span(d, parent_start):
            start = d['span'][0]
            #print('children_relative_span(%s, %d)' % (d['name'], parent_start))
            for c in d['children']:
                children_relative_span(c, start)
            t = d['span']
            d['span'] = t[0] - parent_start, t[1] - parent_start

        rv = datify(tree)
        children_sort(rv)
        if relative_positions:
            children_relative_span(rv, 0)
        return rv


def main(argv):
    from pprint import pprint
    import sys
    parser = argparse.ArgumentParser(description='Find data from a gff3 file about specific genes.')
    feature = parser.add_mutually_exclusive_group()
    parser.add_argument('-f', '--force', action='store_true', default=False,
                        help='Force create a database with the filename specified by the database argument. Overwrites any existing files with the same name.')
    parser.add_argument('database', type=str,
                        help='Database file to use. Will be created if nonexistent and if a .gff3 file is specified')
    parser.add_argument('--gff3_file', type=str, nargs=1, default=[None],
                        help='Specify a .gff3 file to use as the template for database creation.')
    feature.add_argument('-e', '--exons', action='store_true', default=False,
                        help='Display exons of a gene')
    feature.add_argument('-g', '--gene', action='store_true',
                         help='Display information about a gene')
    feature.add_argument('-t', '--transcript', action='store_true',
                         help='Display information about a transcript')
    feature.add_argument('-x', '--exon', action='store_true',
                         help='Display information about a specific exon. Different from --exons')
    parser.add_argument('feature', type=str, nargs='?', default=None,
                        help='A feature name to find out more about')

    args = parser.parse_args()
    #OLD db = GFFDB(args.database, args.gff3_file[0], args.force)

    # WRONG, FIXME below, not adapted to refactoring:

    # in steps for debugging:
    gffdb = GFFDB(args.database)
    gffdb.open()


    if args.feature:
        if args.gene:
            db = GeneDB(gffdb)
            gene_ID = gffdb.name_to_ID_dict('gene')[args.feature]
            pprint('Gene')
            pprint(db.get_location(gene_ID))

        if args.exons:
            db = gffdb
            pprint(db.get_exons(gene_ID))
        if args.transcript:
            db = gffdb
            transcript_ID = gffdb.name_to_ID_dict('transcript')[args.feature]
            pprint('Transcript')
            pprint(db.get_location(transcript_ID))
        if args.exon:
            db = GeneDB(gffdb)
            exon_ID = gffdb.name_to_ID_dict('exon')[args.feature]
            pprint('Exon')
            pprint(db.get_location(exon_ID))

if __name__ == '__main__':
    main(sys.argv)


