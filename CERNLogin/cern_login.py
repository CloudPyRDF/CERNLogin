from jupyter_server.base.handlers import JupyterHandler
import json
import tornado
import pathlib
import os

home = os.getenv('HOME')

class LoginHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        pass

    @tornado.web.authenticated
    def put(self):
        pass