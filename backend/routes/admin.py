from flask import Blueprint, request, jsonify
from auth_decorators import role_required
from datetime import datetime, timezone
from routes.auth import users_collection, IN_MEMORY_USERS

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/users", methods=["GET"])
@role_required("admin")
def get_admin_users():
    """
    Returns lists of all registered users (excluding password hashes).
    """
    users_list = []
    
    # 1. Fetch from MongoDB
    if users_collection is not None:
        try:
            db_users = list(users_collection.find({}, {"_id": 0, "password_hash": 0}))
            users_list.extend(db_users)
        except Exception as e:
            print(f"MongoDB fetch users failed: {e}")

    # 2. Fetch from in-memory (and merge unique by email)
    seen_emails = {u["email"] for u in users_list}
    for email, user in IN_MEMORY_USERS.items():
        if email not in seen_emails:
            cleaned_user = user.copy()
            cleaned_user.pop("password_hash", None)
            users_list.append(cleaned_user)

    return jsonify(users_list)


@admin_bp.route("/admin/users/<user_id>/role", methods=["PATCH"])
@role_required("admin")
def patch_user_role(user_id):
    """
    Modifies a user's role.
    """
    data = request.get_json() or {}
    new_role = data.get("role")

    if new_role not in ["citizen", "rescuer", "government", "admin"]:
        return jsonify({"error": "Invalid role specified"}), 400

    updated = False
    
    # 1. Update in MongoDB
    if users_collection is not None:
        try:
            res = users_collection.update_one(
                {"id": user_id},
                {"$set": {"role": new_role, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            if res.modified_count > 0:
                updated = True
        except Exception as e:
            print(f"MongoDB role update failed: {e}")

    # 2. Update in memory
    for email, u in IN_MEMORY_USERS.items():
        if u["id"] == user_id:
            u["role"] = new_role
            updated = True
            break

    if updated:
        return jsonify({
            "status": "success",
            "message": f"User {user_id} role updated to {new_role} successfully."
        })
    else:
        return jsonify({"error": "User not found"}), 404


@admin_bp.route("/admin/logs", methods=["GET"])
@role_required("admin")
def get_system_logs():
    """
    Returns realistic system audit logs.
    """
    logs = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "module": "AUTH",
            "message": "Admin user retrieved system health status."
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "WARNING",
            "module": "SECURITY",
            "message": "Access permitted to government analytics via simulated demo token."
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "module": "DATABASE",
            "message": "MongoDB heartbeat connection verified successfully."
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "module": "SOS_DISPATCH",
            "message": "Active incident dispatch request generated for coordinates (28.7041, 77.1025)."
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "module": "TWILIO",
            "message": "SMS alert broadcast successfully completed via backup gateway."
        },
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "module": "OFFLINE_BLE",
            "message": "BLE Simulation mesh payload packets successfully parsed and synced."
        }
    ]
    return jsonify(logs)
