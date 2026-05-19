import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "roadsos-dev-secret-key-change-in-prod")
    app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")
    app.config["TWILIO_ACCOUNT_SID"] = os.getenv("TWILIO_ACCOUNT_SID", "")
    app.config["TWILIO_AUTH_TOKEN"] = os.getenv("TWILIO_AUTH_TOKEN", "")
    app.config["TWILIO_PHONE_NUMBER"] = os.getenv("TWILIO_PHONE_NUMBER", "")
    app.config["MONGODB_URI"] = os.getenv("MONGODB_URI", "mongodb://localhost:27017/roadsos")

    CORS(app, resources={r"/api/*": {"origins": "*"}})
    JWTManager(app)

    from routes.emergency import emergency_bp
    from routes.hospitals import hospitals_bp
    from routes.ai_assistant import ai_bp
    from routes.severity import severity_bp
    from routes.analytics import analytics_bp
    from routes.auth import auth_bp

    app.register_blueprint(emergency_bp, url_prefix="/api")
    app.register_blueprint(hospitals_bp, url_prefix="/api")
    app.register_blueprint(ai_bp, url_prefix="/api")
    app.register_blueprint(severity_bp, url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "RoadSOS AI Backend"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
