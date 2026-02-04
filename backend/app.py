import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from database import get_random_batch

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

if __name__ == '__main__':
    app.run(debug=True, port=5001)