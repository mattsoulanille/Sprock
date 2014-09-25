import base64
import hashlib
import random
import time


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

def _test():
    import doctest
    doctest.testmod()

if __name__ == "__main__":
    _test()
