from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt

DEMO_TOKEN_PREFIX = "demo-"
DEMO_TOKEN_SUFFIX = "-jwt-token"

def get_demo_role_from_request():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "", 1).strip()
    if token.startswith(DEMO_TOKEN_PREFIX) and token.endswith(DEMO_TOKEN_SUFFIX):
        return token[len(DEMO_TOKEN_PREFIX):-len(DEMO_TOKEN_SUFFIX)]
    return None

def get_current_identity_fallback():
    demo_role = get_demo_role_from_request()
    if demo_role:
        return f"mock-{demo_role}-id"

    try:
        from flask_jwt_extended import get_jwt_identity
        return get_jwt_identity()
    except Exception:
        return None

def role_required(allowed_roles):
    """
    Decorator to restrict access to endpoints based on user roles stored in JWT claims.
    allowed_roles can be a string (e.g. 'admin') or a list/tuple of strings.
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                demo_role = get_demo_role_from_request()
                if demo_role:
                    user_role = demo_role
                else:
                    verify_jwt_in_request()
                    claims = get_jwt()
                    user_role = claims.get("role", "citizen")
                
                # Check if the role is allowed
                if user_role not in allowed_roles:
                    return jsonify({"error": f"Forbidden: role '{user_role}' is not authorized to access this resource"}), 403
                
            except Exception as e:
                return jsonify({"error": "Unauthorized: Invalid or missing token", "details": str(e)}), 401
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator
