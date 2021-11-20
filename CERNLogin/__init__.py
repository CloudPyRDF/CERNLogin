from cern_login import LoginHandler

def _jupyter_server_extension_points():
    return [{
        "module": "CERNLogin"
    }]

def load_jupyter_server_extension(server_app):
    handlers = [("/AWSConnector", LoginHandler)]
    server_app.web_app.add_handlers(".*$", handlers)