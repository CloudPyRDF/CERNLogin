#!/usr/bin/env bash
set -e

jlpm
jlpm build
jupyter labextension install .
jlpm build
jupyter lab build

python3 -m pip install jupyter_server
python3 -m pip install -e .
jupyter serverextension enable CERNLogin
