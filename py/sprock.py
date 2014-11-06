import functools
import json
import os
import os.path
import time

from traceback import format_exc

import cherrypy

from utils.get_sequence import FQDB # FIXME: names
from utils.get_gene import GeneDB
from utils.prime import Prime, PrimerMaker, Primer, PrimerPair, PrimerPairPossibilities
from utils.various_utils import time_rand_str


# An object to hold things
class Thing(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

def liberal_json_handler(*args, **kwargs):
    # Takes liberties in JSON serialization to make more things serialize
    def jsonable(v):
        if hasattr(v, '__dict__'):
            return v.__dict__
        if isinstance(v, set):
            return list(v)
        return v

    value = cherrypy.serving.request._json_inner_handler(*args, **kwargs)
    return json.dumps(value, default=jsonable)

class HelloWorld(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

    @cherrypy.expose
    def index(self):
        return "Hello world!"

class DataService(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)
#        cherrypy.log("DataService starting")
#        cherrypy.log("sessions locking is %s " % cherrypy.config['tools.sessions.locking'])
#        cherrypy.log("Data from %s " % cherrypy.config['data.directory_path'])
        fqdb_filename = os.path.join(cherrypy.config['data.directory_path'],
                                     cherrypy.config['data.fastq_filename'])
        cherrypy.log("FASTQ %s " % fqdb_filename)
        self.fqdb = FQDB(fqdb_filename)
        self.gene_db = GeneDB(self.g.gffdb_filename)
        cherrypy.log('Building gene_db name_to_ID_dict')
        self.gene_db.name_to_ID_dict() # get this built before accepting connections

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def n(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"key":"val", "N":5}' 'http://localhost:8082/data/n'
        return {'foo': 'bar',
                'count': range(cherrypy.request.json['N']),
                'request data': cherrypy.request.json
                }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
#handler=lambda v: json.dumps(v, default=lambda o: o.__dict__))
#handler=functools.partial(json.dumps, default=lambda o: o.__dict__))
    def t1(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"a":1}' 'http://localhost:8082/data/t1'
        thing = {'foo': "bar"}
        return thing

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def t2(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"a":1}' 'http://localhost:8082/data/t2'
        thing = Thing(foo="bar", kittens=set(["Sophie", "Thor"]))
        return thing

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def getSeq(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"scaffold":"Scaffold12345", "start":67, "end":89}' 'http://localhost:8082/data/getSeq'
        argd = cherrypy.request.json
        scaffold = argd['scaffold']
        start = int(argd['start'])
        end = int(argd['end'])
        seq_data = self.fqdb.get_sequence_data(scaffold, start, end)
        seq_data['scaffold'] = scaffold
        return { 'request': argd,
                 'results': seq_data }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def getGene(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"name":"SPU_022066"}' 'http://localhost:8082/data/getGene'
        argd = cherrypy.request.json
        gene_name = argd['name']
        location = self.gene_db.get_location_data_by_name(gene_name)
        # {'ID':geneID, 'scaffold':scaffold, 'start':gene.start, 'end':gene.end}
        exons = self.gene_db.get_exons_data_by_name(gene_name)
        return { 'request': argd,
                 'results': {'name': gene_name,
                             'scaffold': location['scaffold'],
                             'start': location['start'],
                             'end':  location['end'],
                             'exons': exons
                             }
                 }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def getTree(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"name":"SPU_022066"}' 'http://localhost:8082/data/getTree'
        argd = cherrypy.request.json
        name = argd['name']
        relative_positions = 'relative_positions' in argd and argd['relative_positions']
        return ({ 'request': argd,
                  'results': self.gene_db.get_tree_data_by_name( \
                                    name, relative_positions = relative_positions)})


    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def getFeatures(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"scaffold":"Scaffold1", "start":0, "end":18000}' 'http://localhost:8082/data/getFeatures'
        argd = cherrypy.request.json
        scaffold = argd['scaffold']
        start = int(argd['start'])
        end = int(argd['end'])
        completely_within = 'completely_within' in argd and argd['completely_within']
        kwargs = 'kwargs' in argd and argd['kwargs'] or {}
        features = self.gene_db.get_features_data_by_interval(scaffold, start, end, **kwargs)
        return {
            'request': argd,
            'results': { 'scaffold': scaffold, 'start': start, 'end': end, 'features': features },
            'notes': ['"span" is with respect to the scaffold, not the start of the requested range']
        }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def make_muks(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"n":5, "interval":1.2}' 'http://localhost:8082/data/make_muks'
        argd = cherrypy.request.json
        n = argd['n']
        interval = argd['interval']

        def muk(count, t):
            for n in xrange(count):
                time.sleep(t)
                yield "muk %d" % n

        self.g.mukmuk = []
        mukmuk = self.g.mukmuk
        for s in muk(n, interval):
            mukmuk.append(s)

        return {
            'request': argd,
            'results': mukmuk
        }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def get_muks(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"from":2}' 'http://localhost:8082/data/get_muks'
        argd = cherrypy.request.json
        n = argd['from']
        if hasattr(self.g, 'mukmuk'):
            muks = self.g.mukmuk[n:]
        else:
            muks = None

        results = {
            'muks': muks
            }
        return {
            'request': argd,
            'results': results
        }


    @staticmethod
    def sleepy_range(*args):
        for i in xrange(*args):
            time.sleep(i)
            yield(i)

    @staticmethod
    def echoArgs(*args, **kwargs):
        for a in args:
            yield str(a)
        for k,v in kwargs.iteritems():
            yield "%s: %s" % (k,v)

    def primers(self, *args, **kwargs):
        p = Prime(**kwargs)
        seq_data = self.fqdb.get_sequence_data_entire_scaffold(p.scaffold)
        p.whole_sequence = seq_data['sequence']
        p.whole_quality = seq_data['quality']
        pm = PrimerMaker()
        pm.input_log = open('sprock_primer_input.log', 'a')
        pm.output_log = open('sprock_primer_output.log', 'a')
        pm.err_log = open('sprock_primer_err.log', 'a')
        pm.config_for(p)
        return pm

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def iter(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"name":"xrange", "args":[0,5,2]}' 'http://localhost:8082/data/iter'
        argd = cherrypy.request.json
        name = argd['name']
        args = 'args' in argd and argd['args'] or []
        kwargs = 'kwargs' in argd and argd['kwargs'] or {}
        sleepy_range = self.sleepy_range;
        constructors = { 'xrange': xrange,
                         'str' : str,
                         'echoArgs': self.echoArgs,
                         'sleepy_range': self.sleepy_range,
                         'primers': self.primers }
        if name in constructors:
            k = time_rand_str()
            self.g.iter_things[k] = iter(constructors[name](*args, **kwargs))
            return {'iter': k}
        else:
            raise cherrypy.HTTPError(403, "That iter is not allowed")

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def next(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"iter":"1408247325_t-Jy0k3lG7y7GmxDgB7lbg"}' 'http://localhost:8082/data/next'
        argd = cherrypy.request.json
        k = argd['iter']
        rv = {}
        try:
            rv['value'] = self.g.iter_things[k].next()
        except KeyError:
            raise cherrypy.HTTPError(404, "Iter not found")
        except StopIteration:
            rv['stop'] = True
            del self.g.iter_things[k]
            cherrypy.log("deleted iterable %s, %d remain" % (k, len(self.g.iter_things)))
        except Exception as e:
            cherrypy.log("Error in next(%s): %s" % (k, e))
            cherrypy.log(format_exc(5))
            raise cherrypy.HTTPError(500, "Something went wrong with iter")
            #del self.g.iter_things[k] # FIXME: do this, or not?
        return rv

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def destroyIterator(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"iter":"1408247325_t-Jy0k3lG7y7GmxDgB7lbg"}' 'http://localhost:8082/data/destroyIterator'
        argd = cherrypy.request.json
        k = argd['iter']
        rv = {}
        try:
            self.destroyIter(k)
        except KeyError:
            raise cherrypy.HTTPError(404, "Iter not found")
        return {
            'request': argd,
            'results': 'Done'
        }


    def destroyIter(self, key):
        del self.g.iter_things[key]
        cherrypy.log("deleted iterable %s, %d remain" % (key, len(self.g.iter_things)))



def serve(g):
    # Set up site-wide config first so we get a log if errors occur.
    cherrypy.config.update({'environment': 'production',
                            'log.access_file': 'access.log',
                            'log.error_file': 'errors.log',
                            'log.screen': True})

    global_config = {'server.socket_host': '0.0.0.0',
                     'server.socket_port': 8082,
                     #'server.thread_pool': 2, # DEBUG
                     #'server.environment': 'development',
                     'server.ssl_module': 'pyopenssl',
                     #'server.ssl_module': 'builtin',
                     #'server.ssl_certificate': os.path.join(g.cwd, 'ssl', '*.omste.com', 'star_omste_com.crt'),
                     #'server.ssl_private_key': os.path.join(g.cwd, 'ssl', '*.omste.com', 'server.m5tv6c.key'),
                     #'server.ssl_certificate_chain': os.path.join(g.cwd, 'ssl', '*.omste.com', 'cert_chain.pem'),
                     'tools.sessions.on': True,
                     'tools.sessions.timeout': 86400,
                     'tools.sessions.locking': 'explicit',
                     'tools.encode.on' : True,
                     'tools.encode.encoding' : 'utf-8',
                     'engine.autoreload.on': True,
                     'data.directory_path': 'data/',
                     'data.fastq_filename': 'Spur_3.1.LinearScaffold.fq',
                     'data.gffdb_filename': 'GLEAN-UTR-3.1.db'
                     }
    cherrypy.config.update(global_config)

    userpassdict = {'foo': 'bar', 'who': 'dat'}
    checkpassword = cherrypy.lib.auth_basic.checkpassword_dict(userpassdict)

    app_config = {'/':
                  {#'environment': 'development', # error traces to the browser, etc
                   'tools.auth_basic.on': False,
                   'tools.auth_basic.realm': 'earth',
                   'tools.auth_basic.checkpassword': checkpassword,
                   'tools.json_out.handler': liberal_json_handler,
                   'tools.staticdir.on': True,
                   'tools.staticdir.root': os.path.abspath(os.getcwd()), # FIXME: cwd is the wrong choice
                   'tools.staticdir.dir': 'app/',
                   #'tools.mako.collection_size': 500,
                   #'tools.mako.directories':  "mako/templates",
                   'response.timeout': 86400
                   }
                  }


    g.gffdb_filename = os.path.join(cherrypy.config['data.directory_path'],
                                    cherrypy.config['data.gffdb_filename'])
    cherrypy.log("gffdb path %s" % g.gffdb_filename)
#    g.gffdb = GFFDB(g.gffdb_filename)
#    g.dict_ID_from_gene_name = g.gffdb.name_to_ID_dict('gene')
#    g.dict_ID_from_transcript_name = g.gffdb.name_to_ID_dict('transcript')
#    cherrypy.log("%d gene and %d transcript names" % (len(g.dict_ID_from_gene_name), len(g.dict_ID_from_transcript_name)))

    hello_app = HelloWorld(g=g)
    cherrypy.tree.mount(hello_app, '/', app_config)
    cherrypy.tree.mount(DataService(g=g), '/data', app_config)

    cherrypy.engine.signals.subscribe()
    cherrypy.engine.start()
    cherrypy.engine.block()


def create_global_state_object():
    g = Thing()
    g.cwd = os.path.abspath(os.getcwd()),
    g.rundir = os.path.dirname(os.path.abspath(__file__))
    g.iter_things = {}
    return g

def main():
    g = create_global_state_object()
    serve(g)

if __name__ == '__main__':
    main()

