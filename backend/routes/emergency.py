import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

emergency_bp = Blueprint("emergency", __name__)

emergency_sessions = {}


@emergency_bp.route("/sos", methods=["POST"])
def create_sos():
    data = request.get_json() or {}
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "severity": data.get("severity", "UNKNOWN"),
        "status": "ACTIVE",
        "message": data.get("message", "Emergency SOS activated"),
        "contacts_notified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    emergency_sessions[session_id] = session
    return jsonify(session), 201


@emergency_bp.route("/emergency/<session_id>", methods=["GET"])
def get_emergency(session_id: str):
    session = emergency_sessions.get(session_id)
    if not session:
        return jsonify({"error": "Emergency session not found"}), 404
    return jsonify(session)


@emergency_bp.route("/emergency/<session_id>/resolve", methods=["PATCH"])
def resolve_emergency(session_id: str):
    session = emergency_sessions.get(session_id)
    if not session:
        return jsonify({"error": "Emergency session not found"}), 404
    session["status"] = "RESOLVED"
    session["updated_at"] = datetime.now(timezone.utc).isoformat()
    return jsonify(session)


@emergency_bp.route("/emergencies", methods=["GET"])
def list_emergencies():
    return jsonify(list(emergency_sessions.values()))
