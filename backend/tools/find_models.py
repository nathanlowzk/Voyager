import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# 1. Force Python to find .env in the same folder as this script
script_dir = Path(__file__).parent
env_path = script_dir / '.env'
load_dotenv(dotenv_path=env_path)

api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    print("❌ ERROR: Could not find GEMINI_API_KEY in .env file.")
    print(f"Looking in: {env_path}")
    exit(1)

client = genai.Client(api_key=api_key)

print("=== SEARCHING FOR AVAILABLE MODELS ===")
try:
    for m in client.models.list():
        if "image" in m.name or "vision" in m.name:
            print(f"✅ AVAILABLE: {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")