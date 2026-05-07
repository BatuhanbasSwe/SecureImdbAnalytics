import os
import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import Blueprint, request, jsonify
from models import get_user_by_username, create_user, update_email_enc, update_user_lockout
from encryption import encrypt, decrypt

auth_bp = Blueprint("auth", __name__)

def get_secret():
    return os.environ.get("JWT_SECRET", "fallback-secret")

def make_token(username, role):
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)
    }
    return jwt.encode(payload, get_secret(), algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401
        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, get_secret(), algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        # Real-time ban check — banning takes effect immediately
        user_row = get_user_by_username(payload["sub"])
        if not user_row or user_row.get("is_banned"):
            return jsonify({"error": "Account suspended"}), 403
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.current_user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    user = get_user_by_username(username)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get("is_banned"):
        return jsonify({"error": "Account suspended. Contact administrator."}), 403

    locked_until = user.get("locked_until")
    if locked_until:
        try:
            lock_dt = datetime.fromisoformat(locked_until)
            if lock_dt.tzinfo is None:
                lock_dt = lock_dt.replace(tzinfo=timezone.utc)
            now = datetime.now(timezone.utc)
            if now < lock_dt:
                remaining = max(1, int((lock_dt - now).total_seconds() / 60) + 1)
                return jsonify({"error": f"Account locked. Try again in {remaining} minute(s)."}), 429
        except Exception:
            pass

    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        new_attempts = (user.get("failed_attempts") or 0) + 1
        if new_attempts >= 5:
            lock_time = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            update_user_lockout(user["id"], new_attempts, lock_time)
        else:
            update_user_lockout(user["id"], new_attempts, user.get("locked_until"))
        return jsonify({"error": "Invalid credentials"}), 401

    # Successful login — reset lockout counter
    update_user_lockout(user["id"], 0, None)
    token = make_token(user["username"], user["role"])
    return jsonify({"token": token, "role": user["role"], "username": user["username"]})

def validate_password(password):
    import re
    missing = []
    if len(password) < 8:
        missing.append("en az 8 karakter")
    if not re.search(r'[A-Z]', password):
        missing.append("büyük harf (A-Z)")
    if not re.search(r'[a-z]', password):
        missing.append("küçük harf (a-z)")
    if not re.search(r'[0-9]', password):
        missing.append("rakam (0-9)")
    if not re.search(r'[^A-Za-z0-9]', password):
        missing.append("özel karakter (!@#...)")
    return missing

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "")
    password = data.get("password", "")
    email    = data.get("email", "").strip()
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    missing = validate_password(password)
    if missing:
        return jsonify({"error": f"Şifre gereksinimleri karşılanmadı: {', '.join(missing)}"}), 400
    if get_user_by_username(username):
        return jsonify({"error": "Username already taken"}), 409
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
    create_user(username, hashed)
    if email:
        enc = encrypt(email)
        update_email_enc(username, enc)
    return jsonify({"message": "User created"}), 201

@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    user = get_user_by_username(request.current_user["sub"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"username": user["username"], "role": user["role"]})

@auth_bp.route("/email", methods=["PUT"])
@token_required
def set_email():
    data = request.get_json()
    email = data.get("email", "")
    if not email:
        return jsonify({"error": "Email required"}), 400
    enc = encrypt(email)
    update_email_enc(request.current_user["sub"], enc)
    return jsonify({"message": "Email saved (encrypted)"})

@auth_bp.route("/email", methods=["GET"])
@token_required
def get_email():
    user = get_user_by_username(request.current_user["sub"])
    if not user or not user.get("email_enc"):
        return jsonify({"email": None})
    return jsonify({"email": decrypt(user["email_enc"])})

@auth_bp.route("/email-raw", methods=["GET"])
@token_required
def get_email_raw():
    """Returns the raw Fernet-encrypted email token — used to demonstrate encryption in the UI."""
    user = get_user_by_username(request.current_user["sub"])
    if not user or not user.get("email_enc"):
        return jsonify({"email_enc": None})
    return jsonify({"email_enc": user["email_enc"]})
