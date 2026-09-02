import os
import time
import requests
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or fallback to parent
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

app = FastAPI(title="My Rail Helper API Proxy", description="API backend for My Rail Helper Indian Railway Web App")

# Enable CORS for React frontend (Vite dev server and production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_URL = os.getenv("RAILRADAR_BASE_URL", "https://api.railradar.in/v1")
API_KEY = os.getenv("RAILRADAR_API_KEY", "")

# In-Memory Cache Store to conserve monthly API quota
CACHE = {}

def get_from_cache(key: str):
    item = CACHE.get(key)
    if not item:
        return None
    val, expiry = item
    if time.time() < expiry:
        return val
    del CACHE[key]
    return None

def set_in_cache(key: str, val: dict, ttl_seconds: int = 300):
    CACHE[key] = (val, time.time() + ttl_seconds)


def make_railradar_request(endpoint: str, params: dict = None, cache_ttl: int = 120):
    """Helper to query RailRadar v1 API with authorization and caching to save API quota"""
    cache_key = f"{endpoint}_{sorted(params.items()) if params else ''}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    headers = {
        "Authorization": f"Bearer {API_KEY}"
    } if API_KEY else {}
    
    url = f"{BASE_URL}{endpoint}"
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        try:
            res_json = response.json()
        except Exception:
            res_json = None

        if response.status_code == 200:
            if res_json:
                set_in_cache(cache_key, res_json, cache_ttl)
            return res_json
        elif response.status_code == 401 or response.status_code == 403:
            return {"error": "Invalid or missing RAILRADAR_API_KEY", "status_code": response.status_code}
        else:
            err_detail = "Data not available"
            if res_json and isinstance(res_json, dict):
                err = res_json.get("error")
                if isinstance(err, dict):
                    err_detail = err.get("message", "Data not available")
                elif err:
                    err_detail = str(err)
            return {"error": err_detail, "status_code": response.status_code}
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "status_code": 500}


# Top Station Code Mapping (Saves API calls during lookups)
LOCAL_STATION_MAP = {
    "DELHI": "NDLS", "NEW DELHI": "NDLS", "OLD DELHI": "DLI", "NIZAMUDDIN": "NZM", "ANAND VIHAR": "ANVT",
    "MUMBAI": "MMCT", "MUMBAI CENTRAL": "MMCT", "CSMT": "CSMT", "BANDRA": "BDTS", "DADAR": "DR", "PUNE": "PUNE",
    "KOLKATA": "HWH", "HOWRAH": "HWH", "SEALDAH": "SDAH", "CHENNAI": "MAS", "CHENNAI CENTRAL": "MAS",
    "BANGALORE": "SBC", "BENGALURU": "SBC", "YESVANTPUR": "YPR", "VARANASI": "BSB", "BANARAS": "BNRS",
    "KANPUR": "CNB", "PRAYAGRAJ": "PRYJ", "ALLAHABAD": "PRYJ", "LUCKNOW": "LKO", "GORAKHPUR": "GKP",
    "AHMEDABAD": "ADI", "VADODARA": "BRC", "SURAT": "ST", "PATNA": "PNBE", "GAYA": "GAYA", "BHOPAL": "BPL",
    "JAIPUR": "JP", "JODHPUR": "JU", "KOTA": "KOTA", "HYDERABAD": "HYB", "SECUNDERABAD": "SC",
    "VIJAYAWADA": "BZA", "VISAKHAPATNAM": "VSKP", "TRIVANDRUM": "TVC", "KOCHI": "ERS", "GUWAHATI": "GHY",
    "BHUBANESWAR": "BBS", "PURI": "PURI", "RAIPUR": "R", "JAMMU": "JAT", "KATRA": "SVDK", "AMRITSAR": "ASR",
    "CHANDIGARH": "CDG", "HARIDWAR": "HW", "DEHRADUN": "DDN", "RANCHI": "RNC", "DHANBAD": "DHN"
}

def get_station_code(query: str) -> str:
    """Helper to lookup a station code locally first to save API credits"""
    if not query:
        return "NULL"
    query_clean = query.strip().upper()
    if len(query_clean) <= 5 and query_clean.isalpha():
        return query_clean
    
    if query_clean in LOCAL_STATION_MAP:
        return LOCAL_STATION_MAP[query_clean]
    
    for name, code in LOCAL_STATION_MAP.items():
        if query_clean in name or name in query_clean:
            return code
            
    data = make_railradar_request("/lookup/search/stations", {"q": query, "limit": 1}, cache_ttl=86400)
    if data and "data" in data and len(data["data"]) > 0:
        return data["data"][0].get("code", query_clean)
    return query_clean


# Helper to dynamically generate fallback seat availability starting from requested journeyDate
def generate_mock_seats(journey_date_str: str):
    try:
        base_date = datetime.strptime(journey_date_str, "%Y-%m-%d")
    except Exception:
        base_date = datetime.now()
    
    calendar = []
    statuses = [
        ("AVAILABLE", 54, None),
        ("AVAILABLE", 19, None),
        ("RAC", None, "RAC 5"),
        ("WAITLIST", None, "WL 12"),
        ("WAITLIST", None, "WL 28"),
        ("AVAILABLE", 72, None),
    ]
    for i, (st, seats, wl) in enumerate(statuses):
        d = base_date + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        item = {
            "date": d_str,
            "rawDate": d_str,
            "statusCode": st,
            "status": f"{st}-{seats}" if seats else st,
            "isAvailable": st == "AVAILABLE"
        }
        if seats is not None:
            item["availableSeats"] = seats
        if wl is not None:
            item["waitlistNumber"] = wl
        calendar.append(item)
    return {"data": {"calendar": calendar}}


# ==========================================
# MOCK / FALLBACK DATA (For offline/testing)
# ==========================================
MOCK_LIVE_STATUS = {
    "data": {
        "trainNumber": "22436",
        "trainName": "VANDE BHARAT EXP",
        "status": "RUNNING",
        "lastUpdatedAt": "2026-09-01T14:15:00+05:30",
        "train": {
            "type": "SUPERFAST / VANDE BHARAT",
            "category": "PREMIUM",
            "source": {"code": "NDLS", "name": "NEW DELHI"},
            "destination": {"code": "BSB", "name": "VARANASI JN"},
            "coachPosition": "LOCO-E1-C1-C2-C3-C4-C5-C6-C7-C8-C9-C10-C11-C12-C13-C14-E2"
        },
        "currentLocation": {
            "stationName": "KANPUR CENTRAL",
            "stationCode": "CNB",
            "delayMinutes": 0,
            "speedKmph": 128
        },
        "previousHalt": {
            "stationName": "ALIGARH JN",
            "stationCode": "ALJN",
            "departureTime": "07:55"
        },
        "nextHalt": {
            "stationName": "PRAYAGRAJ JN",
            "stationCode": "PRYJ",
            "scheduledArrival": "12:10",
            "expectedArrival": "12:10"
        }
    }
}

MOCK_SCHEDULE = {
    "data": {
        "train": {
            "trainNumber": "22436",
            "trainName": "VANDE BHARAT EXP",
            "type": "Vande Bharat Express",
            "sourceStationName": "NEW DELHI (NDLS)",
            "destinationStationName": "VARANASI JN (BSB)",
            "distanceKm": 759,
            "totalHalts": 4
        },
        "route": [
            {"sequence": 1, "stationCode": "NDLS", "stationName": "NEW DELHI", "scheduledArrival": None, "scheduledDeparture": 360, "distanceFromSourceKm": 0, "day": 1, "isHalt": True, "stopType": "origin"},
            {"sequence": 2, "stationCode": "CNB", "stationName": "KANPUR CENTRAL", "scheduledArrival": 610, "scheduledDeparture": 615, "distanceFromSourceKm": 440, "day": 1, "isHalt": True, "stopType": "halt"},
            {"sequence": 3, "stationCode": "PRYJ", "stationName": "PRAYAGRAJ JN", "scheduledArrival": 730, "scheduledDeparture": 732, "distanceFromSourceKm": 634, "day": 1, "isHalt": True, "stopType": "halt"},
            {"sequence": 4, "stationCode": "BSB", "stationName": "VARANASI JN", "scheduledArrival": 840, "scheduledDeparture": None, "distanceFromSourceKm": 759, "day": 1, "isHalt": True, "stopType": "destination"}
        ]
    }
}

MOCK_TRAINS_BETWEEN = {
    "data": {
        "count": 4,
        "trains": [
            {
                "train": {
                    "number": "22436",
                    "name": "VANDE BHARAT EXP",
                    "type": "VB",
                    "runDays": ["TUE", "WED", "FRI", "SAT", "SUN"]
                },
                "from": {"name": "NEW DELHI", "code": "NDLS", "city": "Delhi", "departure": "06:00"},
                "to": {"name": "VARANASI JN", "code": "BSB", "city": "Varanasi", "arrival": "14:00"},
                "duration": "8h 00m",
                "distance": 759,
                "totalHaltsBetween": 2
            },
            {
                "train": {
                    "number": "12560",
                    "name": "SHIV GANGA EXP",
                    "type": "SF",
                    "runDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
                },
                "from": {"name": "NEW DELHI", "code": "NDLS", "city": "Delhi", "departure": "20:05"},
                "to": {"name": "VARANASI JN", "code": "BSB", "city": "Varanasi", "arrival": "06:10"},
                "duration": "10h 05m",
                "distance": 757,
                "totalHaltsBetween": 1
            },
            {
                "train": {
                    "number": "12582",
                    "name": "BSB NDLS SF EXP",
                    "type": "SF",
                    "runDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
                },
                "from": {"name": "NEW DELHI", "code": "NDLS", "city": "Delhi", "departure": "22:50"},
                "to": {"name": "VARANASI JN", "code": "BSB", "city": "Varanasi", "arrival": "10:00"},
                "duration": "11h 10m",
                "distance": 759,
                "totalHaltsBetween": 5
            },
            {
                "train": {
                    "number": "12418",
                    "name": "PRAYAGRAJ EXP",
                    "type": "SF",
                    "runDays": ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
                },
                "from": {"name": "NEW DELHI", "code": "NDLS", "city": "Delhi", "departure": "22:10"},
                "to": {"name": "PRAYAGRAJ JN", "code": "PRYJ", "city": "Prayagraj", "arrival": "07:00"},
                "duration": "8h 50m",
                "distance": 634,
                "totalHaltsBetween": 4
            }
        ]
    }
}

MOCK_STATIONS = {
    "data": [
        {"code": "NDLS", "name": "NEW DELHI", "city": "New Delhi", "isActive": True, "state": "Delhi"},
        {"code": "MMCT", "name": "MUMBAI CENTRAL", "city": "Mumbai", "isActive": True, "state": "Maharashtra"},
        {"code": "HWH", "name": "HOWRAH JN", "city": "Kolkata", "isActive": True, "state": "West Bengal"},
        {"code": "MAS", "name": "CHENNAI CENTRAL", "city": "Chennai", "isActive": True, "state": "Tamil Nadu"},
        {"code": "SBC", "name": "KSR BENGALURU", "city": "Bengaluru", "isActive": True, "state": "Karnataka"},
        {"code": "BSB", "name": "VARANASI JN", "city": "Varanasi", "isActive": True, "state": "Uttar Pradesh"},
        {"code": "CNB", "name": "KANPUR CENTRAL", "city": "Kanpur", "isActive": True, "state": "Uttar Pradesh"},
        {"code": "PRYJ", "name": "PRAYAGRAJ JN", "city": "Prayagraj", "isActive": True, "state": "Uttar Pradesh"},
        {"code": "ADI", "name": "AHMEDABAD JN", "city": "Ahmedabad", "isActive": True, "state": "Gujarat"},
        {"code": "PNBE", "name": "PATNA JN", "city": "Patna", "isActive": True, "state": "Bihar"}
    ]
}

MOCK_LIVE_BOARD = {
    "data": {
        "station": {"code": "NDLS", "name": "NEW DELHI", "city": "New Delhi"},
        "window": {"from": "14:00", "to": "18:00"},
        "trains": [
            {
                "train": {"number": "22436", "name": "VANDE BHARAT EXP", "type": "VB"},
                "stop": {"arrival": "14:10", "departure": "14:15", "platform": "16"},
                "live": {"type": "on-time", "delayMinutes": 0, "expectedArrivalTime": "2026-09-01T14:10:00+05:30", "expectedDepartureTime": "2026-09-01T14:15:00+05:30"}
            },
            {
                "train": {"number": "12952", "name": "MUMBAI RAJDHANI", "type": "RAJ"},
                "stop": {"arrival": "--", "departure": "16:55", "platform": "3"},
                "live": {"type": "on-time", "delayMinutes": 0, "expectedDepartureTime": "2026-09-01T16:55:00+05:30"}
            },
            {
                "train": {"number": "12004", "name": "LUCKNOW SHATABDI", "type": "SHT"},
                "stop": {"arrival": "--", "departure": "06:10", "platform": "1"},
                "live": {"type": "delayed", "delayMinutes": 15, "expectedDepartureTime": "2026-09-01T06:25:00+05:30"}
            },
            {
                "train": {"number": "12302", "name": "HOWRAH RAJDHANI", "type": "RAJ"},
                "stop": {"arrival": "--", "departure": "16:50", "platform": "2"},
                "live": {"type": "on-time", "delayMinutes": 0, "expectedDepartureTime": "2026-09-01T16:50:00+05:30"}
            }
        ]
    }
}


# ==========================================
# ENDPOINTS (With Caching and Zero Previews)
# ==========================================

@app.get("/")
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "My Rail Helper API Proxy",
        "has_api_key": bool(API_KEY),
        "api_base": BASE_URL,
        "cached_queries": len(CACHE)
    }


@app.get("/api/trains/{train_number}/live")
def get_live_train_status(train_number: str):
    res = make_railradar_request(f"/trains/{train_number}/live", cache_ttl=120)
    if res and "data" in res and res.get("success") is not False:
        return res
    if res and "error" in res and API_KEY:
        return {"error": res["error"], "data": None}
    fallback = dict(MOCK_LIVE_STATUS)
    fallback["data"]["trainNumber"] = train_number
    return fallback


@app.get("/api/trains/{train_number}/schedule")
def get_train_schedule(train_number: str):
    res = make_railradar_request(f"/legacy/trains/{train_number}", {"dataType": "full"}, cache_ttl=86400)
    if res and "data" in res and res.get("success") is not False:
        return res
    if res and "error" in res and API_KEY:
        return {"error": res["error"], "data": None}
    fallback = dict(MOCK_SCHEDULE)
    fallback["data"]["train"]["trainNumber"] = train_number
    return fallback


@app.get("/api/trains/between")
def get_trains_between(source: str = Query(...), destination: str = Query(...)):
    src_code = get_station_code(source)
    dst_code = get_station_code(destination)
    res = make_railradar_request(f"/trains/between/{src_code}/{dst_code}", cache_ttl=3600)
    if res and "data" in res and res.get("success") is not False:
        return res
    if res and "error" in res and API_KEY:
        return {"error": res["error"], "data": None}
    return MOCK_TRAINS_BETWEEN


@app.get("/api/trains/{train_number}/seats")
def get_seat_availability(
    train_number: str,
    source: str = Query(...),
    destination: str = Query(...),
    journeyDate: str = Query(...),
    classCode: str = Query("CC"),
    quotaCode: str = Query("GN")
):
    src_code = get_station_code(source)
    dst_code = get_station_code(destination)
    params = {
        "source": src_code,
        "destination": dst_code,
        "journeyDate": journeyDate,
        "classCode": classCode,
        "quotaCode": quotaCode
    }
    # Cache seat availability for 15 minutes (900s)
    res = make_railradar_request(f"/trains/{train_number}/seats", params, cache_ttl=900)
    if res and "data" in res and res.get("success") is not False:
        return res
    
    # If API returned an error (e.g. Class does not exist on this train), surface it cleanly
    if res and "error" in res:
        err_msg = res["error"]
        if API_KEY:
            return {"error": err_msg, "data": None}
            
    # If no API key or offline testing, generate dynamic mock dates from the user's journeyDate
    return generate_mock_seats(journeyDate)


@app.get("/api/stations/search")
def search_stations(q: str = Query(..., min_length=1), limit: int = Query(10)):
    res = make_railradar_request("/lookup/search/stations", {"q": q, "limit": limit}, cache_ttl=604800)
    if res and "data" in res and len(res.get("data", [])) > 0:
        return res
    query = q.lower()
    matches = [
        s for s in MOCK_STATIONS["data"]
        if query in s["code"].lower() or query in s["name"].lower() or query in s["city"].lower()
    ]
    return {"data": matches or MOCK_STATIONS["data"][:limit]}


@app.get("/api/stations/{station_code}/trains")
def get_station_trains(station_code: str):
    code = get_station_code(station_code)
    res = make_railradar_request(f"/stations/{code}/trains", cache_ttl=21600)
    if res and "data" in res and res.get("success") is not False:
        return res
    if res and "error" in res and API_KEY:
        return {"error": res["error"], "data": None}
    return {
        "data": {
            "station": {"code": code, "name": f"{code} STATION", "city": "Railway Division"},
            "trains": [
                {
                    "train": {"number": "12951", "name": "MUMBAI RAJDHANI", "type": "RAJ", "source": {"name": "MUMBAI CENTRAL"}, "destination": {"name": "NEW DELHI"}, "runDays": ["DAILY"]},
                    "stop": {"arrival": "08:32", "departure": "08:35", "distance": 1384, "stopType": "REGULAR"}
                },
                {
                    "train": {"number": "22436", "name": "VANDE BHARAT EXP", "type": "VB", "source": {"name": "NEW DELHI"}, "destination": {"name": "VARANASI JN"}, "runDays": ["TUE", "WED", "FRI", "SAT", "SUN"]},
                    "stop": {"arrival": "06:00", "departure": "06:00", "distance": 0, "stopType": "ORIGIN"}
                }
            ]
        }
    }


@app.get("/api/stations/{station_code}/live")
def get_station_live_board(station_code: str, hours: int = Query(4)):
    code = get_station_code(station_code)
    res = make_railradar_request(f"/stations/{code}/live", {"hours": hours}, cache_ttl=120)
    if res and "data" in res and res.get("success") is not False:
        return res
    if res and "error" in res and API_KEY:
        return {"error": res["error"], "data": None}
    fallback = dict(MOCK_LIVE_BOARD)
    fallback["data"]["station"]["code"] = code
    return fallback


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
