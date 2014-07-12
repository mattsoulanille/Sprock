from get_gene import GeneDB, GFFDB
from get_sequence import FQDB
import primer3, sys, argparse
from Bio import SeqIO


class makePrimers(object):
    def __init__(self):
        placeholder = 'hello'
    def runPrimer3(self, seq, qual=None): # seq is a string and qual is a list
        seq_args = dict()
        seq_args['SEQUENCE_TEMPLATE'] = seq
        if qual:
            seq_args['SEQUENCE_QUALITY'] = qual

        global_args = dict()
        return primer3.designPrimers(seq_args, global_args)






def main(argv):
    from pprint import pprint
    parser = argparse.ArgumentParser(description='Front end to the python primer3 bindings.')
#    feature = parser.add_mutually_exclusive_group()
    parser.add_argument('-s', '--sequence', type=str, help='A string of sequence data')
    parser.add_argument('-q', '--quality', type=list, help='A python formatted list of sequence quality data', default=None, nargs='?')
    args = parser.parse_args()
    prime = makePrimers()
    pprint(prime.runPrimer3(args.sequence, args.quality))

if __name__ == '__main__':
    main(sys.argv)
