✈️ Voyager | AI-Powered Destination Bucket List
"Airbnb meets National Geographic." > An intelligent travel bucket list that curates daily, photo-realistic destination inspirations using Gemini 3 and Imagen 4.

💡 Inspiration
We've all faced "travel paralysis"—endlessly scrolling through generic lists without finding that one spark. We wanted to build an app that doesn't just list places, but dreams them up. By combining Gemini's reasoning with Imagen's visual creativity, Voyager delivers a high-end, magazine-style experience that adapts to your personal vibe.

🚀 What it Does
Daily Curated Slideshow: Every day, the backend acts as an "AI Travel Editor," generating 4 unique, exotic destinations complete with descriptions and tags.

Generative Imagery: Uses Imagen 4.0 Fast to conjure breathtaking, photo-realistic images of these locations on the fly—no stock photos allowed.

Smart Personalization: A toggle switch that instantly filters the global feed into a "For You" list based on user interests (e.g., "Adventure," "Nature").

Resilient Architecture: Includes intelligent fallbacks (Pollinations.ai & Mock Data) to ensure the app never crashes, even when API quotas are hit.

⚙️ How We Built It
We used a Dual-Agent Architecture:

The "Editor" Agent (Gemini 2.0 Flash): Brainstorms destination ideas, writes captivating copy, and generates precise visual prompts.

The "Artist" Agent (Imagen 4.0 Fast): Takes those text prompts and renders high-fidelity visuals.

Tech Stack
Frontend: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.

Backend: Python (Flask), Google GenAI SDK.

AI Models: gemini-2.0-flash, imagen-4.0-fast-generate-001.

Tools: Google AI Studio (Vibe Coding), Pollinations.ai (Fallback).

🛠️ Getting Started
1. Prerequisites
Node.js & npm installed.

Python 3.10+ installed.

A Google Gemini API Key.

2. Backend Setup (Python)
Open a terminal and navigate to the project folder:

Bash
cd backend
python3 -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)

# Install dependencies
pip install flask flask-cors google-genai python-dotenv

# Create your secret key file
echo "GEMINI_API_KEY=your_key_here" > .env

# Run the server (Runs on Port 5001)
python3 app.py
3. Frontend Setup (React)
Open a new terminal window:

Bash
# Install dependencies
npm install

# Run the development server
npm run dev
Open your browser to the local URL (usually http://localhost:5173).

🤯 Challenges We Ran Into
The "404 Model" Hunt: We struggled initially to find the correct Model ID for image generation (imagen-3.0 vs 4.0), requiring us to write a custom script to discover available models for our API key.

Rate Limiting (429 Errors): Generating high-res images triggers API quotas quickly. We solved this by implementing a smart queuing system in Python (using time.sleep) and a robust fallback system that switches to mock data or Pollinations.ai if the Google API is exhausted.

Full Stack Integration: Connecting a modern React frontend to a raw Python backend required careful CORS configuration and port management.

🏆 Accomplishments
Successfully integrated Multimodal AI (Text + Image) in a single pipeline.

Built a "Vibe Coding" frontend that looks professional and high-end out of the box.

Implemented a resilient error-handling system that keeps the UI smooth regardless of backend status.

🗺️ What's Next for Voyager
Veo Integration: Replacing static hero images with 5-second AI-generated cinematic travel videos.

Real Auth: Replacing the mock user profile with real database persistence (Supabase).

Itinerary Planning: Clicking "Explore" will have Gemini generate a day-by-day itinerary for that specific generated location.

Voyager — Don't just go. Discover.