from __future__ import print_function

import argparse
import sys
from Bio import SeqIO
from Bio.Alphabet import IUPAC

class FQDB(object):
    def __init__(self, filename):
        self.fastqDB = SeqIO.index(filename, 'fastq', alphabet=IUPAC.ambiguous_dna)
        self.cache = (None, None)
    
    def get_sequence(self, scaffold, start_position, end_position):
        # {'sequence': [the sequence], 'quality': [the quality]}
        if self.cache[0] == scaffold:
            record = self.cache[1]
        else:
            record = self.fastqDB[scaffold]
            self.cache = (scaffold, record)
        snippedRecord = record[start_position:end_position]
        return {'sequence': str(snippedRecord.seq), 'quality': snippedRecord.letter_annotations["phred_quality"]}
        
        

def main(argv):
    from pprint import pprint
    parser = argparse.ArgumentParser(description='Find sequence data from coordinates on a scaffold')
    parser.add_argument('fastq', type=str, help='A fastq file to search through')
    parser.add_argument('scaffold', type=int, help='The number of a Scaffold')
    parser.add_argument('start', type=int, help='Coordinate to start at.')
    parser.add_argument('end', type=int, help='Coordinate to end at.')
    args = parser.parse_args()
    db = FQDB(args.fastq)
    print(db.get_sequence(args.scaffold, args.start, args.end))

if __name__ == '__main__':
    main(sys.argv)