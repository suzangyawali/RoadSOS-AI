import math
from flask import Blueprint, request, jsonify

hospitals_bp = Blueprint("hospitals", __name__)

HOSPITALS_DB = [
    {"id": "h1", "name": "AIIMS Trauma Centre", "type": "Trauma Center", "latitude": 28.5672, "longitude": 77.2100, "phone": "+91-11-26588500", "emergency": True, "rating": 4.8},
    {"id": "h2", "name": "Safdarjung Hospital", "type": "Government Hospital", "latitude": 28.5685, "longitude": 77.2066, "phone": "+91-11-26707437", "emergency": True, "rating": 4.5},
    {"id": "h3", "name": "Apollo Hospital", "type": "Private Hospital", "latitude": 28.5421, "longitude": 77.2832, "phone": "+91-11-26925858", "emergency": True, "rating": 4.7},
    {"id": "h4", "name": "Max Super Speciality Hospital", "type": "Private Hospital", "latitude": 28.5679, "longitude": 77.2734, "phone": "+91-11-26515050", "emergency": True, "rating": 4.6},
    {"id": "h5", "name": "Sir Ganga Ram Hospital", "type": "Private Hospital", "latitude": 28.6398, "longitude": 77.1894, "phone": "+91-11-25861256", "emergency": True, "rating": 4.4},
    {"id": "h6", "name": "Fortis Hospital", "type": "Private Hospital", "latitude": 28.5249, "longitude": 77.2090, "phone": "+91-11-42776222", "emergency": True, "rating": 4.5},
    {"id": "h7", "name": "GTB Hospital", "type": "Government Hospital", "latitude": 28.6841, "longitude": 77.3118, "phone": "+91-11-22586262", "emergency": True, "rating": 4.2},
    {"id": "h8", "name": "RML Hospital", "type": "Government Hospital", "latitude": 28.6260, "longitude": 77.2030, "phone": "+91-11-23404446", "emergency": True, "rating": 4.3},
    {"id": "h9", "name": "Lok Nayak Hospital", "type": "Government Hospital", "latitude": 28.6367, "longitude": 77.2394, "phone": "+91-11-23232400", "emergency": True, "rating": 4.1},
    {"id": "h10", "name": "Medanta Hospital", "type": "Private Hospital", "latitude": 28.4395, "longitude": 77.0415, "phone": "+91-124-4141414", "emergency": True, "rating": 4.9},
]

POLICE_STATIONS = [
    {"id": "p1", "name": "Saket Police Station", "type": "Police Station", "latitude": 28.5244, "longitude": 77.2167, "phone": "100"},
    {"id": "p2", "name": "Hauz Khas Police Station", "type": "Police Station", "latitude": 28.5494, "longitude": 77.2001, "phone": "100"},
    {"id": "p3", "name": "Lodhi Colony Police Station", "type": "Police Station", "latitude": 28.5868, "longitude": 77.2289, "phone": "100"},
]

AMBULANCE_SERVICES = [
    {"id": "a1", "name": "108 Ambulance Service", "type": "Ambulance", "phone": "108", "available": True},
    {"id": "a2", "name": "102 Ambulance Service", "type": "Ambulance", "phone": "102", "available": True},
    {"id": "a3", "name": "Centralized Accident & Trauma Services (CATS)", "type": "Ambulance", "phone": "1099", "available": True},
]

TOWING_SERVICES = [
    {"id": "t1", "name": "Express Highway Towing", "type": "Towing Service", "latitude": 28.5521, "longitude": 77.2632, "phone": "+91-98765-43210", "rating": 4.5, "price_per_km": 150},
    {"id": "t2", "name": "Delhi Quick Tow Assist", "type": "Towing Service", "latitude": 28.5821, "longitude": 77.2132, "phone": "+91-99887-76655", "rating": 4.2, "price_per_km": 120},
    {"id": "t3", "name": "Golden Hour Recovery Services", "type": "Towing Service", "latitude": 28.5321, "longitude": 77.2932, "phone": "+91-91234-56789", "rating": 4.7, "price_per_km": 200},
]

PUNCTURE_SHOPS = [
    {"id": "s1", "name": "Verma Puncture & Repair Shop", "type": "Puncture Shop", "latitude": 28.5621, "longitude": 77.2332, "phone": "+91-95432-10987", "rating": 4.4, "24_hours": True},
    {"id": "s2", "name": "Metro Tyre & Tube Repair", "type": "Puncture Shop", "latitude": 28.5421, "longitude": 77.2032, "phone": "+91-96543-21098", "rating": 4.0, "24_hours": False},
    {"id": "s3", "name": "NH-24 Tyre Service Station", "type": "Puncture Shop", "latitude": 28.6221, "longitude": 77.3032, "phone": "+91-97654-32109", "rating": 4.6, "24_hours": True},
]


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@hospitals_bp.route("/hospitals/nearby", methods=["GET"])
def nearby_hospitals():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    radius = request.args.get("radius", default=50, type=float)

    if lat is None or lon is None:
        return jsonify(HOSPITALS_DB)

    results = []
    for h in HOSPITALS_DB:
        dist = haversine(lat, lon, h["latitude"], h["longitude"])
        if dist <= radius:
            results.append({**h, "distance_km": round(dist, 2)})

    results.sort(key=lambda x: x["distance_km"])
    return jsonify(results)


@hospitals_bp.route("/police/nearby", methods=["GET"])
def nearby_police():
    return jsonify(POLICE_STATIONS)


@hospitals_bp.route("/ambulance/services", methods=["GET"])
def ambulance_services():
    return jsonify(AMBULANCE_SERVICES)


@hospitals_bp.route("/towing/nearby", methods=["GET"])
def nearby_towing():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    radius = request.args.get("radius", default=50, type=float)

    if lat is None or lon is None:
        return jsonify(TOWING_SERVICES)

    results = []
    for t in TOWING_SERVICES:
        dist = haversine(lat, lon, t["latitude"], t["longitude"])
        if dist <= radius:
            results.append({**t, "distance_km": round(dist, 2)})

    results.sort(key=lambda x: x["distance_km"])
    return jsonify(results)


@hospitals_bp.route("/puncture/nearby", methods=["GET"])
def nearby_puncture():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    radius = request.args.get("radius", default=50, type=float)

    if lat is None or lon is None:
        return jsonify(PUNCTURE_SHOPS)

    results = []
    for p in PUNCTURE_SHOPS:
        dist = haversine(lat, lon, p["latitude"], p["longitude"])
        if dist <= radius:
            results.append({**p, "distance_km": round(dist, 2)})

    results.sort(key=lambda x: x["distance_km"])
    return jsonify(results)


@hospitals_bp.route("/routes/emergency", methods=["GET"])
def emergency_route():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    dest_lat = request.args.get("dest_lat", type=float)
    dest_lon = request.args.get("dest_lon", type=float)

    if not all([lat, lon, dest_lat, dest_lon]):
        return jsonify({"error": "Missing coordinates"}), 400

    distance = haversine(lat, lon, dest_lat, dest_lon)
    eta_minutes = round(distance / 40 * 60)

    return jsonify({
        "origin": {"latitude": lat, "longitude": lon},
        "destination": {"latitude": dest_lat, "longitude": dest_lon},
        "distance_km": round(distance, 2),
        "eta_minutes": eta_minutes,
        "route_type": "emergency",
    })
