from itertools import chain, groupby
from math import ceil, floor
from pprint import pprint       # DEBUGGING

import primer3

class Prime(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class Primer(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
        try:
            self.start, self.length = map(int, self.pos_len.split(','))
        except AttributeError:
            pass


class PrimerPair(object):
    """A pair of primers as produced by primer3"""
    def __init__(self, d, **kwargs):
        self.d = d
        self.__dict__.update(kwargs)

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
    """From the output of primer3, create a list of PrimerPair objects"""
    def __init__(self, primer3_design, **kwargs):
        self.__dict__.update(kwargs)
        self.primer3_design = primer3_design
        self.primer_pair_numbers = sorted(set(v[2] for v in (k.split('_') \
                                                             for k in primer3_design.keys()) \
                                              if len(v) >= 3 and v[2].isdigit()))
        def primer_rank(s):
            """Return the part of a primer3 return value key that
            is the rank order of the primer pair to which it pertains"""
            v = s.split('_')
            if len(v) >= 3 and v[2].isdigit():
                return int(v[2])
            else:
                return -1

        grouped_keys = list((k, set(g)) for k,g in \
                            groupby(sorted(primer3_design.keys(), key=primer_rank), primer_rank))
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
    >>> pm = PrimerMaker()
    >>> pm.config_for(prime)
    >>> t0 = time.time()
    >>> for primer_pair in pm:
    ...   print("Got primer_pair %r" % (time.time() - t0, primer_pair)
    """
    def __init__(self):
        self.seq_args = dict()
        self.global_args = dict()
        self.input_log = self.output_log = self.err_log = None

    def config_for(self, prime):
        # Do what you need to absorb the particulars
        self.prime = prime
        return self
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
        
    def intervals_to_prime(self):
        """ Generates the intervals for which we want primer pairs
        """
        for window in self.prime.primer_windows:
            window_length = window[1] - window[0]
            if window_length < self.prime.minimum_primer_span: # FIXME: necessary?
                continue
            if window_length < self.prime.maximum_primer_span:
                #FIXME: match target span better if possible
                yield window
            else:
                l_overlap = self.prime.minimum_overlap
                n = int(ceil((window_length - l_overlap) \
                                  / (self.prime.target_primer_span - l_overlap)))
                l_interval = int(ceil((window_length - l_overlap) / n \
                             + self.prime.minimum_overlap))
                # FIXME: distribute the fractional part
                left = window[0]
                right = min(left + l_interval, window[1])
                while right < window[1]:
                    yield [left, right]
                    left = max(right - l_overlap, window[0])
                    right = min(left + l_interval, window[1])
                yield [left, right]

    def make_primers(self):
        # See http://primer3.sourceforge.net/primer3_manual.htm
        # A must-read on the inputs:
        # http://greengenes.lbl.gov/cgi-bin/primer3/primer3_www_OTU_specific_help.cgi
        self.seq_args['SEQUENCE_TEMPLATE'] = self.prime.whole_sequence
        self.seq_args['SEQUENCE_QUALITY'] =  self.prime.whole_quality

        for target in self.intervals_to_prime():
            length = target[1] - target[0]
            self.seq_args['PRIMER_PRODUCT_SIZE_RANGE'] = [[length, length + self.prime.fuzz]]
            self.seq_args['SEQUENCE_TARGET'] = [target[0], length]

            primers = primer3.simulatedBindings.designPrimers(
                self.seq_args, self.global_args,
                input_log=self.input_log,
                output_log=self.output_log)

            yield PrimerPairPossibilities(primers)

