from Bio import SeqIO
import primer3
from Bio.Alphabet import IUPAC
import argparse
parser = argparse.ArgumentParser(description='Show a primer3 bug')
parser.add_argument('fastq', type=str, help='A fastq file to search through')
parser.add_argument('scaffold', type=int, help='The number of a Scaffold', default=1)
parser.add_argument('start', type=int, help='Coordinate to start at.', default=0)
parser.add_argument('end', type=int, help='Coordinate to end at.', default=2000)
parser.add_argument('-q', action='store_true', help='include quality', default=False)
parser.add_argument('-t', action='store_true', help='require primers to enclose the region 3000-3100', default=False)
parser.add_argument('flag', type=str, nargs='?', help='add flags to the sequence arguments.')
args=parser.parse_args()
fastqfile = args.fastq

db = SeqIO.index(fastqfile, 'fastq', alphabet=IUPAC.ambiguous_dna)
scaffold = 'Scaffold' + str(args.scaffold)
record = db[scaffold][args.start:args.end]
sequence = str(record.seq)
qualList = record.letter_annotations["phred_quality"]
qual = ' '.join([str(x) for x in qualList]) # It is unclear as to whether primer3 wants quality values in list format or in str format.
seq_args = dict()
seq_args['SEQUENCE_TEMPLATE'] = sequence
seq_args['SEQUENCE_QUALITY'] = qualList
seq_only = dict()
seq_only['SEQUENCE_TEMPLATE'] = sequence
if args.t:
    seq_only['SEQUENCE_TARGET'] = [3000, 100]
    seq_args['SEQUENCE_TARGET'] = [3000, 100]
if args.q:
    print(seq_args)
    print(primer3.designPrimers(seq_args))
else:
    print(seq_only)
    print(primer3.designPrimers(seq_only))


