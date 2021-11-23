from .cern_login import LoginHandler
from pathlib import Path
import json

HERE = Path(__file__).parent.resolve()

with (HERE / "labextension" / "package.json").open() as fid:
    data = json.load(fid)

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": data["name"]
    }]

def _jupyter_server_extension_points():
    return [{
        "module": "CERNLogin"
    }]

def load_jupyter_server_extension(server_app):
    handlers = [("/CERNLogin", LoginHandler)]
    server_app.web_app.add_handlers(".*$", handlers)
    pass
    
def _jupyter_server_extension_paths():
    return [{"module": "CERNLogin"}]