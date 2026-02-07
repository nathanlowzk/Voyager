from flask import Blueprint, jsonify, request
from services.database import get_random_batch, get_destinations_by_tags, get_subscribed_users
from services.email_service import send_welcome_email, send_weekly_newsletter

newsletter_bp = Blueprint('newsletter', __name__)


@newsletter_bp.route('/api/newsletter/welcome', methods=['POST'])
def send_welcome():
    """
    Send a welcome email to a newly subscribed user.
    Optionally includes personalized destinations based on user's saved tags.

    Request Body:
        email: User's email address
        name: User's name
        tags: Optional list of tags from user's saved destinations (for personalization)
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email')
    name = data.get('name', 'Traveler')
    tags = data.get('tags', [])

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Get personalized destinations if tags are provided
    destinations = None
    if tags and len(tags) > 0:
        destinations = get_destinations_by_tags(tags, limit=4)

    result = send_welcome_email(email, name, destinations)

    if result:
        return jsonify({"message": "Welcome email sent successfully"}), 200
    else:
        return jsonify({"error": "Failed to send welcome email"}), 500


@newsletter_bp.route('/api/newsletter/send', methods=['POST'])
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


@newsletter_bp.route('/api/newsletter/send-all', methods=['POST'])
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
