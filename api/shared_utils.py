import logging
import os
from typing import Dict

def is_running_locally() -> bool:
    return os.environ.get("AZURE_FUNCTIONS_ENVIRONMENT") == "Development"

def init_headers() -> Dict[str, str]:
    headers = {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    logging.info(f"Running locally: {is_running_locally()}")
    if is_running_locally():
        headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    return headers
