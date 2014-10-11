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
#            self.start, self.length = map(int, self.pos_len.split(','))
            self.start, self.length = self.pos_len
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
        self.left.span = (self.left.start, self.left.start + self.left.length)

        self.right = Primer(**dict((child_key, d[k]) \
                                         for child_key, k in right_primer_key_map))
        self.right.span = (self.right.start - self.right.length + 1, self.right.start + 1)
        self.__dict__.update(**dict((child_key, d[k]) \
                                         for child_key, k in pair_primer_key_map))
        

class PrimerPairPossibilities(object):
    """From the output of primer3, create a list of PrimerPair objects"""
    def __init__(self, primer3_design, **kwargs):
        self.__dict__.update(kwargs)
        p3d = dict((k,v) for k,v in primer3_design.items() \
                   if k not in ['SEQUENCE_QUALITY',
                                'SEQUENCE_TEMPLATE'])
        self.primer_pair_numbers = sorted(set(v[2] for v in (k.split('_') \
                                                             for k in p3d.keys()) \
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
                            groupby(sorted(p3d.keys(), key=primer_rank), primer_rank))
        if grouped_keys[0][0] == -1:
            unnumbered_keys = grouped_keys.pop(0)[1]
        else:
            unnumbered_keys = set()

        self.primer_pairs = list(PrimerPair(dict((k, p3d[k]) \
                                                 for k in kst[1].union(unnumbered_keys)))
                                 for kst in grouped_keys)

        self.__dict__.update(dict((k.lower(), p3d[k]) \
                                  for k in unnumbered_keys))
        try:
            self.sequence_quality_length = len(primer3_design['SEQUENCE_QUALITY'])
        except KeyError:
            pass
        try:
            self.sequence_template_length = len(primer3_design['SEQUENCE_TEMPLATE'])
        except KeyError:
            pass
        

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
    
    def was_intervals_to_prime(self):
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


    def intervals_to_prime(self):
        from math import floor
        for window in self.prime.primer_windows:
            smin = self.prime.minimum_primer_span
            srec = self.prime.target_primer_span
            if window[1] - window[0] >= smin:
                if window[1] - window[0] <= srec:
                    yield [window[0], window[1]]
                    
                else:
                    over = self.prime.minimum_overlap
                    final_term = int(floor((window[1] - (window[0] + srec)) / (srec - over))) # The number of the final term
                    terms = final_term + 1 # the number of intervals that will be returned
                    s = int((window[1] - window[0] + (float(over))*final_term) / (final_term + 1)) # see notes here "https://drive.google.com/a/soulanille.net/folderview?id=0BxQJBFe9xq7hNlVNaFIwTFpJREU&usp=drive_web"
                    interval_to_prime = [[window[0] + n*s - (over) * n, \
                                          window[0] + (n+1)*s - (over) * n] \
                                         for n in range(terms)]
                    interval_to_prime[-1][-1] = window[1]
                    for x in interval_to_prime:
                        yield x



    def make_primers(self):
        # See http://primer3.sourceforge.net/primer3_manual.htm
        # A must-read on the inputs:
        # http://greengenes.lbl.gov/cgi-bin/primer3/primer3_www_OTU_specific_help.cgi
        #self.seq_args['SEQUENCE_TEMPLATE'] = self.prime.whole_sequence[:100000] # DEBUG
        #self.seq_args['SEQUENCE_QUALITY'] = self.prime.whole_quality[:100000] # DEBUG
        self.seq_args['SEQUENCE_TEMPLATE'] = self.prime.whole_sequence
        self.seq_args['SEQUENCE_QUALITY'] = self.prime.whole_quality
        self.global_args['PRIMER_EXPLAIN_FLAG'] = 1
        try:
            self.seq_args['SEQUENCE_EXCLUDED_REGION'] \
                = [(v[0], v[1]-v[0]) for v in self.prime.excluded_spans]
        except AttributeError:
            pass

        for target in self.intervals_to_prime():
            #length = target[1] - target[0]
            #self.seq_args['PRIMER_PRODUCT_SIZE_RANGE'] = [[length, length + self.prime.fuzz]]
            #self.seq_args['SEQUENCE_TARGET'] = [target[0], length]

            #The left primer must be in the region specified by <left_start>,<left_length>
            #and the right primer must be in the region specified by <right_start>,<right_length>.
            self.seq_args['SEQUENCE_PRIMER_PAIR_OK_REGION_LIST'] \
                = [target[0], self.prime.fuzz,
                   target[1] - self.prime.fuzz, self.prime.fuzz]

            self.seq_args['PRIMER_PRODUCT_SIZE_RANGE'] \
                = (target[1] - target[0] - 2*self.prime.fuzz,
                   target[1]-target[0])

            primers = primer3.simulatedbindings.designPrimers(
                self.seq_args, self.global_args,
                input_log=self.input_log,
                output_log=self.output_log)

            yield PrimerPairPossibilities(primers)

