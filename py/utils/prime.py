from itertools import chain, groupby
from math import ceil, floor
from pprint import pprint       # DEUGGING

import primer3

class Prime(object):
    def __init__(self):
        pass

    def set_up_to_prime(self):
        # UI causes this to be called
        # calcs & retrievals, then:
        
        self.whole_sequence = str()
        self.whole_quality = str()
        self.minimum_overlap = int()
        self.maximum_primer_span = int()
        self.target_primer_span = int()
        self.primer_windows =  list()
        self.fuzz = int()
        # then primer maker gets called with this Prime object
        # it retrieves what data it needs


class Primer(object):
    def __init__(self, **args):
        self.__dict__.update(args)
        try:
            self.start, self.length = map(int, self.pos_len.split(','))
        except AttributeError:
            pass

class PrimerPair(object):
    def __init__(self, d, **args):
        self.d = d
        self.__dict__.update(args)

        splits = set((tuple(k.split('_')), k) for k in d.keys())
        splits_having_ppn = set(t for t in splits if len(t[0]) >=3 and t[0][2].isdigit())
        splits_without_ppn = splits - splits_having_ppn
        t2 = set(t[0][2] for t in splits_having_ppn)
        assert len(t2) == 1, "should be just one primer-pair number"
        ppns = t2.pop()
        splits_that_had_ppn = set((tuple(chain(t[:2], t[3:])), k) \
                                  for t, k in splits_having_ppn)
        splits_n = splits_that_had_ppn | splits_without_ppn
        primer_splits = set((t[1:], k) for t, k in splits_n if t[0] == 'PRIMER')
        left_primer_splits = set((t[1:], k) for t, k in primer_splits if t[0] == 'LEFT')
        right_primer_splits = set((t[1:], k) for t, k in primer_splits if t[0] == 'RIGHT')
        pair_primer_splits = set((t[1:], k) for t, k in primer_splits if t[0] == 'PAIR')

        def key_from(t):
            rv = '_'.join(map(lambda s: s.lower(), t))
            rv = rv or 'pos_len' # hack fixup
            return rv

        left_primer_key_map = [(key_from(t), k) for t,k in left_primer_splits]
        right_primer_key_map = [(key_from(t), k) for t,k in right_primer_splits]
        pair_primer_key_map = [(key_from(t), k) for t,k in pair_primer_splits]

        self.left = Primer(**dict((child_key, d[k]) \
                                         for child_key, k in left_primer_key_map))
        self.right = Primer(**dict((child_key, d[k]) \
                                         for child_key, k in right_primer_key_map))
        self.__dict__.update(**dict((child_key, d[k]) \
                                         for child_key, k in pair_primer_key_map))
        

class PrimerPairPossibilities(object):
    def __init__(self, primer3_design, **args):
        self.__dict__.update(args)
        self.primer3_design = primer3_design
        self.primer_pair_numbers = sorted(set(v[2] for v in (k.split('_') \
                                                             for k in primer3_design.keys()) \
                                              if len(v) >= 3 and v[2].isdigit()))
        def f1(s):
            v = s.split('_')
            if len(v) >= 3 and v[2].isdigit():
                return int(v[2])
            else:
                return -1

        grouped_keys = list((k, set(g)) for k,g in \
                            groupby(sorted(primer3_design.keys(), key=f1), f1))
        if grouped_keys[0][0] == -1:
            unnumbered_keys = grouped_keys.pop(0)[1]
        else:
            unnumbered_keys = set()

        self.primer_pairs = list(PrimerPair(dict((k, primer3_design[k]) \
                                                 for k in kst[1].union(unnumbered_keys)))
                                 for kst in grouped_keys)

        self.__dict__.update(dict((k.lower(), primer3_design[k]) \
                                  for k in unnumbered_keys))
        

class PrimerMaker(object):
    """Make primers for a Prime object

    Operates as an iterator. Typical use like:
    >>> prime = Prime()
    >>> prime.set_up_to_prime('SPU_008174', 30000) # UI does this
    >>> pm = PrimerMaker()
    >>> pm.config_for(prime)
    >>> t0 = time.time()
    >>> for primer_pair in pm:
    ...   print("Got primer_pair %r" % (time.time() - t0, primer_pair)
    """
    def __init__(self):
        self.seq_args = dict()

    def config_for(self, prime):
        # Do what you need to absorb the particulars
        self.prime = prime
#        self.seq_args['SEQUENCE_TEMPLATE'] = prime_object.whole_sequence
#        self.seq_args['SEQUENCE_QUALITY'] = ' '.join([str(x) for x in prime_object.whole_quality])

    def __iter__(self):
        # set up to make the primers
        #return self.make_primers(self.prime) # or whatever the primer iterator is
        return self.make_primers()

    def next(self):
        # return the next primer pair (if you're the iterator)
        #return self.primer_iterator.next()
        pass
        
    def split_interval(self):
        for window in self.prime.primer_windows:
            window_length = (window[1] - window[0]) - self.prime.fuzz * 2
            start = window[0] + self.prime.fuzz
            iterstart = start
            stop = window[1] - self.prime.fuzz
            end = self.prime.target_primer_span + start 
            interval = [[start, end]]
            while end < stop: # brute force :P If you know a prettier way, feel free to change it
                iterstart = end - self.prime.minimum_overlap
                end = iterstart + self.prime.target_primer_span
                interval += [[iterstart, end]]
            interval[-1][-1] = (stop)
            number_of_intervals = len(interval)

            overlap = int(ceil(float(self.prime.target_primer_span * number_of_intervals - window_length) / (float(number_of_intervals) - 1)))
            progress = (self.prime.target_primer_span - overlap)
            #assert False
            for x in range(0, number_of_intervals):
                yield [x*progress + start, x*progress + self.prime.target_primer_span + start]

    def make_primers(self):
        self.seq_args['SEQUENCE_TEMPLATE'] = self.prime.whole_sequence
        self.seq_args['SEQUENCE_QUALITY'] = ' '.join([str(x) for x in self.prime.whole_quality])

        for target in self.split_interval():
            length = target[1] - target[0]
            self.seq_args['PRIMER_PRODUCT_SIZE_RANGE'] = str(length) + '-' + str(length + self.prime.fuzz)
            self.seq_args['SEQUENCE_TARGET'] = str(target[0]) + ',' + str(length)
            
            primers = primer3.wrappers.designPrimers(self.seq_args)
            del primers['SEQUENCE_QUALITY']
            del primers['SEQUENCE_TEMPLATE']

            yield PrimerPairPossibilities(primers)
