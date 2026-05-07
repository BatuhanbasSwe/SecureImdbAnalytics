import sqlite3

DB_PATH = "users.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                email_enc TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        for col_sql in [
            "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))",
            "ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN locked_until TEXT",
        ]:
            try:
                conn.execute(col_sql)
            except Exception:
                pass

        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_username TEXT NOT NULL,
                action         TEXT NOT NULL,
                target_user    TEXT,
                details        TEXT,
                timestamp      TEXT DEFAULT (datetime('now'))
            )
        """)
        conn.commit()
    finally:
        conn.close()

def get_user_by_username(username):
    conn = get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def get_user_by_id(user_id):
    conn = get_conn()
    try:
        row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def create_user(username, password_hash, role="user"):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            (username, password_hash, role)
        )
        conn.commit()
    finally:
        conn.close()

def update_email_enc(username, email_enc):
    conn = get_conn()
    try:
        conn.execute("UPDATE users SET email_enc=? WHERE username=?", (email_enc, username))
        conn.commit()
    finally:
        conn.close()

def get_all_users():
    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT id, username, role, email_enc, password_hash, created_at, is_banned, failed_attempts, locked_until FROM users"
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()

def update_user_role(user_id, role):
    conn = get_conn()
    try:
        conn.execute("UPDATE users SET role=? WHERE id=?", (role, user_id))
        conn.commit()
    finally:
        conn.close()

def update_user_ban(user_id, is_banned):
    conn = get_conn()
    try:
        conn.execute("UPDATE users SET is_banned=? WHERE id=?", (is_banned, user_id))
        conn.commit()
    finally:
        conn.close()

def update_user_lockout(user_id, failed_attempts, locked_until):
    conn = get_conn()
    try:
        conn.execute(
            "UPDATE users SET failed_attempts=?, locked_until=? WHERE id=?",
            (failed_attempts, locked_until, user_id)
        )
        conn.commit()
    finally:
        conn.close()

def log_action(admin_username, action, target_user, details=""):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO audit_logs (admin_username, action, target_user, details) VALUES (?,?,?,?)",
            (admin_username, action, target_user, details)
        )
        conn.commit()
    finally:
        conn.close()

def get_audit_logs(limit=100):
    conn = get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
