import base64
import hashlib
import random
import time
import itertools

hasher = hashlib.md5()

def sixteen_byte_hash(s):
    """Return a byte string that's a hashed function of the supplied data.
    """
    h = hasher.copy()
    h.update(s)
    return h.digest()

def urlsafe_hash_from_sixteen_byte_hash(s):
    return base64.urlsafe_b64encode(s)[:22]

def urlsafe_hash(s):
    """Return a string, usable in a URL, that's a hashed function of the
    supplied data.

    >>> urlsafe_hash("The quick brown fox")
    'ogBPN3MLlEVnCnOPoPye5Q'
    """
    return urlsafe_hash_from_sixteen_byte_hash(sixteen_byte_hash(s))

def time_rand_str():
    """Return a unique string that starts with a timestamp.

    Handy for creating filenames and URLs that will not collide,
    and for which it is useful to know the time of creation, e.g. for
    reaping old ones.
    """
    return str(int(time.time())) + '_' + urlsafe_hash(str(random.random()))

def compare_spans(a, b):
    """Compares two spans, and returns a 4-char code

    It should recognize span completely below span:
    >>> compare_spans([-3,7], [9,12])
    '<<<<'

    It should recognize span completely above span:
    >>> compare_spans( [9,12], [-3,7])
    '>>>>'

    It should recognize span completely within span:
    >>> compare_spans([-3,12], [7,9])
    '<<>>'

    It should recognize span completely surrounding span:
    >>> compare_spans([7,9], [-3,12])
    '><><'

    It should recognize span equal to span:
    >>> compare_spans([-3,12], [-3, 12])
    '=<>='

    It should recognize span overlapping span from below:
    >>> compare_spans([-3,7], [5,9])
    '<<><'

    It should recognize span overlapping span from above:
    >>> compare_spans([5,9], [-3,7])
    '><>>'

    It should recognize span left-contiguous with span:
    >>> compare_spans([5,9], [9,12])
    '<<=<'

    It should recognize span right-contiguous with span:
    >>> compare_spans([9, 12], [5,9])
    '>=>>'

    It should recognize span that is left partial of span:
    >>> compare_spans([3,5], [3,7])
    '=<><'

    It should recognize span that is right partial of span:
    >>> compare_spans([5,7], [3,7])
    '><>='

    The Javascript is:
    a_start = a[0]
    a_end = a[1]
    b_start = b[0]
    b_end = b[1]
    rv = a_start < b_start ? '<' : a_start > b_start ? '>' : '='
    rv += a_start < b_end ? '<' : a_start > b_end ? '>' : '='
    rv += a_end < b_start ? '<' : a_end > b_start ? '>' : '='
    rv += a_end < b_end ? '<' : a_end > b_end ? '>' : '='
    return rv

    """
    return ''.join('<' if t[0] < t[1] else '>' if t[0] > t[1] else '='
                   for t in itertools.product(a,b))


def _test():
    import doctest
    doctest.testmod()

if __name__ == "__main__":
    _test()
