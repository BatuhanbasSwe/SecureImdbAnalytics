from flask import Blueprint, jsonify, request
from auth import token_required, admin_required
from models import get_all_users, update_user_role, get_user_by_id, update_user_ban, update_user_lockout, log_action, get_audit_logs
from encryption import decrypt

admin_bp = Blueprint("admin", __name__)

def mask_email(email):
    if not email:
        return '—'
    total = len(email)
    if total <= 5:
        return '***'
    return email[:2] + '***' + email[-3:]

def mask_password(_hash_str):
    return '••••••••'

@admin_bp.route("/users", methods=["GET"])
@token_required
@admin_required
def list_users():
    users = get_all_users()
    result = []
    for u in users:
        email = None
        if u.get("email_enc"):
            try:
                email = decrypt(u["email_enc"])
            except Exception:
                email = None
        raw_enc = u.get("email_enc") or ""
        result.append({
            "id": u["id"],
            "username": u["username"],
            "role": u["role"],
            "masked_email": mask_email(email) if email else "—",
            "email_enc_preview": (raw_enc[:28] + "…") if raw_enc else None,
            "masked_password": mask_password(u.get("password_hash", "")),
            "created_at": u.get("created_at") or "—",
            "is_banned": bool(u.get("is_banned", 0)),
            "failed_attempts": u.get("failed_attempts", 0) or 0,
            "locked_until": u.get("locked_until"),
        })
    return jsonify(result)

@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
@token_required
@admin_required
def change_role(user_id):
    data = request.get_json()
    role = data.get("role", "")
    if role not in ("admin", "user"):
        return jsonify({"error": "Role must be 'admin' or 'user'"}), 400
    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    update_user_role(user_id, role)
    log_action(request.current_user["sub"], "role_change", target["username"], f"role -> {role}")
    return jsonify({"message": "Role updated"})

@admin_bp.route("/users/<int:user_id>/ban", methods=["PUT"])
@token_required
@admin_required
def ban_user(user_id):
    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    if target["username"] == request.current_user["sub"]:
        return jsonify({"error": "Cannot ban yourself"}), 400
    update_user_ban(user_id, 1)
    log_action(request.current_user["sub"], "ban", target["username"])
    return jsonify({"message": "User banned"})

@admin_bp.route("/users/<int:user_id>/unban", methods=["PUT"])
@token_required
@admin_required
def unban_user(user_id):
    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    update_user_ban(user_id, 0)
    log_action(request.current_user["sub"], "unban", target["username"])
    return jsonify({"message": "User unbanned"})

@admin_bp.route("/users/<int:user_id>/unlock", methods=["PUT"])
@token_required
@admin_required
def unlock_user(user_id):
    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404
    update_user_lockout(user_id, 0, None)
    log_action(request.current_user["sub"], "unlock", target["username"], "manual unlock by admin")
    return jsonify({"message": "Account unlocked"})

@admin_bp.route("/audit-logs", methods=["GET"])
@token_required
@admin_required
def list_audit_logs():
    logs = get_audit_logs(limit=100)
    return jsonify(logs)
