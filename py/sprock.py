import os.path

import cherrypy


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

    @cherrypy.expose
    def whatzup(self):
        return "good\n"

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def data(self):
        #curl -i -X POST -H "Content-Type: application/json" -d '{"key":"val", "N":5}' 'http://localhost:8082/data'
        return {'foo': 'bar',
                'count': range(cherrypy.request.json['N']),
                'request data': cherrypy.request.json
                }


class DataService(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


def serve(g):
    from collections import defaultdict

    # Set up site-wide config first so we get a log if errors occur.
    cherrypy.config.update({#'environment': 'production',
                            'log.access_file': 'access.log',
                            'log.error_file': 'errors.log',
                            'log.screen': True})

    global_config = {'server.socket_host': '0.0.0.0',
                     'server.socket_port': 8082,
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
                     'engine.autoreload.on': True
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
                   'tools.staticdir.root': os.path.abspath(os.getcwd()),
                   'tools.staticdir.dir': '../app',
                   #'tools.mako.collection_size': 500,
                   #'tools.mako.directories':  "mako/templates",
                   'response.timeout': 86400
                   }
                  }
    app = HelloWorld(g=g)#, config=app_config)
    cherrypy.tree.mount(app, '/', app_config)

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

