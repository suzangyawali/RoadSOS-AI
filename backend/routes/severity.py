import random
from flask import Blueprint, request, jsonify

severity_bp = Blueprint("severity", __name__)


@severity_bp.route("/severity/predict", methods=["POST"])
def predict_severity():
    if "image" not in request.files:
        data = request.get_json() or {}
        if "image_url" not in data:
            return jsonify({"error": "No image provided"}), 400

    severity_classes = ["LOW", "MEDIUM", "HIGH"]
    weights = [0.2, 0.3, 0.5]
    predicted = random.choices(severity_classes, weights=weights, k=1)[0]

    confidence_ranges = {
        "LOW": (0.70, 0.85),
        "MEDIUM": (0.75, 0.90),
        "HIGH": (0.85, 0.97),
    }
    conf_range = confidence_ranges[predicted]
    confidence = round(random.uniform(*conf_range), 2)

    response_actions = {
        "LOW": [
            "Exchange insurance information",
            "Document the scene with photos",
            "File a police report if needed",
            "Check for minor injuries",
        ],
        "MEDIUM": [
            "Call 108 for ambulance",
            "Apply first aid if trained",
            "Do not move seriously injured persons",
            "Keep the area safe for other traffic",
        ],
        "HIGH": [
            "CALL 108 IMMEDIATELY",
            "Do NOT move any victims",
            "Keep the area clear for emergency vehicles",
            "Apply pressure to bleeding wounds",
            "Begin CPR if victim is not breathing and you are trained",
        ],
    }

    return jsonify({
        "severity": predicted,
        "confidence": confidence,
        "recommended_actions": response_actions[predicted],
        "emergency_escalation": predicted == "HIGH",
        "model": "YOLOv8-severity-v1 (simulated)",
    })
