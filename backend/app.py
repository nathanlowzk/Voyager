import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.destinations import destinations_bp
from routes.newsletter import newsletter_bp
from routes.itinerary import itinerary_bp
from routes.trips import trips_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register route blueprints
app.register_blueprint(destinations_bp)
app.register_blueprint(newsletter_bp)
app.register_blueprint(itinerary_bp)
app.register_blueprint(trips_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
