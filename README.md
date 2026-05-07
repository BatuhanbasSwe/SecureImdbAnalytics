# Secure IMDB Analytics Dashboard

> **SWE210 — Software Security Course Project**
> A full-stack secure web application that combines IMDB data analytics, role-based access control, encrypted personal data storage, an admin moderation panel, and a movie trivia mini-game.

---

## Table of Contents

1. [Overview](#overview)
2. [Security Features](#security-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Running the Application](#running-the-application)
7. [Default Users](#default-users)
8. [Application Walkthrough](#application-walkthrough)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Security Architecture Deep Dive](#security-architecture-deep-dive)
12. [Mini Game: This or That](#mini-game-this-or-that)
13. [Refreshing the Dataset](#refreshing-the-dataset)
14. [Troubleshooting](#troubleshooting)

---

## Overview

This project implements a secure web application that serves as an analytics dashboard for **228 curated IMDB titles** (192 movies + 36 TV shows) across 18 genres. Beyond the analytics layer, the system demonstrates the four core pillars of application security required by the SWE210 course:

- **Authentication** — JWT + bcrypt password hashing
- **Authorization (RBAC)** — admin/user roles enforced by Flask decorators and React route guards
- **Data Encryption** — Fernet (AES-128-CBC + HMAC-SHA256) for personal e-mail at rest
- **Account Lifecycle Controls** — registration, banning, account lockout, and a full audit log

The dashboard itself surfaces interactive analytics: a box-and-whisker rating distribution, a Rating-vs-Metascore scatter chart with anomaly detection, a top-12 genre histogram, and a sortable + filterable + paginated record table with CSV export. A bonus "This or That" trivia mini-game tests how well a user knows IMDB statistics.

### Objectives

- Apply industry-standard security primitives (bcrypt, JWT, Fernet, parameterized queries) in a real application.
- Demonstrate defence-in-depth: server-side validation runs alongside client-side UX checks.
- Provide a professor-ready demo with visible cryptographic artifacts (raw ciphertext shown next to plaintext on the Profile page).
- Show that access control extends beyond simple role checks — it includes banning, lockouts, and auditing.

---

## Security Features

| Layer | Mechanism | Where it lives |
|-------|-----------|----------------|
| Password storage | **bcrypt** with 12 rounds (cost factor) | `backend/auth.py` register/login |
| Password complexity | 8+ chars, upper, lower, digit, special — checked on **both** client and server | `RegisterPage.js` + `auth.py::validate_password` |
| Session token | **JWT** signed with HS256, 1-hour expiry | `backend/auth.py::make_token` |
| Real-time revocation | Every protected request re-checks DB ban flag — banned users invalidated instantly | `backend/auth.py::token_required` |
| Authorization | `@token_required` + `@admin_required` decorators | `backend/auth.py`, `backend/admin.py` |
| Frontend route guard | `<ProtectedRoute>` redirects unauthenticated/unauthorised users | `frontend/src/components/ProtectedRoute.js` |
| Sensitive-data encryption | **Fernet** (AES-128-CBC + HMAC-SHA256) for e-mail | `backend/encryption.py` |
| Account ban | Admin can ban a user — they cannot log in or use existing tokens | `backend/admin.py::ban_user` |
| Account lockout | After 5 failed logins, account is locked for 15 minutes | `backend/auth.py::login` |
| Audit log | Every admin action (ban, unban, unlock, role change) is logged with timestamp | `backend/admin.py::log_action` |
| SQL injection prevention | All DB calls use parameterized queries (`?` placeholders) | `backend/models.py` |
| Secret management | `.env` with JWT secret + Fernet key + OMDb key, never committed | `.gitignore`, `.env.example` |

---

## Tech Stack

**Backend**
- Python 3.10+
- [Flask](https://flask.palletsprojects.com/) + Flask-CORS
- [PyJWT](https://pyjwt.readthedocs.io/) for token signing
- [bcrypt](https://pypi.org/project/bcrypt/) for password hashing
- [cryptography](https://cryptography.io/) (Fernet) for symmetric encryption
- SQLite (via stdlib `sqlite3`)

**Frontend**
- React 19
- React Router v7
- Recharts (charts: ComposedChart, ScatterChart, BarChart)
- Lucide-React (icons)
- Axios (HTTP)

**External services**
- [OMDb API](https://www.omdbapi.com/) — used once to fetch movie posters into the static dataset

---

## Project Structure

```
.
├── backend/
│   ├── app.py                # Flask app factory, registers blueprints
│   ├── auth.py               # Auth blueprint: login, register, JWT, password rules
│   ├── admin.py              # Admin blueprint: user list, ban, unban, unlock, audit log
│   ├── models.py             # SQLite helpers + schema migrations
│   ├── encryption.py         # Fernet encrypt/decrypt wrappers
│   ├── seed.py               # Seeds default admin + user1 accounts
│   ├── generate_env.py       # Generates a fresh JWT_SECRET and FERNET_KEY into .env
│   ├── generate_movies.py    # Builds movies_final.json from a curated list with anomaly flags
│   ├── fetch_posters.py      # Augments movies_final.json with OMDb poster URLs
│   ├── requirements.txt
│   └── .env.example          # Documented template — copy to .env
│
├── frontend/
│   ├── public/
│   │   └── movies_final.json # 228 IMDB records with poster URLs and anomaly flags
│   └── src/
│       ├── App.js            # Main dashboard: charts, filters, table, CSV export
│       ├── AppRoutes.js      # Route definitions with ProtectedRoute guards
│       ├── context/AuthContext.js   # Auth state + axios header injection
│       ├── components/ProtectedRoute.js
│       └── pages/
│           ├── LoginPage.js
│           ├── RegisterPage.js   # Live password-strength checker
│           ├── AdminPanel.js     # User registry + ban/unlock + audit log
│           ├── ProfilePage.js    # Encryption demo: plaintext vs ciphertext side-by-side
│           └── GamePage.js       # This-or-That trivia game
│
├── .gitignore
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.10 or newer
- Node.js 18 or newer
- npm

### 1. Clone the repo
```bash
git clone https://github.com/BatuhanbasSwe/SecureImdbAnalytics.git
cd SecureImdbAnalytics
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

### 3. Generate secrets

```bash
cp .env.example .env             # Or: copy .env.example .env  (Windows)
python generate_env.py           # Writes fresh JWT_SECRET + FERNET_KEY to .env
```

Then open `backend/.env` and add your OMDb API key (free at https://www.omdbapi.com/apikey.aspx):
```
OMDB_API_KEY=your_omdb_key_here
```

> **Note:** OMDB_API_KEY is only needed if you want to re-fetch movie posters via `fetch_posters.py`. The dataset already ships with poster URLs, so you can skip this for normal use.

### 4. Seed default users

```bash
python seed.py
```

This creates `admin` and `user1` with the encrypted e-mails baked in.

### 5. Frontend setup

```bash
cd ../frontend
npm install
```

---

## Running the Application

You need two terminals.

**Terminal 1 — backend:**
```bash
cd backend
.venv\Scripts\activate
python app.py
# Flask runs on http://localhost:5000
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm start
# React dev server opens http://localhost:3000
```

---

## Default Users

| Username | Password | Role | E-mail (decrypted) |
|----------|----------|------|--------------------|
| `admin`  | `admin123` | admin | admin@imdb-dashboard.com |
| `user1`  | `user123`  | user  | user1@imdb-dashboard.com |

These are seeded by `python seed.py`. The login page shows quick-fill chips for both.

---

## Application Walkthrough

### Login Page (`/login`)
Username + password form with quick-fill credentials. On submit, the backend issues a JWT containing `{ sub, role, exp }`. The token is stored in `localStorage` and attached to every subsequent request via Axios.

### Register Page (`/register`)
Live password-strength checker — five rules (length, uppercase, lowercase, digit, special) light up green as you type. Server enforces the same rules; client-only validation can never be bypassed because the server returns a Turkish-language error listing the missing requirements.

The e-mail is **encrypted with Fernet** before being persisted.

### Dashboard (`/`)
- **Stat cards**: Movies, TV shows, anomalies (% of total), average rating
- **Filters**: pill buttons for Movie / TV / Anomaly toggle, search (title/year/genre), genre dropdown
- **Box-and-whisker chart**: rating distribution with Q1, median, Q3, IQR, mean
- **Scatter chart**: Rating vs Metascore — anomalies in coral, normals in iris
- **Genre histogram**: top-12 genres by count, horizontal bar chart
- **Item table**: sortable columns (Title/Year/Rating/Metascore/Duration/Anomaly), pagination, page-size selector, **CSV export**
- Header buttons: Admin Panel (admins only), Game, Profile, Sign out

### Profile Page (`/profile`)
**This is the encryption demo for the report.** Three cards:

1. **Identity** — username, role badge
2. **E-posta Şifrelemesi** — the centrepiece:
   - Decrypted plaintext (teal)
   - Encrypted Fernet token with show/hide toggle (purple, monospace)
   - Plaintext → Fernet.encrypt() → Ciphertext flow diagram
   - Form to update e-mail (re-encrypts on submit)
3. **Güvenlik Özeti** — at-a-glance summary of bcrypt, Fernet, JWT, and RBAC

### Admin Panel (`/admin`) — admin only
- **Stats**: total / admins / members / banned counts
- **User registry table** with status badges (Active / Banned / Locked) and per-row Ban/Unban/Unlock buttons
- **Encrypted-value toggle**: header button flips the e-mail column from masked (`ad***om`) to the raw Fernet ciphertext preview — useful for the encryption screenshots in your report
- **Audit log** at the bottom — every admin action with timestamp, colour-coded action badge, and target user

### Game Page (`/game`)
See [Mini Game](#mini-game-this-or-that) below.

---

## API Reference

All endpoints are mounted under `/api`. Authentication uses `Authorization: Bearer <jwt>`.

### Auth (`/api/auth`)
| Method | Path        | Auth      | Body / Description |
|--------|-------------|-----------|---------------------|
| POST   | `/login`    | none      | `{username, password}` → `{token, role, username}` |
| POST   | `/register` | none      | `{username, password, email}` → 201 |
| GET    | `/me`       | token     | Returns `{username, role}` |
| GET    | `/email`    | token     | Returns decrypted e-mail |
| GET    | `/email-raw`| token     | Returns the raw Fernet ciphertext (for the demo) |
| PUT    | `/email`    | token     | `{email}` — encrypts and stores |

### Admin (`/api/admin`) — all require admin
| Method | Path                       | Description |
|--------|----------------------------|-------------|
| GET    | `/users`                   | List all users (masked + encrypted previews) |
| PUT    | `/users/<id>/role`         | `{role}` — admin or user |
| PUT    | `/users/<id>/ban`          | Ban user |
| PUT    | `/users/<id>/unban`        | Unban user |
| PUT    | `/users/<id>/unlock`       | Clear lockout counter |
| GET    | `/audit-logs`              | Last 100 admin actions |

### Status codes
- `400` — validation error (e.g. weak password — body explains what's missing)
- `401` — missing/invalid/expired token
- `403` — banned account or insufficient role
- `409` — username taken
- `429` — account locked (body says how many minutes remain)

---

## Database Schema

Single SQLite file at `backend/users.db`.

### Table: `users`
| Column            | Type    | Notes |
|-------------------|---------|-------|
| id                | INTEGER PK | |
| username          | TEXT UNIQUE NOT NULL | |
| password_hash     | TEXT NOT NULL | bcrypt, includes salt |
| role              | TEXT DEFAULT 'user' | `admin` or `user` |
| email_enc         | TEXT | Fernet ciphertext |
| created_at        | TEXT DEFAULT (datetime('now')) | |
| is_banned         | INTEGER DEFAULT 0 | 1 = banned |
| failed_attempts   | INTEGER DEFAULT 0 | resets on success |
| locked_until      | TEXT | ISO8601 UTC, null when unlocked |

### Table: `audit_logs`
| Column          | Type | |
|-----------------|------|--|
| id              | INTEGER PK | |
| admin_username  | TEXT NOT NULL | who performed the action |
| action          | TEXT NOT NULL | `ban`, `unban`, `unlock`, `role_change` |
| target_user     | TEXT | who was affected |
| details         | TEXT | optional free text |
| timestamp       | TEXT | datetime('now') |

Schema migrations use idempotent `ALTER TABLE ... ADD COLUMN` wrapped in try/except so re-running `init_db()` is always safe.

---

## Security Architecture Deep Dive

### Authentication flow

```
1. POST /api/auth/login {username, password}
2. Server fetches users row by username (parameterized SELECT)
3. If is_banned         → 403 "Account suspended"
4. If locked_until > now → 429 "Account locked. Try again in N minutes"
5. bcrypt.checkpw(password, password_hash)
       false → increment failed_attempts (5+ → set locked_until = now+15min) → 401
       true  → reset failed_attempts and locked_until
6. Build JWT payload {sub: username, role, exp: now+1h}
7. jwt.encode(payload, JWT_SECRET, HS256)
8. Return token to client; client stores in localStorage
```

### Why bcrypt?
- One-way: even with the database, an attacker cannot reverse a hash.
- Salted by default: identical passwords yield different hashes.
- Cost factor of 12 makes brute-force expensive (≈250 ms per check on commodity hardware).
- Resistant to GPU/ASIC attacks compared to fast hashes like MD5/SHA-1.

### Why Fernet for e-mail?
- Symmetric encryption — we need to read the value back, so a hash is unsuitable.
- Fernet wraps AES-128-CBC for confidentiality + HMAC-SHA256 for tamper detection.
- Keys are 32 random bytes encoded as base64 — generated once via `generate_env.py`.
- The Profile page renders both the plaintext and the ciphertext side-by-side as a teaching aid.

### Why JWT (HS256, 1-hour expiry)?
- Stateless — no server-side session table needed.
- Carries the role claim, so authorisation is fast.
- Short expiry mitigates token-leak impact.
- The `token_required` decorator additionally re-checks the DB on every request, so a banned user is logged out immediately even with a still-valid token.

### Defence in depth
- Password rules enforced **client + server** — UX feedback + zero-trust on the wire.
- SQL injection: all queries parameterised, no string concatenation anywhere.
- Sensitive secrets in `.env` only, never in code, and `.gitignore`'d.
- CORS restricted to `localhost:3000` and `:3001`.
- Frontend `<ProtectedRoute>` is **convenience**, not security — every protected API route still verifies the JWT independently.

---

## Mini Game: This or That

Located at `/game`, accessible from the dashboard header. Mechanics:

- Two random titles are presented side by side with their posters.
- One of five questions is asked at random:
  1. Hangisinin IMDB puanı daha YÜKSEK?
  2. Hangisi daha ÖNCE çıktı? (year is hidden until reveal)
  3. Hangisi daha ÇOK oy aldı?
  4. Hangisinin Metascore'u daha YÜKSEK?
  5. Hangisi daha UZUN?
- Pick a card → both stats are revealed, your card glows green or coral.
- Correct → streak +1. Incorrect → streak resets to 0.
- Best streak persists in `localStorage`.

---

## Refreshing the Dataset

The dataset is intentionally static (a JSON file served from `frontend/public/`) — no live IMDB scraping. To regenerate or extend it:

```bash
cd backend

# 1. Edit the RAW list at the top of generate_movies.py (add/remove rows)
python generate_movies.py
# → writes frontend/public/movies_final.json with anomaly flags computed via IQR

# 2. Fetch poster URLs for any new entries (idempotent)
python fetch_posters.py
# → only hits OMDb for records missing a poster_url
```

### Anomaly detection rules
A title is flagged as anomalous (shown in coral throughout the UI) if **any** of these conditions hold:
- `rating ≥ 8.5` AND `metascore < 70` (audience loves it, critics don't)
- `duration_min` falls outside `[Q1 - 1.5·IQR, Q3 + 1.5·IQR]` for movies (Tukey fence)
- `rating ≥ 8.7` AND `votes < 300000` (suspiciously high rating with low engagement)

---

## Troubleshooting

**`RuntimeError: FERNET_KEY not set`**
Run `python generate_env.py` inside the backend folder to populate `.env`.

**`Invalid API key!` from OMDb**
You haven't activated your free key yet — check the e-mail OMDb sent and click the activation link.

**`401 Unauthorized` after a long pause**
JWTs expire after 1 hour. Sign out and sign back in.

**Locked out of your own account during testing**
Either wait 15 minutes, or as admin: `Admin Panel → Unlock` next to the user, or open `users.db` in a SQLite viewer and clear `locked_until` + `failed_attempts`.

**CORS error in the browser console**
The backend allows `localhost:3000` and `:3001`. If your dev server runs on another port, add it to the `CORS(...)` call in `backend/app.py`.

---

## Course Context

This project was developed for **SWE210 — Software Security** at Istinye University. The accompanying 5-8 page report (separate document) maps each of these features to the rubric items: Introduction, System Design, Authentication Implementation, Access Control (RBAC), and Encryption Implementation, with screenshots taken from the running application.
