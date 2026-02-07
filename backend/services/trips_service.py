import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


def save_trip(trip_data: dict) -> dict:
    """Save a trip to the Supabase trips table."""
    data = {
        "id": trip_data.get('id'),
        "user_id": trip_data.get('userId'),
        "trip_name": trip_data.get('tripName', ''),
        "destination": trip_data.get('destination', ''),
        "start_date": trip_data.get('startDate', ''),
        "end_date": trip_data.get('endDate', ''),
        "currency": trip_data.get('currency', 'USD'),
        "budget_range": trip_data.get('budgetRange', ''),
        "budget_amount": trip_data.get('budgetAmount', 0),
        "companions": trip_data.get('companions', 'solo'),
        "number_of_people": trip_data.get('numberOfPeople'),
        "specific_destinations": trip_data.get('specificDestinations', []),
        "itinerary": trip_data.get('itinerary', []),
        "countries": trip_data.get('countries', []),
    }

    try:
        response = supabase.table("trips").upsert(data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error saving trip: {e}")
        return None


def get_user_trips(user_id: str) -> list:
    """Fetch all trips for a specific user."""
    try:
        response = (
            supabase.table("trips")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data if response.data else []
    except Exception as e:
        print(f"❌ Error fetching trips: {e}")
        return []


def update_trip(trip_id: str, trip_data: dict) -> dict:
    """Update an existing trip."""
    data = {}
    field_map = {
        'tripName': 'trip_name',
        'destination': 'destination',
        'startDate': 'start_date',
        'endDate': 'end_date',
        'currency': 'currency',
        'budgetRange': 'budget_range',
        'budgetAmount': 'budget_amount',
        'companions': 'companions',
        'numberOfPeople': 'number_of_people',
        'specificDestinations': 'specific_destinations',
        'itinerary': 'itinerary',
        'countries': 'countries',
    }

    for camel, snake in field_map.items():
        if camel in trip_data:
            data[snake] = trip_data[camel]

    try:
        response = supabase.table("trips").update(data).eq("id", trip_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"❌ Error updating trip: {e}")
        return None


def delete_trip(trip_id: str) -> bool:
    """Delete a trip by ID."""
    try:
        supabase.table("trips").delete().eq("id", trip_id).execute()
        return True
    except Exception as e:
        print(f"❌ Error deleting trip: {e}")
        return False
