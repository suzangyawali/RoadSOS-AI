import random
from flask import Blueprint, jsonify

analytics_bp = Blueprint("analytics", __name__)


@analytics_bp.route("/analytics/hotspots", methods=["GET"])
def hotspots():
    hotspot_data = [
        {"latitude": 28.6139, "longitude": 77.2090, "intensity": 0.9, "accidents": 45, "name": "Connaught Place"},
        {"latitude": 28.5355, "longitude": 77.2410, "intensity": 0.8, "accidents": 38, "name": "Nehru Place"},
        {"latitude": 28.6692, "longitude": 77.4538, "intensity": 0.7, "accidents": 32, "name": "NH-24 Ghaziabad"},
        {"latitude": 28.4089, "longitude": 77.3178, "intensity": 0.85, "accidents": 41, "name": "Faridabad Highway"},
        {"latitude": 28.5672, "longitude": 77.3219, "intensity": 0.6, "accidents": 25, "name": "Mayur Vihar"},
        {"latitude": 28.7041, "longitude": 77.1025, "intensity": 0.75, "accidents": 35, "name": "GT Karnal Road"},
        {"latitude": 28.4595, "longitude": 77.0266, "intensity": 0.65, "accidents": 28, "name": "Gurgaon-Delhi Expressway"},
        {"latitude": 28.6289, "longitude": 77.3649, "intensity": 0.55, "accidents": 22, "name": "Anand Vihar"},
    ]
    return jsonify(hotspot_data)


@analytics_bp.route("/analytics/stats", methods=["GET"])
def stats():
    monthly_data = []
    for month in ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]:
        monthly_data.append({
            "month": month,
            "total_accidents": random.randint(80, 200),
            "high_severity": random.randint(15, 50),
            "medium_severity": random.randint(30, 80),
            "low_severity": random.randint(20, 70),
            "fatalities": random.randint(2, 15),
            "avg_response_time_min": round(random.uniform(8, 25), 1),
        })

    return jsonify({
        "monthly": monthly_data,
        "summary": {
            "total_accidents_ytd": sum(m["total_accidents"] for m in monthly_data),
            "total_fatalities_ytd": sum(m["fatalities"] for m in monthly_data),
            "avg_response_time": round(sum(m["avg_response_time_min"] for m in monthly_data) / 12, 1),
            "most_dangerous_time": "6:00 PM - 9:00 PM",
            "most_dangerous_day": "Saturday",
        },
    })


@analytics_bp.route("/analytics/severity-distribution", methods=["GET"])
def severity_distribution():
    return jsonify([
        {"severity": "HIGH", "count": random.randint(100, 200), "percentage": 28},
        {"severity": "MEDIUM", "count": random.randint(200, 350), "percentage": 42},
        {"severity": "LOW", "count": random.randint(150, 250), "percentage": 30},
    ])
