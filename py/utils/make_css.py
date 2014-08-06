import pdb

def main():
    s = r"""
.q%d {
  color: %s;
}"""

# [20..90] -> [lightest..0]

    lightest = 234;
    scale = float(lightest - 0) / (20 - 90)
    for q in xrange(20,91):
        c = int((q - 20) * scale + lightest)
        color_string = '#%x%x%x' % (c, c, c)
        print(s % (q, color_string))

if __name__ == '__main__':
    main()
