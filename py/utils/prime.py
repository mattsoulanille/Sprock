import primer3
from math import ceil

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
        return self.primer_iterator.next()
        
        
    def split_interval(self):
        for window in self.prime.primer_windows:
            window_length = window[1] - window[0] - self.prime.fuzz * 2
            start = window[0] + self.prime.fuzz
            number_of_intervals = int(ceil(float(window_length - self.prime.target_primer_span)/float(self.prime.target_primer_span - self.prime.minimum_overlap)))
            overlap = (self.prime.target_primer_span - window_length / number_of_intervals)
            
            progress = (self.prime.target_primer_span - overlap)
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





            yield primers
