import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from models import init_db
from auth import auth_bp
from admin import admin_bp

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

    init_db()

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
