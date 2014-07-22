from __future__ import print_function
from get_sequence import FQDB
from get_features import get_features
import primer3, sys, argparse
from Bio import SeqIO
import pdb
import copy


class get_primers(object):
    def __init__(self, start, end, scaffold):
        self.start = start
        self.end = end
        self.scaffold = scaffold
        self.seq_args = {}

    def runPrimer3(self, seq, qual=None): # seq is a string and qual is a list
        seq_args = dict()
        seq_args['SEQUENCE_TEMPLATE'] = seq
        if qual:
            seq_args['SEQUENCE_QUALITY'] = qual
        return primer3.wrappers.designPrimers(seq_args)

    @classmethod
    def splitInterval(self, start, stop, primerSpan=2000, overlap=700):
        """
        Make an interval for splitting the sequence into ones smaller than or equal to the primerSpan. Overlap determines the minimum number of base pairs overlapped for each overlap.
        """

        end = primerSpan - 1 + start
        interval = [[start, end]]
        while end <= stop: # brute force :P If you know a prettier way, feel free to change it
            start = end - overlap
            end = start + primerSpan
            interval += [[start, end]]
        interval[-1][-1] = (stop -1)
        return interval

    def makePrimers(self, sequence, interval, fuzziness=500, cb=None): 
        """
        Iterate over a biopython sequence object and make primers for it.
        fuzziness is how larger (in base pairs) than the target sequence the primer product can be.
        """
        included_region = [[x[0], x[1] - x[0]] for x in interval]
        self.seq_args['SEQUENCE_TEMPLATE'] = str(sequence.seq)
        qualList = sequence.letter_annotations["phred_quality"]
        qual = ' '.join([str(x) for x in qualList])
        self.seq_args['SEQUENCE_QUALITY'] = qual
        output = []
        
        for target in included_region:
            self.seq_args['PRIMER_PRODUCT_SIZE_RANGE'] = str(target[1]) + '-' + str(target[1] + fuzziness)
            self.seq_args['SEQUENCE_TARGET'] = "%d,%d" % (target[0], target[1])
            #pdb.set_trace() # Debug
            primers = primer3.wrappers.designPrimers(self.seq_args)
            yield primers #self.seq_args
            # cb and cb(target)
            # pdb.set_trace() # Debug


    def filterInterval(self, interval, database, lower_bound_extension=200, upper_bound_extension=200, featuretype="exon", scaffold=None):
        scaffold = scaffold or self.scaffold
        start = interval[0][0] - lower_bound_extension
        if start < 0:
            start = 0
        end = interval[-1][-1] + upper_bound_extension
        self.features = get_features(database)
        featurelist = self.features.featuregen(scaffold, start, end, featuretype, False)
        filteredInterval = filter(lambda x: reduce(lambda t, p: t == p == True, map(lambda f: (x[1] < (f.start - lower_bound_extension)) or (x[0] > (f.end + upper_bound_extension)), featurelist)), interval)
        #pdb.set_trace() # Debug
        return filteredInterval

            



def main(argv):


    def csv_to_int_list(string):
        return [int(x) for x in string.split(',')]
    from pprint import pprint
    parser = argparse.ArgumentParser(description='Front end to the python primer3 bindings.')
    #    feature = parser.add_mutually_exclusive_group()
    # parser.add_argument('--product_size', type=str, default=None, help='a csv formatted list for the size of the prduct produced by the primers. ex: use [100, 400] for primer products of length 100-400', nargs='?')
    parser.add_argument('-o', '--overlap', type=int, default=1000, help='Sequence overlap in base pairs')
    parser.add_argument('-f', '--fuzziness', type=int, default=300, help='Primer choice area in base pairs')
    parser.add_argument('--seq_file', type=str, help='The path to a fq file to grab sequence data from')
    parser.add_argument('--scaffold', type=str, default='Scaffold1', nargs='?', help='Specify a scaffold to find sequence data from.')
    parser.add_argument('--start', type=int, default=0, nargs='?', help='Start sequence from here')
    parser.add_argument('--end', type=int, default=50000, nargs='?', help='End sequence here')
    parser.add_argument('--length', type=int, default=2000, help='Primer product minimum length')
    parser.add_argument('--featuredb', type=str, help='A gffutils feature database')
    #parser.add_argument('--quality', action='store_true', default=False, help='Use qual data in primer calculation. Probably won\'t work')
    
    
    args = parser.parse_args()
    prime = get_primers(args.start, args.end, args.scaffold)
    fqdb = FQDB(args.seq_file)
    sequence = fqdb.get_seq_object(args.scaffold, args.start, args.end)
    interval = prime.splitInterval(args.start, args.end, args.length, args.overlap)
    finterval = prime.filterInterval(interval, args.featuredb)
    for primer in prime.makePrimers(sequence, finterval, args.fuzziness):
        print(primer)
    """
    if args.product_size:
        global_variables['PRIMER_PRODUCT_SIZE_RANGE'] = csv_to_int_list(args.product_size)
    if args.quality:
        args.quality = csv_to_int_list(args.quality)
    """


if __name__ == '__main__':
    main(sys.argv)
