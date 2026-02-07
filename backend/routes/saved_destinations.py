from flask import Blueprint, jsonify, request
from services.saved_destinations_service import (
    get_saved_destinations,
    save_destination,
    unsave_destination,
)

saved_destinations_bp = Blueprint('saved_destinations', __name__)


def transform_destination(row: dict) -> dict:
    """Transform a saved_destinations join row to a camelCase destination for the frontend."""
    dest = row.get("destinations", {})
    return {
        "id": str(dest.get("id")),
        "name": dest.get("name"),
        "location": dest.get("location"),
        "description": dest.get("description"),
        "tags": dest.get("tags", []),
        "imagePrompt": dest.get("image_prompt", ""),
        "imageUrl": dest.get("image_url"),
        "isPersonalized": dest.get("is_personalized", False),
        "country": dest.get("country", ""),
        "region": dest.get("region", ""),
    }


@saved_destinations_bp.route('/api/saved-destinations', methods=['GET'])
def list_saved():
    """Get all saved destinations for a user."""
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    rows = get_saved_destinations(user_id)
    return jsonify([transform_destination(r) for r in rows]), 200


@saved_destinations_bp.route('/api/saved-destinations', methods=['POST'])
def save():
    """Save a destination for a user."""
    data = request.get_json()
    if not data or not data.get('userId') or not data.get('destinationId'):
        return jsonify({"error": "userId and destinationId are required"}), 400

    result = save_destination(data['userId'], data['destinationId'])
    if result:
        return jsonify({"message": "Destination saved"}), 201
    else:
        return jsonify({"error": "Failed to save destination"}), 500


@saved_destinations_bp.route('/api/saved-destinations', methods=['DELETE'])
def unsave():
    """Unsave a destination for a user."""
    data = request.get_json()
    if not data or not data.get('userId') or not data.get('destinationId'):
        return jsonify({"error": "userId and destinationId are required"}), 400

    success = unsave_destination(data['userId'], data['destinationId'])
    if success:
        return jsonify({"message": "Destination unsaved"}), 200
    else:
        return jsonify({"error": "Failed to unsave destination"}), 500
