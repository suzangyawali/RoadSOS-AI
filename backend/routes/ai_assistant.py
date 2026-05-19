import os
from flask import Blueprint, request, jsonify

ai_bp = Blueprint("ai", __name__)

OFFLINE_RESPONSES = {
    "first_aid": [
        "Stay calm. Help is being arranged.",
        "Do NOT move the victim unless there is immediate danger (fire, traffic).",
        "Check if the victim is breathing. If not, begin CPR if you are trained.",
        "Apply pressure to any bleeding wounds using a clean cloth.",
        "Keep the victim warm with a blanket or jacket.",
        "Do NOT remove a helmet if the victim is wearing one.",
        "If the victim is conscious, keep them talking and reassured.",
    ],
    "emergency_numbers": {
        "ambulance": "108",
        "police": "100",
        "fire": "101",
        "women_helpline": "1091",
        "national_emergency": "112",
    },
    "severity_guidance": {
        "HIGH": "This appears to be a HIGH severity accident. Do NOT move the victim. Call 108 immediately. Keep the area clear for emergency vehicles.",
        "MEDIUM": "This appears to be a MEDIUM severity accident. Check for injuries. Apply first aid if possible. Call 108 for ambulance assistance.",
        "LOW": "This appears to be a LOW severity accident. Check for minor injuries. Exchange information with other parties. File a police report if needed.",
    },
}


@ai_bp.route("/ai/chat", methods=["POST"])
def ai_chat():
    data = request.get_json() or {}
    message = data.get("message", "")
    language = data.get("language", "en")
    context = data.get("context", {})

    api_key = os.getenv("OPENAI_API_KEY", "")

    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)

            system_prompt = (
                "You are RoadSOS AI, an emergency response assistant for road accidents. "
                "Provide calm, clear, and actionable emergency guidance. "
                "Focus on: first-aid instructions, emergency numbers, keeping the caller calm, "
                "and practical steps they can take immediately. "
                "Be concise and direct — this is an emergency situation. "
                f"Respond in {'Hindi' if language == 'hi' else 'Tamil' if language == 'ta' else 'Telugu' if language == 'te' else 'Nepali' if language == 'ne' else 'English'}."
            )

            if context.get("severity"):
                system_prompt += f" The accident severity has been assessed as: {context['severity']}."
            if context.get("latitude") and context.get("longitude"):
                system_prompt += f" User location: {context['latitude']}, {context['longitude']}."

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                max_tokens=300,
                temperature=0.7,
            )

            return jsonify({
                "response": response.choices[0].message.content,
                "mode": "online",
                "language": language,
            })
        except Exception as e:
            return _offline_response(message)
    else:
        return _offline_response(message)


def _offline_response(message: str):
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["first aid", "help", "bleeding", "injury", "hurt"]):
        return jsonify({
            "response": "\n".join(f"• {tip}" for tip in OFFLINE_RESPONSES["first_aid"]),
            "mode": "offline",
        })

    if any(w in msg_lower for w in ["number", "call", "phone", "ambulance", "police"]):
        numbers = OFFLINE_RESPONSES["emergency_numbers"]
        lines = [f"• {k.replace('_', ' ').title()}: {v}" for k, v in numbers.items()]
        return jsonify({
            "response": "Emergency Numbers:\n" + "\n".join(lines),
            "mode": "offline",
        })

    if any(w in msg_lower for w in ["severe", "severity", "bad", "serious"]):
        return jsonify({
            "response": OFFLINE_RESPONSES["severity_guidance"]["HIGH"],
            "mode": "offline",
        })

    return jsonify({
        "response": (
            "I'm here to help. In an emergency:\n"
            "• Call 112 (National Emergency)\n"
            "• Call 108 (Ambulance)\n"
            "• Stay calm and keep the victim still\n"
            "• Apply pressure to any bleeding\n"
            "• Help is on the way"
        ),
        "mode": "offline",
    })


@ai_bp.route("/ai/offline-data", methods=["GET"])
def offline_data():
    return jsonify(OFFLINE_RESPONSES)
