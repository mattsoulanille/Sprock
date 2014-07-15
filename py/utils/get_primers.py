from get_gene import GeneDB, GFFDB
from get_sequence import FQDB
import primer3, sys, argparse
from Bio import SeqIO

# Make it so you can chunk along a long sequence and make smaller, overlapping sequences to plug into the primer maker. 
class makePrimers(object):
    def __init__(self):
        placeholder = 'hello'

    def runPrimer3(self, seq, qual=None, global_args=dict()): # seq is a string and qual is a list
        seq_args = dict()
        seq_args['SEQUENCE_TEMPLATE'] = seq
        if qual:
            seq_args['SEQUENCE_QUALITY'] = qual
        return primer3.designPrimers(seq_args, global_args)

    @classmethod
    def splitSequence(self, sequence, primerSpan=2000, overlap=0.20):
        """
        Split the sequence into ones smaller than or equal to the primerSpan, Takes a biopython sequence object. Overlap determines the target % overlap and is a float from 0-1.
        """
        start = 0
        end = primerSpan - 1
        interval = [[start, end]]
        while end <= len(sequence): # brute force :P If you know a prettier way, feel free to change it
            start = end - int(float(primerSpan) * overlap / 2.0)
            end = start + primerSpan
            interval += [[start, end]]
        interval[-1][-1] = (len(sequence) -1)
        seqInterval = [sequence[x[0]:x[1]] for x in interval]
        return [interval, seqInterval]
    





def main(argv):
    def csv_to_int_list(string):
        return [int(x) for x in string.split(',')]
    from pprint import pprint
    parser = argparse.ArgumentParser(description='Front end to the python primer3 bindings.')
#    feature = parser.add_mutually_exclusive_group()
    parser.add_argument('-s', '--sequence', type=str, help='A string of sequence data')
    parser.add_argument('-q', '--quality', type=str, help='A csv formatted list of sequence quality data', default=None, nargs='?')
    parser.add_argument('--product_size', type=str, default=None, help='a csv formatted list for the size of the prduct produced by the primers. ex: use [100, 400] for primer products of length 100-400', nargs='?')

    args = parser.parse_args()
    prime = makePrimers()
    global_variables = dict()
    if args.product_size:
        global_variables['PRIMER_PRODUCT_SIZE_RANGE'] = csv_to_int_list(args.product_size)
    if args.quality:
        args.quality = csv_to_int_list(args.quality)

    pprint(prime.runPrimer3(args.sequence, args.quality, global_variables))

if __name__ == '__main__':
    main(sys.argv)
