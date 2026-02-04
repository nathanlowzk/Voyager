
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import * as Lucide from 'lucide-react';
import { Button } from './components/Button';
import { Toggle } from './components/Toggle';
import { HeroCarousel } from './components/HeroCarousel';
import { Destination, DestinationCard } from './components/DestinationCard';
import { Passport } from './components/Passport';
import { TripPlanningForm, TripPlan } from './components/TripPlanningForm';
import { Trips } from './components/Trips';
import { SignIn } from './sign_in';
import { Registration } from './registration';

// --- Types & Interfaces ---

interface UserProfile {
  interests: string[];
}

// --- AI Service Layer ---

const MOCK_USER: UserProfile = {
  interests: ['Mountains', 'Adventure', 'Nature', 'Europe'],
};

function VoyagerApp() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalized, setPersonalized] = useState(false);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [currentView, setCurrentView] = useState<'destinations' | 'passport' | 'tripForm' | 'trips' | 'signIn' | 'registration'>('destinations');
  const [trips, setTrips] = useState<TripPlan[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Load saved destinations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedDestinations');
    if (saved) {
      try {
        setSavedDestinations(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved destinations:', err);
      }
    }
  }, []);

  // Save to localStorage whenever savedDestinations changes
  useEffect(() => {
    localStorage.setItem('savedDestinations', JSON.stringify(savedDestinations));
  }, [savedDestinations]);

  // Load trips from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('voyager-trips');
    if (stored) {
      try { setTrips(JSON.parse(stored)); } catch {}
    }
  }, []);

  // Save trips to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('voyager-trips', JSON.stringify(trips));
  }, [trips]);

  const toggleSaveDestination = useCallback((dest: Destination) => {
    setSavedDestinations(prev => {
      const isAlreadySaved = prev.some(d => d.id === dest.id);
      if (isAlreadySaved) {
        return prev.filter(d => d.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
  }, []);

  const handleTripSubmit = useCallback((trip: TripPlan) => {
    setTrips(prev => [trip, ...prev]);
    setCurrentView('trips');
  }, []);

  const handleTripDelete = useCallback((id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // NOW: We call our own Python backend instead of Google directly
      const response = await fetch('http://127.0.0.1:5001/api/destinations/random');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Add unique IDs to the data coming from Python
      const formattedData = data.map((d: any, i: number) => ({
        ...d,
        id: `dest-${i}-${Date.now()}`
      }));

      setDestinations(formattedData);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedDestinations = useMemo(() => {
    if (!personalized) return destinations;
    return destinations.filter(d => d.isPersonalized);
  }, [destinations, personalized]);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Lucide.Plane className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-serif tracking-tight">Voyager.</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => setCurrentView('destinations')}
            className={`text-sm font-medium transition-colors ${currentView === 'destinations' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Destinations
          </button>
          <button
            onClick={() => setCurrentView('passport')}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${currentView === 'passport' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Passport
            {savedDestinations.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {savedDestinations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentView('trips')}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${currentView === 'trips' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Trips
            {trips.length > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {trips.length}
              </span>
            )}
          </button>
          <a href="#" className="text-sm font-medium hover:text-emerald-600 transition-colors">About</a>
        </div>

        <div className="flex items-center gap-6">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setCurrentView('signIn')}>
            <Lucide.LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button variant="primary" className="hidden sm:flex" onClick={() => setCurrentView('tripForm')}>Plan Trip</Button>
        </div>
      </nav>

      <main className="pt-20">
        {currentView === 'destinations' ? (
          <>
            <HeroCarousel
              destinations={destinations}
              loading={loading}
              savedDestinations={savedDestinations}
              onToggleSave={toggleSaveDestination}
              onRefresh={loadData}
            />

            <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <Lucide.Sparkles className="w-4 h-4" />
                    Curated Collections
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-xl">
                    {personalized ? 'Personalized Escapes' : 'Trending Destinations'}
                  </h2>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4">
                  <Toggle
                    label="Personalized for Me"
                    active={personalized}
                    onToggle={() => setPersonalized(!personalized)}
                  />
                  <p className="text-xs text-slate-400 italic">
                    {personalized ? `Showing destinations matching your interests` : 'Showing the global trending collection'}
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="aspect-[4/5] bg-slate-100 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {displayedDestinations.map((dest) => {
                    const isSaved = savedDestinations.some(saved => saved.id === dest.id);
                    return (
                      <DestinationCard
                        key={dest.id}
                        dest={dest}
                        isSaved={isSaved}
                        onToggleSave={toggleSaveDestination}
                      />
                    );
                  })}
                </div>
              )}

              {!loading && displayedDestinations.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center">
                  <Lucide.Compass className="w-16 h-16 text-slate-200 mb-6" />
                  <h3 className="text-xl font-serif mb-2">No matching wanderlust found</h3>
                  <p className="text-slate-500 font-light mb-8">Try exploring our trending global destinations instead.</p>
                  <Button onClick={() => setPersonalized(false)} variant="outline">View All Destinations</Button>
                </div>
              )}
            </section>
          </>
        ) : currentView === 'passport' ? (
          <Passport
            savedDestinations={savedDestinations}
            onToggleSave={toggleSaveDestination}
            onNavigateToDestinations={() => setCurrentView('destinations')}
          />
        ) : currentView === 'tripForm' ? (
          <TripPlanningForm onSubmit={handleTripSubmit} />
        ) : currentView === 'signIn' ? (
          <SignIn
            onSignIn={(email, password) => {
              console.log('Sign in:', email);
              setCurrentView('destinations');
            }}
            onNavigateToRegister={() => setCurrentView('registration')}
          />
        ) : currentView === 'registration' ? (
          <Registration
            onRegister={(fullName, email, dateOfBirth) => {
              console.log('Register:', fullName, email);
              setCurrentView('destinations');
            }}
            onNavigateToSignIn={() => setCurrentView('signIn')}
          />
        ) : (
          <Trips
            trips={trips}
            onDeleteTrip={handleTripDelete}
            onPlanTrip={() => setCurrentView('tripForm')}
          />
        )}

        <section className="bg-slate-50 py-24 px-6 mt-12 overflow-hidden relative">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Ready to start your next adventure?</h2>
            <p className="text-lg text-slate-500 mb-12 font-light max-w-2xl mx-auto">
              Join 50,000+ travelers who use Voyager to plan their dream escapes with AI-powered personal recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-8 py-4 rounded-full border-2 border-slate-200 focus:border-slate-900 outline-none w-full sm:w-96 text-lg transition-all"
              />
              <Button className="py-4 px-10 text-lg">Subscribe</Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[120px] opacity-30 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-30 -ml-48 -mb-48" />
        </section>
      </main>

      <footer className="py-12 px-6 md:px-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Lucide.Plane className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-serif tracking-tight">Voyager.</span>
        </div>
        <p className="text-slate-400 text-sm font-light">© 2025 Voyager Travel Inc. All rights reserved.</p>
        <div className="flex gap-6 text-slate-400">
          <a href="#" className="hover:text-slate-900 transition-colors"><Lucide.Info className="w-5 h-5" /></a>
          <a href="#" className="hover:text-slate-900 transition-colors text-sm font-medium">Privacy</a>
          <a href="#" className="hover:text-slate-900 transition-colors text-sm font-medium">Terms</a>
        </div>
      </footer>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.0); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<VoyagerApp />);
}
