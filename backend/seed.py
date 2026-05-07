import os
from dotenv import load_dotenv
load_dotenv()

import bcrypt
from models import init_db, get_user_by_username, create_user
from encryption import encrypt
import sqlite3

def seed():
    init_db()
    users = [
        ("admin", "admin123", "admin", "admin@imdb-dashboard.com"),
        ("user1", "user123", "user", "user1@imdb-dashboard.com"),
    ]
    for username, password, role, email in users:
        if get_user_by_username(username):
            print(f"{username} already exists, skipping")
            continue
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=12)).decode()
        create_user(username, hashed, role)
        enc = encrypt(email)
        conn = sqlite3.connect("users.db")
        conn.execute("UPDATE users SET email_enc=? WHERE username=?", (enc, username))
        conn.commit()
        conn.close()
        print(f"Created: {username} ({role})")

if __name__ == "__main__":
    seed()
