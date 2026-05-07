"""Fetch poster URLs from OMDb for every record in movies_final.json.

Idempotent — records that already have a `poster_url` are skipped, so re-runs
only fetch missing ones. Run this any time you add new titles to the dataset.
"""
import json, os, time, re
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

API_KEY = os.environ.get("OMDB_API_KEY")
if not API_KEY:
    raise RuntimeError(
        "OMDB_API_KEY environment variable not set.\n"
        "Get a free key from https://www.omdbapi.com/apikey.aspx and add it to backend/.env:\n"
        "  OMDB_API_KEY=your_key_here"
    )
JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "movies_final.json")

def imdb_id_from_url(url):
    if not url: return None
    m = re.search(r"(tt\d+)", url)
    return m.group(1) if m else None

def fetch_poster(imdb_id):
    url = f"http://www.omdbapi.com/?i={imdb_id}&apikey={API_KEY}"
    try:
        req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if data.get("Response") == "True":
            poster = data.get("Poster", "")
            return poster if poster and poster != "N/A" else None
    except (URLError, HTTPError, TimeoutError, json.JSONDecodeError) as e:
        print(f"  [warn] {imdb_id}: {e}")
    return None

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    records = data.get("records", [])
    total = len(records)
    print(f"Loaded {total} records from {JSON_PATH}")

    fetched, skipped, missed = 0, 0, 0
    for i, rec in enumerate(records, 1):
        if rec.get("poster_url"):
            skipped += 1
            continue
        imdb_id = imdb_id_from_url(rec.get("imdb_url") or rec.get("url"))
        if not imdb_id:
            missed += 1
            continue
        poster = fetch_poster(imdb_id)
        if poster:
            rec["poster_url"] = poster
            fetched += 1
            print(f"  [{i}/{total}] {rec['title'][:40]:<40} -> OK")
        else:
            rec["poster_url"] = None
            missed += 1
            print(f"  [{i}/{total}] {rec['title'][:40]:<40} -> no poster")
        time.sleep(0.05)  # be polite to OMDb

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Fetched: {fetched} | Skipped (cached): {skipped} | Missed: {missed}")

if __name__ == "__main__":
    main()
