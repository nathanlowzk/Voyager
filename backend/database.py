import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv
import random

load_dotenv()

# Initialize Supabase Client
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ Supabase credentials missing. Check your .env file.")

supabase: Client = create_client(url, key)

def init_db():
    # With Supabase, we don't need to "create" the DB file locally.
    # We can just print a success message to confirm the credentials work.
    print("✅ Connected to Supabase Cloud Database.")

def add_destination(dest):
    """
    Saves a single destination to the Supabase 'destinations' table.
    """
    # Prepare the data object
    # Note: We don't need json.dumps(tags) because Supabase handles lists automatically
    data = {
        "name": dest['name'],
        "location": dest['location'],
        "description": dest['description'],
        "tags": dest['tags'], 
        "image_url": dest['imageUrl'],
        "is_personalized": dest['isPersonalized'],
        "viewed": False
    }
    
    try:
        response = supabase.table("destinations").insert(data).execute()
        return response
    except Exception as e:
        print(f"❌ Error saving to Supabase: {e}")
        return None
    
def get_random_batch(limit=4):
    """
    Fetches all destinations and returns 4 random ones.
    """
    try:
        # 1. Fetch data (assuming 'supabase' variable exists in this file)
        response = supabase.table('destinations').select('*').execute()
        all_data = response.data
        
        # 2. Pick random items
        if not all_data:
            return []
            
        count = min(limit, len(all_data))
        return random.sample(all_data, count)

    except Exception as e:
        print(f"Error fetching random batch: {e}")
        return []