import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

print("=== AVAILABLE TEXT MODELS ===")
try:
    for m in client.models.list():
        # logic: if it's NOT an image model, it's likely a text model
        if "imagen" not in m.name and "face" not in m.name:
            print(f"Model ID: {m.name}")
except Exception as e:
    print(f"Error: {e}")