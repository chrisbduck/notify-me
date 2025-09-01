from boot import init_paths
init_paths()

from typing import Dict
import azure.functions as func
import datetime
import json
import logging
import requests
import os

ROUTE_ID = os.environ.get("ROUTE_ID", "100479")  # the 1 Line
DISRUPTIVE = {
    "NO_SERVICE","REDUCED_SERVICE","SIGNIFICANT_DELAYS","DETOUR","MODIFIED_SERVICE","OTHER_EFFECT"
}

def _filter_alerts(alerts_data: dict, route_id: str) -> list:
    filtered_results = []
    for entity in alerts_data.get("entity", []):
        alert = entity.get("alert", {})
        effect = alert.get("effect")
        if effect == "ACCESSIBILITY_ISSUE":  # skip elevator/escalator items
            continue
        
        cause_detail_text = alert.get("cause_detail", {}).get("translation", [{}])[0].get("text")
        if cause_detail_text == "SPECIAL_EVENT": # skip special event items
            continue
        if cause_detail_text == "SCHEDULED_MAINTENANCE": # skip scheduled maintenance items
            continue
        #if effect not in DISRUPTIVE:
        #    continue
        informed_entities = alert.get("informed_entity", [])
        if any(entity.get("route_id") == route_id for entity in informed_entities):
            filtered_results.append(alert)
    return filtered_results

def _init_headers(req: func.HttpRequest) -> Dict[str, str]:
    headers = {}
    origin = req.headers.get('Origin')
    if origin and '//localhost:' in origin:
        headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    return headers

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    alerts_url = "https://s3.amazonaws.com/st-service-alerts-prod/alerts_pb.json"

    headers = _init_headers(req)
    
    try:
        response = requests.get(alerts_url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        alerts_data = response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching alerts: {e}")
        return func.HttpResponse("Error fetching alerts.", status_code=500, headers=headers)
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON: {e}")
        return func.HttpResponse("Error decoding alerts JSON.", status_code=500, headers=headers)

    filtered_alerts = _filter_alerts(alerts_data, ROUTE_ID)
    headers["Content-Type"] = "application/json"
    return func.HttpResponse(json.dumps(filtered_alerts), headers=headers)