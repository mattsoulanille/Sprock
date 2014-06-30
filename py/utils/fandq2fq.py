# Convert a pair of FASTA & QUAL files into a FASTQ file
from __future__ import print_function

import argparse
import sys

from Bio import SeqIO
from Bio.SeqIO.QualityIO import PairedFastaQualIterator

def main(argv):
    parser = argparse.ArgumentParser(description='Convert a FASTA and QUAL pair of files into a FASQ file')
    parser.add_argument('fasta_filename',
                        help='the FASTA format input file path')
    parser.add_argument('qual_filename',
                        help='the QUAL format input file path')
    parser.add_argument('-q', action='store_true',
                        help="run quietly")
    parser.add_argument('-d', action='store_true',
                        help="print diagnostics to stderr")
    parser.add_argument('-z','--gzip', action='store_true',
                       help='')
    parser.add_argument('-p', '--profile', action='store_true',
                        help="profile this execution")
    parser.add_argument('-o', '--output',
                        default=sys.stdout, type=argparse.FileType('w'),
                        help='the output FASTQ file path')
    args = parser.parse_args()

    global debug_flag
    debug_flag = args.d

    debug_flag and sys.stderr.write("%r\n" % args)

    if args.profile:
        import yappi # https://code.google.com/p/yappi/wiki/apiyappi
        yappi.start(builtins=True)

    if args.gzip:
        import gzip
        fasta = gzip.open(args.fasta_filename)
        qual = gzip.open(args.qual_filename)
        outf = gzip.GzipFile(fileobj=args.output, mode='wb')
    else:
        fasta = open(args.fasta_filename)
        qual = open(args.qual_filename)
        outf = args.output


    records = PairedFastaQualIterator(fasta, qual)
    count = SeqIO.write(records, outf, "fastq")
    outf.close()

    if args.profile:
        yappi.get_thread_stats().print_all(sys.stderr)
        yappi.get_func_stats().sort("subtime").print_all(sys.stderr)

    print("Converted %i records" % count)

if __name__ == '__main__':
    main(sys.argv)

