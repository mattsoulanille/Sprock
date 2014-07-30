from __future__ import print_function

class BioDB(object):
    """Presents a consolidated interface to sequence and feature data
    INCOMPLETE
    """
    def __init__(self, fastqDB, geneDB):
        self.fastqDB = fastqDB
        self.geneDB = geneDB

    def get_context_by_name(self, name, margin):
        # MOCK
        gene_name = 'SPU_008174'
        gene = self.geneDB.get_gene_by_name(gene_name)
        loc_dat = self.geneDB.get_location_data_by_name(gene_name)
        scaffold = loc_dat['scaffold']
        start = max(0, loc_dat['start'] - margin)
        seq_dat = self.fastqDB.get_sequence_data(scaffold, start, loc_dat['end'] + margin)
        sequence = seq_dat['sequence']
        quality = seq_dat['quality']
        end = start + len(sequence) # could be less than the margin we wanted
        features = self.geneDB.get_features_data_by_interval(scaffold, start, end)

        return { 'name': name,
                 'margin': margin,
                 'scaffold': scaffold,
                 'span': (start, end),
                 'sequence': sequence,
                 'quality': quality,
                 'features': features }
                 
