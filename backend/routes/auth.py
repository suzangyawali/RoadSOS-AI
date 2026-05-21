import uuid
import os
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)

# MongoDB connection setup
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/roadsos")
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client.roadsos
    users_collection = db.users
    mongo_client.server_info()
    print("✅ MongoDB connected (Auth)")
except Exception as e:
    print(f"❌ MongoDB connection failed (Auth): {e}")
    users_collection = None

# Prepopulated Demo Accounts
DEMO_ACCOUNTS = [
    {"email": "citizen@roadsos.ai", "name": "Demo Citizen", "role": "citizen"},
    {"email": "rescuer@roadsos.ai", "name": "Demo Rescuer", "role": "rescuer"},
    {"email": "government@roadsos.ai", "name": "Demo Government", "role": "government"},
    {"email": "admin@roadsos.ai", "name": "Demo Admin", "role": "admin"},
]

IN_MEMORY_USERS = {}

def hash_password(password):
    return generate_password_hash(password, method="pbkdf2:sha256")

def seed_users():
    password_hash = hash_password("password123")

    # Initialize in-memory
    for demo in DEMO_ACCOUNTS:
        user_id = f"demo-{demo['role']}-id"
        IN_MEMORY_USERS[demo["email"]] = {
            "id": user_id,
            "name": demo["name"],
            "email": demo["email"],
            "password_hash": password_hash,
            "role": demo["role"],
            "phone": "+91-9999999999",
            "emergency_contacts": [],
            "language": "en",
            "is_active": True,
        }

    # Initialize MongoDB if connected
    if users_collection is not None:
        try:
            for demo in DEMO_ACCOUNTS:
                existing = users_collection.find_one({"email": demo["email"]})
                if not existing:
                    user_id = f"demo-{demo['role']}-id"
                    users_collection.insert_one({
                        "id": user_id,
                        "name": demo["name"],
                        "email": demo["email"],
                        "password_hash": password_hash,
                        "role": demo["role"],
                        "phone": "+91-9999999999",
                        "emergency_contacts": [],
                        "language": "en",
                        "is_active": True,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    })
            print("✅ Predefined Demo Accounts seeded in MongoDB (Auth)")
        except Exception as e:
            print(f"❌ Failed to seed MongoDB: {e}")

# Run seeding
seed_users()


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "")
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "citizen")
    phone = data.get("phone", "")
    emergency_contacts = data.get("emergency_contacts", [])
    language = data.get("language", "en")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if role not in ["citizen", "rescuer", "government", "admin"]:
        return jsonify({"error": "Invalid role specified"}), 400

    # Check database or in-memory
    exists = False
    if users_collection is not None:
        try:
            exists = users_collection.find_one({"email": email}) is not None
        except Exception:
            exists = email in IN_MEMORY_USERS
    else:
        exists = email in IN_MEMORY_USERS

    if exists:
        return jsonify({"error": "User already exists"}), 409

    user_id = str(uuid.uuid4())
    password_hash = hash_password(password)

    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "role": role,
        "phone": phone,
        "emergency_contacts": emergency_contacts,
        "language": language,
        "is_active": True,
    }

    if users_collection is not None:
        try:
            user_db = user.copy()
            user_db["created_at"] = datetime.now(timezone.utc).isoformat()
            user_db["updated_at"] = datetime.now(timezone.utc).isoformat()
            users_collection.insert_one(user_db)
        except Exception as e:
            print(f"MongoDB write failed during register, using in-memory: {e}")
            IN_MEMORY_USERS[email] = user
    else:
        IN_MEMORY_USERS[email] = user

    # Remove sensitive hash from response
    user_resp = user.copy()
    user_resp.pop("password_hash", None)

    # Embed email and role in the JWT claims
    token = create_access_token(
        identity=user_id,
        additional_claims={"role": role, "email": email},
        expires_delta=timedelta(days=30)
    )
    return jsonify({"user": user_resp, "token": token}), 201


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = None
    if users_collection is not None:
        try:
            user = users_collection.find_one({"email": email})
            # Convert ObjectId to string if present
            if user:
                user["_id"] = str(user["_id"])
        except Exception as e:
            print(f"MongoDB fetch failed during login: {e}")
            user = IN_MEMORY_USERS.get(email)
    else:
        user = IN_MEMORY_USERS.get(email)

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Remove sensitive hash from response
    user_resp = user.copy()
    user_resp.pop("password_hash", None)
    user_resp.pop("_id", None)

    role = user.get("role", "citizen")

    # Embed email and role in the JWT claims
    token = create_access_token(
        identity=user["id"],
        additional_claims={"role": role, "email": email},
        expires_delta=timedelta(days=30)
    )
    return jsonify({"user": user_resp, "token": token})


@auth_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = None

    if users_collection is not None:
        try:
            user = users_collection.find_one({"id": user_id})
            if user:
                user["_id"] = str(user["_id"])
        except Exception as e:
            print(f"MongoDB fetch failed in auth/me: {e}")
            user = None

    if not user:
        for u in IN_MEMORY_USERS.values():
            if u["id"] == user_id:
                user = u
                break

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_resp = user.copy()
    user_resp.pop("password_hash", None)
    user_resp.pop("_id", None)
    return jsonify(user_resp)
