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
# --- DATA: THE SMART MAP (EXPANDED) ---
REGION_THEMES = {
    "Japan & East Asia": [
        # --- The Classics ---
        "traditional ryokan with private onsen in snow", 
        "neon-lit cyberpunk alleyways in rain", 
        "ancient mountaintop temples in mist", 
        "dense arashiyama-style bamboo forests", 
        "cherry blossom tunnels over quiet rivers", 
        "snow-covered shirakawa-go thatched villages", 
        
        # --- Spiritual & Historic ---
        "zen rock gardens with moss", 
        "shinto shrines with thousands of vermilion gates", 
        "historic wooden post towns (edo period style)", 
        "majestic himeji-style white castles", 
        "floating torii gates at high tide", 
        "serene geisha district streets at dawn",
        
        # --- Nature & Landscapes ---
        "autumn maple leaf valleys with red bridges", 
        "ancient yakushima cedar forests with mist", 
        "emerald green tea plantation terraces", 
        "volcanic calderas with turquoise crater lakes", 
        "frozen 'snow monster' trees on mountain peaks", 
        "tottori sand dunes at sunset", 
        "dramatic coastal cliffs with rope bridges",
        
        # --- Seasonal Colors ---
        "cascading wisteria flower tunnels", 
        "endless fields of blue nemophila flowers", 
        "lavender fields with mountain backdrops", 
        "drift ice on the northern sea",
        
        # --- Modern & Niche ---
        "futuristic skyscrapers at twilight (tokyo style)", 
        "contemporary art island outdoor sculptures", 
        "abandoned island industrial ruins", 
        "retro showa-era vending machine corners", 
        "canals of kurashiki with weeping willows"
    ],
    "The Mediterranean (Italy, Greece, Spain, Turkey)": [
        "colorful cliffside villages (Cinque Terre style)", "crumbling ancient roman ruins at sunset", 
        "sun-drenched vineyards with cypress trees", "crystal clear turquoise coves", 
        "historic venetian canals", "medieval stone hilltop towns", "white-washed greek island architecture",
        "lemon groves on terraced hills", "byzantine mosaics and domes"
    ],
    "Northern Europe & Scandinavia": [
        "northern lights (aurora borealis) over cabins", "sculpted ice hotels", "dramatic misty fjords", 
        "glass igloos in snow", "remote viking burial mounds", "snowy reindeer forests", 
        "black sand arctic beaches", "colorful wooden waterfront houses", "geothermal steaming lagoons"
    ],
    "Southeast Asia (Thailand, Vietnam, Bali, Philippines)": [
        "floating markets on quiet canals", "towering limestone karsts in emerald water", 
        "hidden jungle waterfalls", "golden buddhist pagodas", "lush green rice terraces", 
        "bioluminescent plankton beaches", "overwater bungalows", "ancient overgrown temple ruins",
        "misty tea plantations"
    ],
    "South America (Patagonia, Peru, Andes, Brazil)": [
        "mystical incan ruins in clouds", "massive cracking glaciers", "high-altitude mirror salt flats", 
        "deep amazon rainforest canopies", "rainbow-colored mountain ridges", "cloud forests with hanging bridges",
        "colonial plazas with cobblestones", "thundering waterfalls (Iguazu style)", "patagonian granite peaks"
    ],
    "Africa (Safari, Desert, Coast)": [
        "luxury tented safari lodges", "endless orange desert dunes", "savanna plains at sunrise", 
        "ancient egyptian pyramids and sphinx", "misty mountain gorilla forests", "turquoise spice island beaches",
        "baobab tree avenues", "victoria falls gorges", "moroccan riads with mosaic courtyards"
    ],
    "North America (USA, Canada, Mexico)": [
        "red rock canyons and arches", "misty coastal redwood forests", "autumn foliage in new england", 
        "glacier-fed turquoise alpine lakes", "historic jazz district streets (empty)", "art deco city skylines",
        "mayan ruins in jungles", "day of the dead decorated streets", "snowy rocky mountain lodges"
    ],
    "Oceania & Pacific (Australia, NZ, Fiji)": [
        "great barrier reef coral gardens", "red earth outback landscapes", "volcanic black rock coastlines", 
        "hobbit-style rolling green hills", "secluded white sand atolls", "bioluminescent glowworm caves",
        "ancient fern forests", "turquoise lagoons with mountain backdrops"
    ],
    "Middle East & Central Asia": [
        "ancient petra-style rock carved cities", "futuristic desert skylines", "blue tiled mosques", 
        "vast wadi rum desert valleys", "silk road caravanserais", "dead sea salt formations", 
        "historic souk markets (closed/quiet)", "persian gardens with fountains"
    ],
    "UK & Ireland": [
        "ruined medieval castles on cliffs", "rolling green highlands with mist", "stone circles (Stonehenge style)", 
        "cozy stone cottages with thatched roofs", "dramatic giant's causeway basalt columns", 
        "gothic university architecture", "dark hedges tree tunnels"
    ]
}

# --- REWRITTEN TRAVEL STYLES (Atmosphere-Focused) ---
# These describe the SCENE, not the PERSON, to keep images empty.
TRAVEL_STYLES = [
    "rugged and remote budget adventure",   # Replaces "backpacker"
    "secluded ultra-luxury romantic retreat", # Replaces "honeymooners"
    "high-adrenaline dangerous landscape",  # Replaces "adrenaline junkie"
    "ancient historical and archaeological site", # Replaces "history buff"
    "serene eco-conscious nature sanctuary", # Replaces "eco-tourist"
    "cinematic editorial photography location", # Replaces "photographer"
    "peaceful wellness and spiritual escape", # Replaces "wellness seeker"
    "hidden untouched off-the-beaten-path gem" # Replaces "digital nomad"
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