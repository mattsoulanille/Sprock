
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
        
    def flush_existing_primers(self):
        # clear out the recorded primers if any
        # primer maker calls this, and maybe sometimes UI


    def here_is_a_primer_pair(self, primer_pair):
        # record, invoke callbacks, etc
        # primer maker calls this with results one at a time

    def all_primed(self):
        # notify there's no more


class PrimerMaker(object):
    def make_primers_according_to(self, some_Prime_object_you_get_passed):
        for primer_pair in gimmie_primers(some_Prime):
            some_Prime.here_is_a_primer_pair(primer_pair
