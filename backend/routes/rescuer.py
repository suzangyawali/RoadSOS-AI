from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from auth_decorators import role_required, get_current_identity_fallback
from routes.emergency import emergencies_collection, IN_MEMORY_EMERGENCIES

rescuer_bp = Blueprint("rescuer", __name__)

@rescuer_bp.route("/rescuer/emergencies", methods=["GET"])
@role_required(["rescuer", "admin"])
def get_rescuer_emergencies():
    """
    Returns active emergencies for rescuers.
    """
    try:
        if emergencies_collection is not None:
            db_emergencies = list(emergencies_collection.find({}, {"_id": 0}))
            # Merge with in-memory to ensure both are synced
            merged = {e["id"]: e for e in (IN_MEMORY_EMERGENCIES + db_emergencies)}
            return jsonify(list(merged.values()))
        else:
            return jsonify(IN_MEMORY_EMERGENCIES)
    except Exception as e:
        return jsonify({"error": "Failed to fetch emergencies", "details": str(e)}), 500


@rescuer_bp.route("/rescuer/resolve/<session_id>", methods=["PATCH"])
@role_required(["rescuer", "admin"])
def resolve_rescuer_emergency(session_id):
    """
    Marks an emergency incident as resolved.
    """
    updated_in_db = False
    updated_in_mem = False
    
    # 1. Update in MongoDB
    if emergencies_collection is not None:
        try:
            res = emergencies_collection.update_one(
                {"id": session_id},
                {"$set": {"status": "RESOLVED", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            if res.modified_count > 0:
                updated_in_db = True
        except Exception as e:
            print(f"MongoDB resolve failed: {e}")

    # 2. Update in memory database
    for inc in IN_MEMORY_EMERGENCIES:
        if inc["id"] == session_id:
            inc["status"] = "RESOLVED"
            inc["updated_at"] = datetime.now(timezone.utc).isoformat()
            updated_in_mem = True
            break
            
    if updated_in_db or updated_in_mem:
        return jsonify({
            "status": "success",
            "message": f"Incident {session_id} marked as RESOLVED successfully."
        })
    else:
        return jsonify({"error": "Incident not found"}), 404


@rescuer_bp.route("/rescuer/assign", methods=["POST"])
@role_required(["rescuer", "admin"])
def assign_rescuer_emergency():
    """
    Assigns an incident to a rescuer.
    """
    data = request.get_json() or {}
    session_id = data.get("incident_id")
    rescuer_id = get_current_identity_fallback()

    if not session_id:
        return jsonify({"error": "Missing incident_id"}), 400

    updated = False
    
    # Update in MongoDB
    if emergencies_collection is not None:
        try:
            res = emergencies_collection.update_one(
                {"id": session_id},
                {"$set": {
                    "assigned_to": rescuer_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            if res.modified_count > 0:
                updated = True
        except Exception as e:
            print(f"MongoDB assignment failed: {e}")

    # Update in-memory
    for inc in IN_MEMORY_EMERGENCIES:
        if inc["id"] == session_id:
            inc["assigned_to"] = rescuer_id
            inc["updated_at"] = datetime.now(timezone.utc).isoformat()
            updated = True
            break

    if updated:
        return jsonify({
            "status": "success",
            "message": f"Incident {session_id} assigned to rescuer {rescuer_id}."
        })
    else:
        return jsonify({"error": "Incident not found"}), 404
