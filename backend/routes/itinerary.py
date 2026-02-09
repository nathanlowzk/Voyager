from flask import Blueprint, jsonify, request
from services.itinerary_service import generate_itinerary, generate_clarifying_questions

itinerary_bp = Blueprint('itinerary', __name__)


@itinerary_bp.route('/api/itinerary/questions', methods=['POST'])
def get_questions():
    """
    Generate 0-3 clarifying yes/no questions before itinerary generation.

    Request Body: Same as /generate endpoint.

    Returns:
        JSON with 'questions' (array of {id, text} objects)
    """
    data = request.get_json()

    if not data:
        return jsonify({"questions": []}), 200

    questions = generate_clarifying_questions(data)
    return jsonify({"questions": questions}), 200


@itinerary_bp.route('/api/itinerary/generate', methods=['POST'])
def generate():
    """
    Generate a day-by-day itinerary for a trip using Gemini AI.

    Request Body:
        destination: Country or region name
        startDate: Trip start date (YYYY-MM-DD)
        endDate: Trip end date (YYYY-MM-DD)
        currency: Currency code (e.g. "SGD", "USD")
        budgetAmount: Budget per person
        companions: "solo", "couple", "family", or "friends"
        numberOfPeople: Number of travelers (optional)
        specificDestinations: Array of {name, address} objects (optional hints)

    Returns:
        JSON with 'itinerary' (array of days) and 'countries' (array of country names)
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    if not data.get('destination'):
        return jsonify({"error": "Destination is required"}), 400

    if not data.get('startDate') or not data.get('endDate'):
        return jsonify({"error": "Start and end dates are required"}), 400

    result = generate_itinerary(data)

    if result and "error" not in result:
        return jsonify(result), 200
    else:
        return jsonify({"error": f"Failed to generate itinerary: {result.get('error', 'unknown')}"}), 500
