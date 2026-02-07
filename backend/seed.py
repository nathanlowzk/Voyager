import time
import random
import os
import json
import uuid
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv
from services.database import init_db, add_destination
from supabase import create_client

load_dotenv()

# --- CONFIGURATION ---
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

init_db()

# --- LOAD DATA FROM JSON ---
data_path = Path(__file__).parent / "data" / "region_themes.json"
with open(data_path, "r") as f:
    theme_data = json.load(f)

REGION_THEMES = theme_data["region_themes"]
TRAVEL_STYLES = theme_data["travel_styles"]


def upload_image(image_bytes, destination_name):
    try:
        clean_name = destination_name.replace(" ", "-").lower()[:20]
        filename = f"{clean_name}-{uuid.uuid4().hex[:6]}.png"
        bucket_name = "travel-photos"
        supabase.storage.from_(bucket_name).upload(
            path=filename, file=image_bytes, file_options={"content-type": "image/png"}
        )
        return supabase.storage.from_(bucket_name).get_public_url(filename)
    except Exception as e:
        print(f"   ⚠️ Upload Failed: {e}")
        return None

def generate_single_destination():
    """Generates ONE completely random destination with its own unique theme."""

    # 1. Randomize EVERYTHING for this single slot
    c_region = random.choice(list(REGION_THEMES.keys()))
    c_theme = random.choice(REGION_THEMES[c_region])
    c_style = random.choice(TRAVEL_STYLES)

    print(f"🎲 Rolling: {c_theme} in {c_region} ({c_style})...")

    destination_data = None

    # 2. Text Generation (Retry Logic)
    for _ in range(3):
        try:
            prompt_text = (
                f"Generate 1 real, specific travel bucket list destination in {c_region} "
                f"that features {c_theme}. It must be perfect for {c_style}. "
                "Do not invent places. Return JSON with fields: name, location, description, tags, imagePrompt, isPersonalized, country, region. "
                "The 'country' field must be the exact country name (e.g., 'Japan', 'Thailand', 'Italy'). "
                "The 'region' field must be an array containing one or more of these exact values where applicable: 'Oceania', 'East Asia', 'Middle East', 'South East Asia', 'Europe', 'North America', 'South America', 'Central America', 'Africa'. Most destinations belong to one region, but some may belong to multiple."
            )

            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=1.0,
                    response_schema={
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "location": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "imagePrompt": {"type": "STRING"},
                            "isPersonalized": {"type": "BOOLEAN"},
                            "country": {"type": "STRING"},
                            "region": {"type": "ARRAY", "items": {"type": "STRING"}}
                        },
                        "required": ["name", "location", "description", "tags", "imagePrompt", "isPersonalized", "country", "region"]
                    }
                )
            )
            destination_data = json.loads(response.text)
            break
        except Exception as e:
            print(f"   ⚠️ Text Error: {e}. Retrying...")
            time.sleep(2)

    if not destination_data:
        print("   ❌ Text failed. Skipping.")
        return

    # 3. Image Generation
    lighting = random.choice(["soft morning light", "golden hour", "moody overcast", "blue hour"])
    vibe = random.choice(["peaceful", "vibrant", "cinematic", "ethereal"])

    my_prompt = f"A stunning editorial travel photograph of {destination_data['name']}, {destination_data['location']}. {destination_data['imagePrompt']}. Shot on Fujifilm GFX 100S, medium format, 45mm lens, {lighting}, {vibe}, high resolution, sharp focus, professional color grading, Condé Nast Traveler style. The scene is COMPLETELY DEVOID of people. Any wildlife present must be in the far distance, no close-ups. Avoid large group of wildlife if any, keep it to few animals max."

    try:
        print(f"   🎨 Painting {destination_data['name']}...")
        time.sleep(15) # Safety pause for Image API

        img_response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=my_prompt,
            config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="16:9")
        )

        if img_response.generated_images:
            img_bytes = img_response.generated_images[0].image.image_bytes
            print("   ☁️ Uploading...")
            public_url = upload_image(img_bytes, destination_data['name'])

            if public_url:
                destination_data['imageUrl'] = public_url
                add_destination(destination_data)
                print(f"   ✅ SUCCESS: {destination_data['name']}")
        else:
            print("   ❌ No image.")

    except Exception as e:
        print(f"   ⚠️ Image Error: {e}")
        if "429" in str(e):
            print("   ⏳ Rate Limit. Sleeping 30s...")
            time.sleep(30)

def generate_batch():
    print("🚀 Starting Batch (Generating 10 distinct items)...")

    for _ in range(10):
        generate_single_destination()
        time.sleep(2) # Pause between items

if __name__ == "__main__":
    generate_batch()
    print("🎉 Done.")
