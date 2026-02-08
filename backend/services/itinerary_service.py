import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def generate_itinerary(trip_data: dict) -> dict:
    """
    Generate a day-by-day itinerary using Gemini based on trip parameters.

    Args:
        trip_data: dict with keys: destination, startDate, endDate, currency,
                   budgetAmount, companions, numberOfPeople, specificDestinations

    Returns:
        dict with 'itinerary' (list of days) and 'countries' (list of country names)
    """
    destination = trip_data.get('destination', '')
    start_date = trip_data.get('startDate', '')
    end_date = trip_data.get('endDate', '')
    currency = trip_data.get('currency', 'USD')
    budget_amount = trip_data.get('budgetAmount', 5000)
    companions = trip_data.get('companions', 'solo')
    number_of_people = trip_data.get('numberOfPeople', 1)
    specific_destinations = trip_data.get('specificDestinations', [])

    # Build specific places hint
    places_hint = ""
    if specific_destinations:
        place_names = [p.get('name', '') for p in specific_destinations if p.get('name')]
        if place_names:
            places_hint = f" The traveler specifically wants to visit: {', '.join(place_names)}. Incorporate these into the itinerary."

    # Build companion context
    companion_text = "a solo traveler"
    if companions == 'couple':
        companion_text = "a couple"
    elif companions == 'family':
        companion_text = f"a family of {number_of_people}"
    elif companions == 'friends':
        companion_text = f"a group of {number_of_people} friends"

    prompt_text = (
        f"Create a detailed day-by-day travel itinerary for {companion_text} "
        f"traveling to {destination} from {start_date} to {end_date}. "
        f"The budget is {currency} {budget_amount} per person. "
        f"Plan 3-5 activities per day with realistic timings.{places_hint} "
        "Include a mix of sightseeing, food, culture, and leisure. "
        "Each activity must include the specific location name and the country it's in. "
        "Return a JSON array of days, each containing a day number, date, and list of activities."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                temperature=0.8,
                response_schema={
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "day": {"type": "INTEGER"},
                            "date": {"type": "STRING"},
                            "activities": {
                                "type": "ARRAY",
                                "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                        "time": {"type": "STRING"},
                                        "title": {"type": "STRING"},
                                        "description": {"type": "STRING"},
                                        "location": {"type": "STRING"},
                                        "country": {"type": "STRING"}
                                    },
                                    "required": ["time", "title", "description", "location", "country"]
                                }
                            }
                        },
                        "required": ["day", "date", "activities"]
                    }
                }
            )
        )

        itinerary = json.loads(response.text)

        # Extract unique countries from all activities
        countries = list(set(
            activity.get('country', '')
            for day in itinerary
            for activity in day.get('activities', [])
            if activity.get('country')
        ))
        countries.sort()

        return {
            "itinerary": itinerary,
            "countries": countries
        }

    except Exception as e:
        print(f"❌ Itinerary generation failed: {e}", flush=True)
        return {"error": str(e)}
