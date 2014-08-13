import os
import os.path
import time

import cherrypy

from utils.get_sequence import FQDB # FIXME: names
from utils.get_gene import GeneDB


# An object to hold things
class Thing(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


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
    def getSeq(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"scaffold":"Scaffold12345", "start":67, "end":89}' 'http://localhost:8082/data/getSeq'
        argd = cherrypy.request.json
        scaffold = argd['scaffold']
        start = int(argd['start'])
        end = int(argd['end'])
        seq_data = self.fqdb.get_sequence_data(scaffold, start, end)
        seq_data['scaffold'] = scaffold
        seq_data['start'] = start
        seq_data['end'] = end
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
        return ({ 'request': argd,
                  'results': self.gene_db.get_tree_data_by_name(name) })


    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def getFeatures(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"scaffold":"Scaffold1", "start":0, "end":18000}' 'http://localhost:8082/data/getFeatures'
        argd = cherrypy.request.json
        scaffold = argd['scaffold']
        start = int(argd['start'])
        end = int(argd['end'])
        features = self.gene_db.get_features_data_by_interval(scaffold, start, end)
        return {
            'request': argd,
            'results': { 'scaffold': scaffold, 'start': start, 'end': end, 'features': features },
            'notes': ['"span" is with respect to the scaffold, not the start of the requested range']
        }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def test1(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"n":5, "interval":1.2}' 'http://localhost:8082/data/test1'
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
    def test2(self):
        #curl -s -i -X POST -H "Content-Type: application/json" -d '{"from":2}' 'http://localhost:8082/data/test2'
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



def serve(g):
    # Set up site-wide config first so we get a log if errors occur.
    cherrypy.config.update({#'environment': 'production',
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
                  {'environment': 'development', # error traces to the browser, etc
                   'tools.auth_basic.on': False,
                   'tools.auth_basic.realm': 'earth',
                   'tools.auth_basic.checkpassword': checkpassword,
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
    return g

def main():
    g = create_global_state_object()
    serve(g)

if __name__ == '__main__':
    main()

