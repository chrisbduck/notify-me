from boot import init_paths
init_paths()

import azure.functions as func
import logging
import json # Added for potential future use, though not directly used in HttpExample's current logic

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    headers = {"Access-Control-Allow-Origin": "http://localhost:5173"}

    if name:
        message = f"Hello, {name}. This HTTP triggered function executed successfully."
    else:
        message = "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response."
    
    return func.HttpResponse(message, headers=headers)