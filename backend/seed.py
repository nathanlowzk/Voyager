import time
import random
import os
import json
import uuid
from google import genai
from google.genai import types
from dotenv import load_dotenv
from database import init_db, add_destination
from supabase import create_client

load_dotenv()

# --- CONFIGURATION ---
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

init_db()

# --- DATA: THE SMART MAP ---
REGION_THEMES = {
    "Japan & East Asia": [
        "traditional ryokan with private onsen", "neon night markets", "ancient mountaintop temples", 
        "bamboo forests", "cherry blossom tunnels", "snow-covered villages", "futuristic cityscapes"
    ],
    "The Mediterranean": [
        "colorful cliffside villages", "ancient roman ruins", "sun-drenched vineyards", 
        "crystal clear coves", "historic canal cities", "medieval hilltop towns"
    ],
    "Scandinavia & The Arctic": [
        "northern lights viewing", "ice hotels", "dramatic fjords", 
        "glass igloos", "remote viking history", "snowy reindeer safaris"
    ],
    "Southeast Asia": [
        "floating markets", "limestone karst islands", "emerald jungle waterfalls", 
        "golden buddhist temples", "rice terrace fields", "bioluminescent beaches"
    ],
    "South America": [
        "mystical incan ruins", "massive glaciers", "high-altitude salt flats", 
        "amazon rainforest lodges", "rainbow mountains", "cloud forests"
    ],
    "Africa": [
        "luxury safari lodges", "vast desert dunes", "migration plains", 
        "ancient pyramids", "gorilla trekking forests", "spice island beaches"
    ]
}

TRAVEL_STYLES = [
    "a solo backpacker on a budget", "a couple on an ultra-luxury honeymoon", 
    "an adrenaline junkie", "a history buff", "a photographer"
]

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
    for attempt in range(3):
        try:
            prompt_text = (
                f"Generate 1 real, specific travel bucket list destination in {c_region} "
                f"that features {c_theme}. It must be perfect for {c_style}. "
                "Do not invent places. Return JSON with fields: name, location, description, tags, imagePrompt, isPersonalized."
            )

            response = client.models.generate_content(
                model='gemini-2.5-flash-lite', 
                contents=prompt_text,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=1.0, 
                    response_schema={
                        "type": "OBJECT", # Requesting a Single Object now, not Array
                        "properties": {
                            "name": {"type": "STRING"},
                            "location": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "imagePrompt": {"type": "STRING"},
                            "isPersonalized": {"type": "BOOLEAN"}
                        },
                        "required": ["name", "location", "description", "tags", "imagePrompt", "isPersonalized"]
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
    # PROMPT CHAOS (Visuals)
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
    print("🚀 Starting Batch (Generating 3 distinct items)...")
    
    # Loop 3 times = 3 Completely different destinations
    for i in range(10):
        generate_single_destination()
        time.sleep(2) # Pause between items

if __name__ == "__main__":
    # Just run one batch of 3 mixed items
    generate_batch()
    print("🎉 Done.")