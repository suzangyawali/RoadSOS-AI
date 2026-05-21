import uuid
import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from twilio.rest import Client

emergency_bp = Blueprint("emergency", __name__)

# MongoDB connection
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/roadsos")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client.roadsos
    emergencies_collection = db.emergencies
    mongo_client.server_info()
    print("✅ MongoDB connected")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    emergencies_collection = None

# Twilio setup
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        print("✅ Twilio initialized")
    except Exception as e:
        print(f"❌ Twilio initialization failed: {e}")


def send_emergency_notification(session):
    """Send SMS to emergency services via Twilio"""
    if not twilio_client or not TWILIO_PHONE_NUMBER:
        print("⚠️ Twilio not configured - SMS not sent")
        return False
    
    try:
        message = f"🚨 EMERGENCY SOS ALERT\n"
        message += f"Location: {session['latitude']}, {session['longitude']}\n"
        message += f"Severity: {session['severity']}\n"
        message += f"Time: {session['created_at']}\n"
        message += f"Session ID: {session['id']}"
        
        emergency_numbers = [
            "+917518714904",  # 112 - National Emergency
            "+917518714904",  # 108 - Ambulance
            "+917518714904",  # 100 - Police
        ]
        
        for number in emergency_numbers:
            try:
                twilio_client.messages.create(
                    body=message,
                    from_=TWILIO_PHONE_NUMBER,
                    to=number
                )
                print(f"✅ Emergency SMS sent to {number}")
            except Exception as e:
                print(f"❌ SMS failed for {number}: {e}")
        
        return True
    except Exception as e:
        print(f"❌ Emergency notification failed: {e}")
        return False


# In-memory mock database fallback for development/demo
IN_MEMORY_EMERGENCIES = [
    {
        "id": "mock-emergency-1",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "severity": "HIGH",
        "status": "ACTIVE",
        "message": "Multiple vehicle collision reported on GT Karnal Road. Bystanders reporting serious injury.",
        "contacts_notified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "mock-emergency-2",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "severity": "MEDIUM",
        "status": "ACTIVE",
        "message": "Two-wheeler skid near Connaught Place Outer Circle. Minor leg injury.",
        "contacts_notified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "mock-emergency-3",
        "latitude": 28.6692,
        "longitude": 77.4538,
        "severity": "HIGH",
        "status": "RESOLVED",
        "message": "Car crash near NH-24 Ghaziabad exit. EMS dispatched.",
        "contacts_notified": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


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
        "source": data.get("source", "citizen_sos"),
        "reporter_type": data.get("reporter_type", "citizen"),
        "media_type": data.get("media_type"),
        "ai_confidence": data.get("ai_confidence"),
        "packet_status": data.get("packet_status", "generated"),
        "contacts_notified": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    
    # ✅ Save to MongoDB
    if emergencies_collection is not None:
        try:
            emergencies_collection.insert_one(session.copy())
            print(f"✅ Emergency saved to MongoDB: {session_id}")
        except Exception as e:
            print(f"❌ MongoDB save failed: {e}")
    else:
        print("⚠️ MongoDB not available - data persisted in-memory")
    
    # Always keep in-memory fallback synced
    IN_MEMORY_EMERGENCIES.insert(0, session.copy())
    
    # ✅ Send emergency notifications via Twilio
    notified = send_emergency_notification(session)
    session["contacts_notified"] = notified
    
    # Update in-memory entry if notified
    for e in IN_MEMORY_EMERGENCIES:
        if e["id"] == session_id:
            e["contacts_notified"] = notified
            break
            
    return jsonify(session), 201


@emergency_bp.route("/emergency/<session_id>", methods=["GET"])
def get_emergency(session_id: str):
    if emergencies_collection is not None:
        try:
            session = emergencies_collection.find_one({"id": session_id})
            if session:
                session.pop("_id", None)
                return jsonify(session)
        except Exception as e:
            print(f"❌ MongoDB query failed: {e}")
    
    for e in IN_MEMORY_EMERGENCIES:
        if e["id"] == session_id:
            return jsonify(e)
            
    return jsonify({"error": "Emergency session not found"}), 404


@emergency_bp.route("/emergency/<session_id>/resolve", methods=["PATCH"])
def resolve_emergency(session_id: str):
    updated_session = None
    
    for e in IN_MEMORY_EMERGENCIES:
        if e["id"] == session_id:
            e["status"] = "RESOLVED"
            e["updated_at"] = datetime.now(timezone.utc).isoformat()
            updated_session = e.copy()
            break

    if emergencies_collection is not None:
        try:
            result = emergencies_collection.update_one(
                {"id": session_id},
                {"$set": {
                    "status": "RESOLVED",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
            if result.matched_count > 0:
                session = emergencies_collection.find_one({"id": session_id})
                session.pop("_id", None)
                print(f"✅ Emergency resolved: {session_id}")
                return jsonify(session)
        except Exception as e:
            print(f"❌ MongoDB update failed: {e}")
            
    if updated_session:
        return jsonify(updated_session)
        
    return jsonify({"error": "Emergency session not found"}), 404


@emergency_bp.route("/emergencies", methods=["GET"])
def list_emergencies():
    if emergencies_collection is not None:
        try:
            emergencies = list(emergencies_collection.find({}))
            for e in emergencies:
                e.pop("_id", None)
            if emergencies:
                # Merge with in-memory to ensure new ones are listed
                mongo_ids = {e["id"] for e in emergencies}
                for e in IN_MEMORY_EMERGENCIES:
                    if e["id"] not in mongo_ids:
                        emergencies.append(e)
                # Sort newest first
                emergencies.sort(key=lambda x: x.get("created_at", ""), reverse=True)
                return jsonify(emergencies)
        except Exception as e:
            print(f"❌ MongoDB query failed: {e}")
            
    return jsonify(IN_MEMORY_EMERGENCIES)
