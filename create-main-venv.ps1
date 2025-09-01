# Change to the script's directory
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Create the virtual environment
py -3.10 -m venv .venv

# Activate the virtual environment
. .\.venv\Scripts\Activate.ps1

# Install requirements to the target directory
pip install -r backend/requirements.txt -r backend/requirements_dev.txt
