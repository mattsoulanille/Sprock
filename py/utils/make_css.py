import pdb

def main():
    s = r"""
.q%d {
  color: %s;
}"""

# [0..90] -> [lightest..0]

    lightest = 234;
    scale = float(lightest - 0) / (0 - 90)
    for q in xrange(0,91):
        c = int((q - 0) * scale + lightest)
        color_string = '#%.2x%.2x%.2x' % (c, c, c)
        print(s % (q, color_string))

if __name__ == '__main__':
    main()
