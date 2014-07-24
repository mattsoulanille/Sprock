#!/usr/bin/env python
# pretend to be priemr3_core, for debugging
import sys


def main(argv):
    with open('fake_primer3_core_got_on_command_line.dat', 'wb') as argvf:
        argvf.write(' '.join(argv))
    received = sys.stdin.read()
    with open('fake_primer3_core_got_on_stdin.dat', 'wb') as outf:
        outf.write(received)


if __name__ == '__main__':
    main(sys.argv)
