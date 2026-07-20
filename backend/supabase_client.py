"""
EchoAI - Supabase Client
=========================
Singleton Supabase client and helper functions for persisting
images and metrics to Supabase Storage & Database.

All operations are best-effort: failures are logged but never
block the API response.
"""

import os
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env from the same directory as this file
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')

_client: Client | None = None


def get_client() -> Client | None:
    """Return the singleton Supabase client (lazy-initialised)."""
    global _client
    if _client is not None:
        return _client

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[SUPABASE] Credentials missing -- persistence disabled.")
        return None

    try:
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[SUPABASE] Client initialised OK.")
        return _client
    except Exception as e:
        print(f"[SUPABASE] Failed to create client: {e}")
        return None


# ── Storage helpers ──────────────────────────────────────────────

BUCKET = 'echo-studies'  # same bucket the React frontend uses


def upload_image(
    folder: str,
    image_bytes: bytes,
    content_type: str = 'image/png',
    study_id: str | None = None,
) -> str | None:
    """
    Upload an image to Supabase Storage and return its public URL.

    Args:
        folder:       Sub-folder inside the bucket (e.g. 'enhanced', 'masks')
        image_bytes:  Raw PNG/JPEG bytes
        content_type: MIME type
        study_id:     Optional study id used as a path prefix

    Returns:
        The public URL string, or None on failure.
    """
    client = get_client()
    if client is None:
        return None

    try:
        prefix = study_id if study_id else 'unknown'
        unique = uuid.uuid4().hex[:8]
        ts = datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
        ext = 'png' if 'png' in content_type else 'jpg'
        path = f"{folder}/{prefix}/{ts}_{unique}.{ext}"

        client.storage.from_(BUCKET).upload(
            path,
            image_bytes,
            file_options={"content-type": content_type, "upsert": "true"},
        )

        url_resp = client.storage.from_(BUCKET).get_public_url(path)
        print(f"   [SUPABASE] Uploaded {folder} image -> {url_resp}")
        return url_resp

    except Exception as e:
        print(f"   [SUPABASE] Upload to {folder} failed: {e}")
        return None


# ── Database helpers ─────────────────────────────────────────────

def update_study(study_id: str, fields: dict) -> bool:
    """
    Update columns on an existing study row.

    Args:
        study_id: The UUID / integer primary key of the row
        fields:   Dict of column -> value to SET

    Returns:
        True on success, False on failure.
    """
    client = get_client()
    if client is None:
        print("   [SUPABASE] update_study: client is None")
        return False

    try:
        print(f"   [SUPABASE] update_study called: study_id={study_id} (type={type(study_id).__name__})")
        print(f"   [SUPABASE] update_study payload: {{{', '.join(f'{k}: {type(v).__name__}({repr(v)[:60]})' for k, v in fields.items())}}}")

        resp = client.table('studies').update(fields).eq('id', study_id).execute()

        rows_affected = len(resp.data) if resp.data else 0
        print(f"   [SUPABASE] update_study response: {rows_affected} row(s) affected")

        if rows_affected == 0:
            print(f"   [SUPABASE] WARNING: 0 rows affected! The id '{study_id}' may not exist in the table.")
            return False

        if resp.data:
            updated_keys = list(resp.data[0].keys())
            print(f"   [SUPABASE] Updated row keys: {updated_keys}")

        return True
    except Exception as e:
        import traceback
        print(f"   [SUPABASE] update_study EXCEPTION: {e}")
        traceback.print_exc()
        return False
