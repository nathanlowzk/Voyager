import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_random_batch, get_destinations_by_tags, get_subscribed_users
from email_service import send_welcome_email, send_weekly_newsletter

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/api/destinations/random', methods=['GET'])
def random_destinations():
    # 1. Let database.py do the work
    destinations = get_random_batch(limit=4)

    if not destinations:
        return jsonify({"message": "Database is empty"}), 404

    # 2. Transform snake_case (DB) to camelCase (Frontend)
    transformed = []
    for dest in destinations:
        transformed.append({
            "id": str(dest.get("id")),
            "name": dest.get("name"),
            "location": dest.get("location"),
            "description": dest.get("description"),
            "tags": dest.get("tags", []),
            "imagePrompt": dest.get("image_prompt", ""),
            "imageUrl": dest.get("image_url"), # Now this is a URL, not Base64!
            "isPersonalized": dest.get("is_personalized", False)
        })

    return jsonify(transformed)


@app.route('/api/destinations/personalized', methods=['GET'])
def personalized_destinations():
    """
    Fetches destinations that match the user's preferred tags.

    Query Parameters:
        tags: Comma-separated list of tags (e.g., "beach,mountain,temple")

    Returns:
        JSON array of destinations matching any of the provided tags
    """
    # Get the tags from query parameter
    tags_param = request.args.get('tags', '')

    if not tags_param:
        return jsonify({"error": "No tags provided"}), 400

    # Split the comma-separated tags into a list
    tags = [tag.strip() for tag in tags_param.split(',') if tag.strip()]

    if not tags:
        return jsonify({"error": "No valid tags provided"}), 400

    # Fetch destinations matching these tags
    destinations = get_destinations_by_tags(tags, limit=4)

    if not destinations:
        return jsonify({"message": "No destinations found matching your interests"}), 404

    # Transform snake_case (DB) to camelCase (Frontend)
    transformed = []
    for dest in destinations:
        transformed.append({
            "id": str(dest.get("id")),
            "name": dest.get("name"),
            "location": dest.get("location"),
            "description": dest.get("description"),
            "tags": dest.get("tags", []),
            "imagePrompt": dest.get("image_prompt", ""),
            "imageUrl": dest.get("image_url"),
            "isPersonalized": True  # Mark as personalized since it matched user's tags
        })

    return jsonify(transformed)


@app.route('/api/newsletter/welcome', methods=['POST'])
def send_welcome():
    """
    Send a welcome email to a newly subscribed user.

    Request Body:
        email: User's email address
        name: User's name
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email')
    name = data.get('name', 'Traveler')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    result = send_welcome_email(email, name)

    if result:
        return jsonify({"message": "Welcome email sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send welcome email"}), 500


@app.route('/api/newsletter/send', methods=['POST'])
def send_newsletter():
    """
    Send the weekly newsletter to a user with personalized destinations.

    Request Body:
        email: User's email address
        name: User's name
        tags: List of user's preferred tags (optional, for personalized destinations)
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email')
    name = data.get('name', 'Traveler')
    tags = data.get('tags', [])

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Get destinations - personalized if tags provided, random otherwise
    if tags:
        destinations = get_destinations_by_tags(tags, limit=4)
    else:
        destinations = get_random_batch(limit=4)

    if not destinations:
        return jsonify({"error": "No destinations available to send"}), 404

    result = send_weekly_newsletter(email, name, destinations)

    if result:
        return jsonify({"message": "Newsletter sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send newsletter"}), 500


@app.route('/api/newsletter/send-all', methods=['POST'])
def send_newsletter_to_all():
    """
    Send the weekly newsletter to ALL subscribed users.
    This endpoint is meant to be called by a cron job (e.g., cron-job.org).

    Optional Query Parameter:
        secret: A secret key to prevent unauthorized access (recommended for production)

    Returns:
        JSON with count of emails sent and any errors
    """
    # Optional: Add a secret key check for security
    # secret = request.args.get('secret')
    # if secret != os.environ.get('CRON_SECRET'):
    #     return jsonify({"error": "Unauthorized"}), 401

    # Get all subscribed users
    subscribed_users = get_subscribed_users()

    if not subscribed_users:
        return jsonify({
            "message": "No subscribed users found",
            "sent": 0,
            "failed": 0
        }), 200

    # Get random destinations for this week's newsletter
    destinations = get_random_batch(limit=4)

    if not destinations:
        return jsonify({"error": "No destinations available to send"}), 404

    # Send newsletter to each subscribed user
    sent_count = 0
    failed_count = 0
    errors = []

    for user in subscribed_users:
        try:
            result = send_weekly_newsletter(
                to_email=user['email'],
                user_name=user['name'],
                destinations=destinations
            )

            if result:
                sent_count += 1
            else:
                failed_count += 1
                errors.append(f"Failed to send to {user['email']}")

        except Exception as e:
            failed_count += 1
            errors.append(f"Error sending to {user['email']}: {str(e)}")

    return jsonify({
        "message": f"Newsletter batch complete",
        "sent": sent_count,
        "failed": failed_count,
        "errors": errors[:10] if errors else []  # Only return first 10 errors
    }), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)