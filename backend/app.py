import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.destinations import destinations_bp
from routes.newsletter import newsletter_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Register route blueprints
app.register_blueprint(destinations_bp)
app.register_blueprint(newsletter_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
