
def main():
    s = r"""
.qual%d {
  color: %s;
}"""
    for q in xrange(21,91):
        worth = ((q - 20)*15-1)/(90-20)
        c = 'dcba98765432100'[worth]
        color_string = '#%s%s%s' % (c, c, c)
        print(s % (q, color_string))

if __name__ == '__main__':
    main()
