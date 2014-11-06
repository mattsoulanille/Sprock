from __future__ import print_function

import argparse
import sys

from Bio import SeqIO
from Bio.Alphabet import IUPAC

class FQDB(object):
    """A FASTQ database using Biopython.

    SeqIO.index_db uses SQLite, which is not threadsafe. We
    connect every time as a workaround.
    """
    def __init__(self, filename):
#DEBUG        self.fastqDB = SeqIO.index(filename, 'fastq', alphabet=IUPAC.ambiguous_dna)
# works but takes 8GB:        self.fastqDB = SeqIO.to_dict(SeqIO.parse(filename, 'fastq', alphabet=IUPAC.ambiguous_dna)) # DEBUG
# fail "SQLite objects created in a thread can only be used in that same thread."        self.fastqDB = SeqIO.index_db('t2.db', filename, 'fastq', alphabet=IUPAC.ambiguous_dna) # DEBUG
        self.filename = filename
        self.cache = (None, None)
    
    def fastqDB(self):
        return SeqIO.index_db('t2.db', self.filename, 'fastq', alphabet=IUPAC.ambiguous_dna)

    def get_sequence_data(self, scaffold, start_position, end_position):
        snippedRecord = self.get_seq_object(scaffold, start_position, end_position)
        return {'sequence': str(snippedRecord.seq),
                'quality': snippedRecord.letter_annotations["phred_quality"],
                'span': [start_position, start_position + len(snippedRecord)]}
    
    def get_sequence_data_entire_scaffold(self, scaffold):
        record = self.get_seq_object_entire_scaffold(scaffold)
        return {'sequence': str(record.seq), 'quality': record.letter_annotations["phred_quality"]}

    def get_seq_object(self, scaffold, start_position, end_position):
        if self.cache[0] == scaffold:
            record = self.cache[1]
        else:
            record = self.fastqDB()[scaffold]
            self.cache = (scaffold, record)
        return record[start_position:end_position]

    # FIXME
    def get_seq_object_entire_scaffold(self, scaffold):
        if self.cache[0] == scaffold:
            record = self.cache[1]
        else:
            record = self.fastqDB()[scaffold]
            self.cache = (scaffold, record)
        return record
    
        

def main(argv):
    from pprint import pprint
    parser = argparse.ArgumentParser(description='Find sequence data from coordinates on a scaffold')
    parser.add_argument('fastq', type=str, help='A fastq file to search through')
    parser.add_argument('scaffold', type=int, help='The number of a Scaffold')
    parser.add_argument('start', type=int, help='Coordinate to start at.')
    parser.add_argument('end', type=int, help='Coordinate to end at.')
    args = parser.parse_args()

    db = FQDB(args.fastq)
    print(db.get_sequence('Scaffold' + str(args.scaffold), args.start, args.end))

if __name__ == '__main__':
    main(sys.argv)
