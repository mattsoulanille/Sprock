
class Prime(object):
    def __init__(self):
        pass

    def set_up_to_prime(self, gene_name, margin):
        # UI causes this to be called
        # calcs & retrievals, then:
        self.whole_sequence =
        self.whole_quality =
        self.minimum_overlap = integer
        self.maximum_primer_span = integer
        self.target_primer_span = integer
        self.primer_windows =  [(start1, end1), (start2, end2), ...]
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
    def __init__(self, setup_info):
        #get set up, do expensive things once

    def config_for(self, prime):
        # Do what you need to absorb the particulars
        self.prime = prime

    def __iter__(self):
        # set up to make the primers
        return self             # or whatever the primer iterator is

    def next(self):
        # return the next primer pair (if you're the iterator)
        if no_more_primer_pairs_to_provide:
            raise StopIteration
