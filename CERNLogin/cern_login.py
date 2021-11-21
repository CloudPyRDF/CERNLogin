from jupyter_server.base.handlers import JupyterHandler
import json
import tornado
import subprocess
import os

home = os.getenv('HOME')
RSAKey = ''

class LoginHandler(JupyterHandler):
    @tornado.web.authenticated
    def get(self):
        message_type = self.get_json_body()['msg']
        if message_type == 'GET_STATUS':
            stream = os.popen('kerberos')
        elif message_type == 'GET_PUBLIC_KEY':
            self.write(json.dumps({'RSAPublicKey': RSAKey}))


    @tornado.web.authenticated
    def put(self):
        login = self.get_json_body()['login']
        password = self.get_json_body()['password']
        p = subprocess.Popen(['kinit', '-f', login + '@CERN.CH', '-c', '/tmp/certs'], stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            out, err = p.communicate(password.encode(), timeout=1)
            if err:
                self.write(json.dumps({'status': 'INVALID_CREDENTIALS'}))
            else:
                self.write(json.dumps({'status': 'SUCCESS'}))
        except subprocess.TimeoutExpired:
            self.write(json.dumps({'status': 'TIMEOUT'}))

