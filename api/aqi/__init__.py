import json
import os
from typing import Dict, Literal, Optional, Union

import azure.functions as func
import requests
from requests import Response

# --- Optional friendly names (from your original script) ---
SENSOR_NAMES: Dict[str, int] = {
    "finn-hill": 156415,
    "juanita": 102160,
    "sunnyvale": 68619,
    "san-francisco": 36529,
    "adelaide": 95971,
    "london": 146146,
    "des-moines": 115301,
    "santa-monica": 92539,
    "bengaluru": 42325,
    "san-diego": 78279,
    "san-rafael": 63895,
    "fremont": 86205,
    "melbourne": 46649,
    "sydney": 104206,
}

AqiCategory = Literal[
    "Good",
    "Moderate",
    "Unhealthy for Sensitive Groups",
    "Unhealthy",
    "Very Unhealthy",
    "Hazardous",
]


def lerp(out0: float, out1: float, in0: float, in1: float, v: float) -> float:
    x = min(max(v, in0), in1)
    return out0 + ((x - in0) / (in1 - in0)) * (out1 - out0)


def aqi_from_pm25(pm25: float) -> float:
    """US EPA PM2.5 AQI, matching your Python breakpoints. Rounded elsewhere."""
    if pm25 < 0:
        return 0
    if pm25 <= 12.0:
        return lerp(0, 50, 0.0, 12.0, pm25)
    if pm25 <= 35.4:
        return lerp(50, 100, 12.0, 35.4, pm25)
    if pm25 <= 55.4:
        return lerp(100, 150, 35.4, 55.4, pm25)
    if pm25 <= 150.4:
        return lerp(150, 200, 55.4, 150.4, pm25)
    if pm25 <= 250.4:
        return lerp(200, 300, 150.4, 250.4, pm25)
    if pm25 <= 350.4:
        return lerp(300, 400, 250.4, 350.4, pm25)
    if pm25 <= 500.4:
        return lerp(400, 500, 350.4, 500.4, pm25)
    return 501


def category_from_aqi(aqi: float) -> AqiCategory:
    if aqi <= 50:
        return "Good"
    if aqi <= 100:
        return "Moderate"
    if aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    if aqi <= 200:
        return "Unhealthy"
    if aqi <= 300:
        return "Very Unhealthy"
    return "Hazardous"


def resolve_sensor_id(sensor: str) -> int:
    """Accepts numeric ID or friendly name defined above."""
    s = sensor.strip().lower()
    if s in SENSOR_NAMES:
        return SENSOR_NAMES[s]
    try:
        n = int(s)
        return n
    except ValueError:
        raise ValueError(f"Unrecognized sensor identifier: {sensor}")


RowDict = Dict[str, Optional[Union[int, float, str]]]

def fetch_sensor_row(api_key: str, sensor_index: int, pm_field: str, max_age_minutes: int) -> Optional[RowDict]:
    """
    Query PurpleAir real-time endpoint for a specific sensor.
    Returns a dict mapping field->value for the first (and only) row, or None.
    """
    url = "https://api.purpleair.com/v1/sensors"
    fields = ["sensor_index", "last_seen", pm_field]
    params = {
        "fields": ",".join(fields),
        "show_only": str(sensor_index),
        "max_age": str(max_age_minutes * 60),  # seconds
    }
    headers = {"X-API-Key": api_key}

    resp: Response = requests.get(url, headers=headers, params=params, timeout=15)
    if not resp.ok:
        # Bubble up a clear message for the client
        raise RuntimeError(f"PurpleAir error {resp.status_code}: {resp.text}")

    body = resp.json()
    data = body.get("data") or []
    if not data:
        return None

    idx = {f: i for i, f in enumerate(body.get("fields", []))}
    row = data[0]
    # Convert to a dict keyed by field name
    return {f: row[i] if i < len(row) else None for f, i in idx.items()}


def to_json_response(body: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(body=json.dumps(body), status_code=status_code, mimetype="application/json",
                             headers={"Cache-Control": "no-store"})

def create_json_error(message: str, status_code: int) -> func.HttpResponse:
    return to_json_response({"error": message}, status_code)

# Azure Functions entrypoint
def main(req: func.HttpRequest) -> func.HttpResponse:
    """
    GET  /api/aqi?sensor=juanita&pmField=pm2.5_alt&maxAgeMinutes=60
    POST /api/aqi   (JSON body: {"sensor":"juanita","pmField":"pm2.5_atm","maxAgeMinutes":120})
    """
    try:
        api_key = os.environ.get("PURPLEAIR_API_KEY", "").strip()
        if not api_key:
            return create_json_error("Server is not configured with PURPLEAIR_API_KEY", 500)

        # Parse inputs from query or JSON body
        payload = {}
        if req.method == "POST":
            try:
                payload = req.get_json()
            except ValueError:
                pass

        sensor = req.params.get("sensor") or payload.get("sensor") or ""
        if not sensor:
            return create_json_error("Missing 'sensor' parameter", 400)

        pm_field = req.params.get("pmField") or payload.get("pmField") or "pm2.5_alt"
        if pm_field not in ("pm2.5_alt", "pm2.5_atm"):
            return create_json_error("pmField must be 'pm2.5_alt' or 'pm2.5_atm'", 400)

        try:
            max_age_minutes = int(req.params.get("maxAgeMinutes") or payload.get("maxAgeMinutes") or 60)
        except ValueError:
            return create_json_error("maxAgeMinutes must be an integer", 400)
        if max_age_minutes < 0:
            return create_json_error("maxAgeMinutes must be >= 0", 400)

        try:
            sensor_id = resolve_sensor_id(sensor)
        except ValueError as e:
            return create_json_error(str(e), 400)

        row = fetch_sensor_row(api_key, sensor_id, pm_field, max_age_minutes)
        if not row:
            data = {
                    "sensor": sensor,
                    "sensor_index": sensor_id,
                    "message": "No fresh reading available for this sensor (empty result).",
                }
            return to_json_response(data, 404)

        pm25_raw = row.get(pm_field)
        try:
            pm25 = float(pm25_raw) # type: ignore
        except (TypeError, ValueError):
            data = {
                    "sensor": sensor,
                    "sensor_index": sensor_id,
                    "message": f"No numeric value for {pm_field}",
                }
            return to_json_response(data, 404)

        aqi = round(aqi_from_pm25(pm25), 1)
        category: AqiCategory = category_from_aqi(aqi)

        result = {
            "sensor": sensor,                  # what caller passed (name or id)
            "sensor_index": sensor_id,         # resolved id
            "pm_field": pm_field,              # "pm2.5_alt" or "pm2.5_atm"
            "pm25": pm25,                      # micrograms / m^3
            "aqi": aqi,                        # 0-500 (0.1 precision)
            "category": category,              # text description
            "last_seen": row.get("last_seen"), # epoch seconds (PurpleAir)
            "fetched_at": int(__import__("time").time()),  # server epoch seconds
        }
        return to_json_response(result)

    except RuntimeError as e:
        # e.g., PurpleAir returned an error body
        return create_json_error(str(e), 502)
    except Exception as e:
        return create_json_error(f"Unexpected error: {e}", 500)
