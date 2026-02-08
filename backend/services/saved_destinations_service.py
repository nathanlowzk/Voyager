import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


def get_saved_destinations(user_id: str) -> list:
    """Fetch all saved destinations for a user, joined with full destination data."""
    try:
        response = (
            supabase.table("saved_destinations")
            .select("destination_id, created_at, destinations(*)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching saved destinations: {e}")
        return []


def save_destination(user_id: str, destination_id: str) -> tuple:
    """Insert a saved destination row."""
    try:
        response = (
            supabase.table("saved_destinations")
            .insert({"user_id": user_id, "destination_id": destination_id})
            .execute()
        )
        return (response.data[0] if response.data else None, None)
    except Exception as e:
        print(f"Error saving destination: {e}", flush=True)
        return (None, str(e))


def unsave_destination(user_id: str, destination_id: str) -> bool:
    """Delete a saved destination row."""
    try:
        supabase.table("saved_destinations").delete().eq(
            "user_id", user_id
        ).eq("destination_id", destination_id).execute()
        return True
    except Exception as e:
        print(f"Error unsaving destination: {e}")
        return False
