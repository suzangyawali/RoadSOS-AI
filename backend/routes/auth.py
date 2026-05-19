import uuid
from datetime import timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

auth_bp = Blueprint("auth", __name__)

users_db: dict[str, dict] = {}


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "")
    email = data.get("email", "")
    phone = data.get("phone", "")
    emergency_contacts = data.get("emergency_contacts", [])
    language = data.get("language", "en")

    if not name or not email:
        return jsonify({"error": "Name and email are required"}), 400

    if email in users_db:
        return jsonify({"error": "User already exists"}), 409

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "name": name,
        "email": email,
        "phone": phone,
        "emergency_contacts": emergency_contacts,
        "language": language,
    }
    users_db[email] = user

    token = create_access_token(identity=user_id, expires_delta=timedelta(days=30))
    return jsonify({"user": user, "token": token}), 201


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "")

    user = users_db.get(email)
    if not user:
        user_id = str(uuid.uuid4())
        user = {"id": user_id, "name": email.split("@")[0], "email": email}
        users_db[email] = user

    token = create_access_token(identity=user["id"], expires_delta=timedelta(days=30))
    return jsonify({"user": user, "token": token})


@auth_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()
    for user in users_db.values():
        if user["id"] == user_id:
            return jsonify(user)
    return jsonify({"error": "User not found"}), 404
