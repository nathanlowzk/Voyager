import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def generate_clarifying_questions(trip_data: dict) -> list:
    """
    Generate 0-3 yes/no clarifying questions using Gemini to better tailor the itinerary.

    Args:
        trip_data: dict with trip parameters (destination, dates, companions, etc.)

    Returns:
        list of dicts with 'id' and 'text' keys
    """
    destination = trip_data.get('destination', '')
    start_date = trip_data.get('startDate', '')
    end_date = trip_data.get('endDate', '')
    companions = trip_data.get('companions', 'solo')
    specific_destinations = trip_data.get('specificDestinations', [])

    places_context = ""
    if specific_destinations:
        place_names = [p.get('name', '') for p in specific_destinations if p.get('name')]
        if place_names:
            places_context = f"\nThe traveler specifically chose these destinations: {', '.join(place_names)}."

    companion_text = "a solo traveler"
    if companions == 'couple':
        companion_text = "a couple"
    elif companions == 'family':
        companion_text = f"a family"
    elif companions == 'friends':
        companion_text = f"a group of friends"

    prompt_text = (
        "You are a travel planning assistant. A traveler is planning a trip with these details:\n"
        f"- Destination: {destination}\n"
        f"- Dates: {start_date} to {end_date}\n"
        f"- Travelers: {companion_text}\n"
        f"{places_context}\n\n"
        "Generate 0-3 STRICTLY yes/no questions that would SIGNIFICANTLY change the resulting itinerary. "
        "Rules:\n"
        "- EVERY question MUST be answerable with ONLY 'Yes' or 'No'. No either/or, no open-ended, no multiple choice.\n"
        "- Questions MUST start with 'Do you', 'Would you', 'Are you', 'Is', 'Will you', or 'Have you'.\n"
        "- NEVER ask 'Do you prefer X or Y' — instead split into 'Do you want X?' as a yes/no question.\n"
        "- Only ask questions whose answers would meaningfully alter the trip plan\n"
        "- Do NOT ask about things already answered by the form data above\n"
        "- Each question must be under 15 words\n"
        "- Fewer questions is better; zero is perfectly fine for straightforward trips\n"
        "- Focus on intent and priorities, not assumptions about experience\n"
        "- GOOD examples: 'Do you want a relaxed, slow-paced trip?', 'Would you like to prioritize food experiences?'\n"
        "- BAD examples: 'Do you prefer fast-paced or relaxing?', 'What kind of food do you like?', 'Are you an experienced skier?'\n"
        "- For simple city breaks or straightforward destinations, return an empty array\n\n"
        "Return a JSON array of question strings. Return [] if no questions are needed."
    )

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt_text,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                temperature=0.3,
                response_schema={
                    "type": "ARRAY",
                    "items": {
                        "type": "STRING"
                    }
                }
            )
        )

        questions_raw = json.loads(response.text)
        # Limit to 3 questions max and format with IDs
        questions = [
            {"id": f"q{i}", "text": q}
            for i, q in enumerate(questions_raw[:3])
        ]
        return questions

    except Exception as e:
        print(f"Failed to generate clarifying questions: {e}", flush=True)
        return []


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
            places_hint = (
                f"\n\nIMPORTANT - The traveler specifically chose these destinations: {', '.join(place_names)}. "
                "These are the PRIMARY reason for the trip. For each one:\n"
                "- Deduce what activity the destination is known for (e.g. a ski resort means skiing/snowboarding, "
                "a beach means beach activities, a theme park means rides, a national park means hiking).\n"
                "- Allocate FULL days (not just a few hours) for these destinations proportional to how much "
                "time that activity realistically requires. For example, a ski resort deserves 2-3 full days of skiing.\n"
                "- Schedule supplementary destinations (restaurants, nearby attractions) AROUND these core destinations, not instead of them.\n"
                "- At least 75% of the trip should revolve around the traveler's chosen destinations."
            )

    # Build companion context
    companion_text = "a solo traveler"
    if companions == 'couple':
        companion_text = "a couple"
    elif companions == 'family':
        companion_text = f"a family of {number_of_people}"
    elif companions == 'friends':
        companion_text = f"a group of {number_of_people} friends"

    # Build clarifying answers context
    clarifying_context = ""
    clarifying_answers = trip_data.get('clarifyingAnswers', [])
    if clarifying_answers:
        qa_lines = []
        for qa in clarifying_answers:
            question = qa.get('question', '')
            answer = qa.get('answer', '')
            if question and answer:
                qa_lines.append(f"- Q: {question} A: {answer}")
        if qa_lines:
            clarifying_context = (
                "\n\nThe traveler provided these additional preferences:\n"
                + "\n".join(qa_lines)
                + "\nAdjust the itinerary to reflect these preferences."
            )

    prompt_text = (
        "You are an expert travel planner who creates realistic, well-paced itineraries. "
        f"Create a detailed day-by-day travel itinerary for {companion_text} "
        f"traveling to {destination} from {start_date} to {end_date}. "
        f"The budget is {currency} {budget_amount} per person. "
        f"Plan 3-5 activities per day with realistic timings.{places_hint}{clarifying_context}\n\n"
        "Take the country's culture into consideration"
        "Include a mix of sightseeing, food, culture, and leisure. "
        "Take the proximity of locations from one another into consideration, planning an efficient route"
        "Each activity must include the specific location name and the country it's in.\n\n"
        "Before finalizing, review the itinerary and verify that:\n"
        "1. The traveler's chosen destinations get adequate time (full days, not brief visits).\n"
        "2. The pacing is realistic with no rushed transitions.\n"
        "3. Activities match what each destination is actually known for.\n\n"
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
