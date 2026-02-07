from flask import Blueprint, jsonify, request
from services.trips_service import save_trip, get_user_trips, update_trip, delete_trip

trips_bp = Blueprint('trips', __name__)


def transform_trip(trip: dict) -> dict:
    """Transform snake_case DB row to camelCase for frontend."""
    return {
        "id": trip.get("id"),
        "userId": trip.get("user_id"),
        "tripName": trip.get("trip_name", ""),
        "destination": trip.get("destination", ""),
        "startDate": trip.get("start_date", ""),
        "endDate": trip.get("end_date", ""),
        "currency": trip.get("currency", "USD"),
        "budgetRange": trip.get("budget_range", ""),
        "budgetAmount": trip.get("budget_amount", 0),
        "companions": trip.get("companions", "solo"),
        "numberOfPeople": trip.get("number_of_people"),
        "specificDestinations": trip.get("specific_destinations", []),
        "itinerary": trip.get("itinerary", []),
        "countries": trip.get("countries", []),
        "createdAt": trip.get("created_at", ""),
    }


@trips_bp.route('/api/trips', methods=['POST'])
def create_trip():
    """Save a new trip."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = save_trip(data)
    if result:
        return jsonify(transform_trip(result)), 201
    else:
        return jsonify({"error": "Failed to save trip"}), 500


@trips_bp.route('/api/trips', methods=['GET'])
def list_trips():
    """Get all trips for a user."""
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    trips = get_user_trips(user_id)
    return jsonify([transform_trip(t) for t in trips]), 200


@trips_bp.route('/api/trips/<trip_id>', methods=['PUT'])
def edit_trip(trip_id):
    """Update an existing trip."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = update_trip(trip_id, data)
    if result:
        return jsonify(transform_trip(result)), 200
    else:
        return jsonify({"error": "Failed to update trip"}), 500


@trips_bp.route('/api/trips/<trip_id>', methods=['DELETE'])
def remove_trip(trip_id):
    """Delete a trip."""
    success = delete_trip(trip_id)
    if success:
        return jsonify({"message": "Trip deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete trip"}), 500
