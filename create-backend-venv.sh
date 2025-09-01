#!/bin/bash
cd "$(dirname $0)"
python3.10 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r backend/requirements.txt -t backend/.python_packages/lib/python3.10/site-packages
