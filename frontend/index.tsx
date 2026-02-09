
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import * as Lucide from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';
import { Button } from './src/components/Button';
import { Toggle } from './src/components/Toggle';
import { HeroCarousel } from './src/components/HeroCarousel';
import { Destination, DestinationCard } from './src/components/DestinationCard';
import { Passport } from './src/components/Passport';
import { TripPlanningForm, TripPlan } from './src/components/TripPlanningForm';
import { Trips } from './src/components/Trips';
import { SignIn } from './src/auth/sign_in';
import { Registration } from './src/auth/registration';
import { About } from './src/components/About';
import { Profile } from './src/components/Profile';
import { API_BASE_URL } from './src/lib/api';

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
  const [currentView, setCurrentView] = useState<'explore' | 'passport' | 'tripForm' | 'trips' | 'signIn' | 'registration' | 'about' | 'profile'>('explore');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  // Track the currently logged-in user (null means not logged in)
  const [user, setUser] = useState<User | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal state for viewing destination details
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Show a toast notification that auto-dismisses after 4 seconds
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle newsletter subscription
  const handleSubscribe = async () => {
    if (!user) {
      // User is not signed in, redirect to sign in page
      setCurrentView('signIn');
      return;
    }

    // Check if user is already subscribed
    if (user.user_metadata?.subscribed_to_newsletter) {
      showToast("You're already subscribed to our newsletter!", 'success');
      return;
    }

    try {
      // Update user metadata to mark them as subscribed
      const { error } = await supabase.auth.updateUser({
        data: {
          subscribed_to_newsletter: true,
          subscribed_at: new Date().toISOString()
        }
      });

      if (error) {
        throw error;
      }

      // Update local user state to reflect the change
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          user_metadata: {
            ...prevUser.user_metadata,
            subscribed_to_newsletter: true,
            subscribed_at: new Date().toISOString()
          }
        };
      });

      // Send welcome email via backend with personalized destinations
      try {
        await fetch(`${API_BASE_URL}/api/newsletter/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            name: user.user_metadata?.full_name || 'Traveler',
            tags: topTags.slice(0, 10) // Send top 10 tags for personalized destinations
          })
        });
      } catch (emailError) {
        // Don't fail the subscription if email fails
        console.error('Failed to send welcome email:', emailError);
      }

      showToast("You're subscribed! Check your inbox for a welcome email.", 'success');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      showToast("Failed to subscribe. Please try again.", 'error');
    }
  };

  // Listen for authentication state changes (login, logout, session refresh)
  useEffect(() => {
    // First, check if there's an existing session when the app loads
    // This handles the case where the user refreshes the page while logged in
    supabase.auth.getSession().then((response) => {
      const session = response.data.session;
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Subscribe to auth state changes (login, logout, token refresh, etc.)
    // This keeps the user state in sync with Supabase's auth state
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      // event can be: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    // Cleanup: unsubscribe when component unmounts
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  // Handle user sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSavedDestinations([]);
    setTrips([]);
    setCurrentView('explore');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await fetch(`${API_BASE_URL}/api/user/${user.id}`, { method: 'DELETE' });
      await supabase.auth.signOut();
      setSavedDestinations([]);
      setTrips([]);
      setCurrentView('explore');
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  // Helper function for actions that require authentication
  const requireAuth = (action: () => void, message = "Please sign in first") => {
    if (!user) {
      showToast(message, 'error');
      return;
    }
    action();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Clear editingTripId when navigating away from the trip form
    if (currentView !== 'tripForm' && editingTripId) {
      setEditingTripId(null);
    }
  }, [currentView, editingTripId]);

  // Load saved destinations from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE_URL}/api/saved-destinations?userId=${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSavedDestinations(data))
        .catch(() => setSavedDestinations([]));
    } else {
      setSavedDestinations([]);
    }
  }, [user?.id]);

  // Load trips from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetch(`${API_BASE_URL}/api/trips?userId=${user.id}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setTrips(data))
        .catch(() => setTrips([]));
    } else {
      setTrips([]);
    }
  }, [user?.id]);

  const toggleSaveDestination = useCallback(async (dest: Destination) => {
    if (!user) {
      showToast("Please sign in to save destinations", 'error');
      return;
    }

    const isAlreadySaved = savedDestinations.some(d => d.id === dest.id);

    // Optimistic update
    if (isAlreadySaved) {
      setSavedDestinations(prev => prev.filter(d => d.id !== dest.id));
    } else {
      setSavedDestinations(prev => [...prev, dest]);
    }

    try {
      if (isAlreadySaved) {
        const res = await fetch(`${API_BASE_URL}/api/saved-destinations`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, destinationId: dest.id }),
        });
        if (!res.ok) {
          // Revert on failure
          setSavedDestinations(prev => [...prev, dest]);
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/saved-destinations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, destinationId: dest.id }),
        });
        if (!res.ok) {
          // Revert on failure
          setSavedDestinations(prev => prev.filter(d => d.id !== dest.id));
        }
      }
    } catch (err) {
      // Revert on error
      if (isAlreadySaved) {
        setSavedDestinations(prev => [...prev, dest]);
      } else {
        setSavedDestinations(prev => prev.filter(d => d.id !== dest.id));
      }
      console.error('Failed to toggle saved destination:', err);
      showToast("Failed to update saved destination", 'error');
    }
  }, [user, savedDestinations]);

  const handleTripSubmit = useCallback(async (trip: TripPlan) => {
    if (!user) return;

    const tripWithUser = { ...trip, userId: user.id };

    try {
      if (editingTripId) {
        // Update existing trip
        const res = await fetch(`${API_BASE_URL}/api/trips/${editingTripId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripWithUser),
        });
        if (res.ok) {
          const updated = await res.json();
          setTrips(prev => prev.map(t => t.id === editingTripId ? updated : t));
        }
        setEditingTripId(null);
      } else {
        // Create new trip
        const res = await fetch(`${API_BASE_URL}/api/trips`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tripWithUser),
        });
        if (res.ok) {
          const saved = await res.json();
          setTrips(prev => [saved, ...prev]);
        }
      }
    } catch (err) {
      console.error('Failed to save trip:', err);
    }

    setCurrentView('trips');
  }, [editingTripId, user]);

  const handleTripDelete = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/trips/${id}`, { method: 'DELETE' });
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  }, []);

  // Start a new trip - clears form cache and navigates to the form
  const handleNewTrip = useCallback(() => {
    if (user) {
      const cacheKey = `voyager-trip-form-cache_${user.id}`;
      localStorage.removeItem(cacheKey);
    }
    setCurrentView('tripForm');
  }, [user]);

  // Handle editing a trip - loads trip data into form cache and navigates to form
  const handleEditTrip = useCallback((trip: TripPlan) => {
    if (!user) return;

    // Get the month and year from the trip's start date for the calendar
    const startDateObj = new Date(trip.startDate + 'T00:00:00');

    // Create form cache data from the trip
    const formCacheData = {
      tripName: trip.tripName || '',
      destination: trip.destination,
      specificDestinations: trip.specificDestinations || [],
      startDate: trip.startDate,
      endDate: trip.endDate,
      calMonth: startDateObj.getMonth(),
      calYear: startDateObj.getFullYear(),
      currency: trip.currency,
      budgetAmount: trip.budgetAmount,
      companions: trip.companions,
      numberOfPeople: trip.numberOfPeople || 2,
      savedAt: Date.now(),
    };

    // Save to localStorage with the user's cache key
    const cacheKey = `voyager-trip-form-cache_${user.id}`;
    localStorage.setItem(cacheKey, JSON.stringify(formCacheData));

    // Track which trip we're editing (don't delete it yet - only delete on save)
    setEditingTripId(trip.id);

    // Navigate to the trip form
    setCurrentView('tripForm');
  }, [user]);

  // Calculate tag frequency from saved destinations
  // Returns an object like { "beach": 3, "mountain": 2, "temple": 1 }
  const tagFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};

    savedDestinations.forEach((dest) => {
      dest.tags.forEach((tag) => {
        // Normalize tag to lowercase for consistent counting
        const normalizedTag = tag.toLowerCase();
        frequency[normalizedTag] = (frequency[normalizedTag] || 0) + 1;
      });
    });

    return frequency;
  }, [savedDestinations]);

  // Get the unique tags sorted by frequency (most common first)
  const topTags = useMemo(() => {
    return Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])  // Sort by count descending
      .map(([tag]) => tag);          // Extract just the tag names
  }, [tagFrequency]);

  // Load random destinations (default behavior)
  const loadRandomDestinations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/destinations/random`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load personalized destinations based on user's saved tags
  const loadPersonalizedDestinations = useCallback(async (tags: string[]) => {
    setLoading(true);
    try {
      // Send tags as query parameter (comma-separated)
      const tagsParam = encodeURIComponent(tags.join(','));
      const response = await fetch(`${API_BASE_URL}/api/destinations/personalized?tags=${tagsParam}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      console.error("Failed to fetch personalized destinations:", err);
      showToast("Failed to load personalized destinations. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle the personalized toggle
  const handlePersonalizedToggle = useCallback(() => {
    if (!personalized) {
      // User is trying to turn ON personalization
      // Check if they have at least 5 unique tags from saved destinations
      const uniqueTagCount = topTags.length;

      if (uniqueTagCount < 5) {
        showToast(
          `You need to save more destinations first! You have ${uniqueTagCount} unique tags, but need at least 5.`,
          'error'
        );
        return; // Don't toggle
      }

      // They have enough tags - turn on personalization and fetch personalized data
      setPersonalized(true);
      loadPersonalizedDestinations(topTags.slice(0, 10)); // Use top 10 tags
    } else {
      // User is turning OFF personalization - go back to random
      setPersonalized(false);
      loadRandomDestinations();
    }
  }, [personalized, topTags, loadPersonalizedDestinations, loadRandomDestinations]);

  // Load random destinations on initial mount
  useEffect(() => {
    loadRandomDestinations();
  }, [loadRandomDestinations]);

  // displayedDestinations is now just the destinations array
  // (filtering is done server-side)
  const displayedDestinations = destinations;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">
      {/* Toast notification - appears in top right corner */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in">
          <div
            className={`
              flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border
              ${toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
              }
            `}
          >
            {toast.type === 'success' ? (
              <Lucide.CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <Lucide.XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <Lucide.X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedDestination(null)}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

          {/* Modal content */}
          <div
            className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 animate-modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedDestination(null)}
              className="absolute top-4 right-4 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <Lucide.X className="w-6 h-6" />
            </button>

            {/* Save button */}
            <button
              onClick={() => {
                toggleSaveDestination(selectedDestination);
              }}
              className={`absolute top-4 right-20 z-20 p-3 rounded-full transition-all ${
                savedDestinations.some(d => d.id === selectedDestination.id)
                  ? 'bg-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Lucide.Heart
                className={`w-6 h-6 ${
                  savedDestinations.some(d => d.id === selectedDestination.id) ? 'fill-current' : ''
                }`}
              />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Image section */}
              <div className="md:w-3/5 h-64 md:h-auto">
                <img
                  src={selectedDestination.imageUrl}
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details section */}
              <div className="md:w-2/5 p-8 md:p-10 overflow-y-auto bg-slate-900 text-white">
                {/* Location badge */}
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
                  <Lucide.MapPin className="w-4 h-4" />
                  {selectedDestination.location}
                </div>

                {/* Name */}
                <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
                  {selectedDestination.name}
                </h2>

                {/* Description */}
                <p className="text-slate-300 text-lg leading-relaxed mb-8 font-light">
                  {selectedDestination.description}
                </p>

                {/* Tags */}
                <div className="mb-8">
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDestination.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-white/10 text-white text-xs uppercase font-medium tracking-wider rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      toggleSaveDestination(selectedDestination);
                    }}
                    className={`flex-1 py-3 px-6 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
                      savedDestinations.some(d => d.id === selectedDestination.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Lucide.Heart
                      className={`w-5 h-5 ${
                        savedDestinations.some(d => d.id === selectedDestination.id) ? 'fill-current' : ''
                      }`}
                    />
                    {savedDestinations.some(d => d.id === selectedDestination.id) ? 'Saved' : 'Save to Passport'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <Lucide.Plane className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-serif tracking-tight">Voyager.</span>
        </div>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setCurrentView('explore')}
            className={`text-sm font-medium transition-colors ${currentView === 'explore' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Explore
          </button>
          <button
            onClick={() => requireAuth(() => setCurrentView('passport'), "Please sign in to view your Passport")}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${currentView === 'passport' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Passport
          </button>
          <button
            onClick={() => requireAuth(() => setCurrentView('trips'), "Please sign in to view your Trips")}
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${currentView === 'trips' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            Trips
          </button>
          <button
            onClick={() => setCurrentView('about')}
            className={`text-sm font-medium transition-colors ${currentView === 'about' ? 'text-emerald-600' : 'hover:text-emerald-600'}`}
          >
            About
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <button
                onClick={() => setCurrentView('profile')}
                className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <Lucide.User className="w-4 h-4 text-white" />
              </button>
            ) : (
              <Button variant="outline" className="flex items-center gap-2" onClick={() => setCurrentView('signIn')}>
                <Lucide.LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
            <Button variant="primary" onClick={() => requireAuth(handleNewTrip, "Please sign in to plan a trip")}>Plan Trip</Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <Lucide.X className="w-6 h-6" /> : <Lucide.Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-6 flex flex-col gap-4 z-50">
            <button
              onClick={() => { setCurrentView('explore'); setMobileMenuOpen(false); }}
              className={`text-left text-base font-medium py-2 transition-colors ${currentView === 'explore' ? 'text-emerald-600' : 'text-slate-700'}`}
            >
              Explore
            </button>
            <button
              onClick={() => { requireAuth(() => setCurrentView('passport'), "Please sign in to view your Passport"); setMobileMenuOpen(false); }}
              className={`text-left text-base font-medium py-2 transition-colors ${currentView === 'passport' ? 'text-emerald-600' : 'text-slate-700'}`}
            >
              Passport
            </button>
            <button
              onClick={() => { requireAuth(() => setCurrentView('trips'), "Please sign in to view your Trips"); setMobileMenuOpen(false); }}
              className={`text-left text-base font-medium py-2 transition-colors ${currentView === 'trips' ? 'text-emerald-600' : 'text-slate-700'}`}
            >
              Trips
            </button>
            <button
              onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }}
              className={`text-left text-base font-medium py-2 transition-colors ${currentView === 'about' ? 'text-emerald-600' : 'text-slate-700'}`}
            >
              About
            </button>
            {user && (
              <button
                onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }}
                className={`text-left text-base font-medium py-2 transition-colors flex items-center gap-2 ${currentView === 'profile' ? 'text-emerald-600' : 'text-slate-700'}`}
              >
                <Lucide.User className="w-4 h-4" />
                Profile
              </button>
            )}
            <div className="border-t border-slate-100 pt-4 flex flex-col gap-3">
              <Button variant="primary" className="w-full justify-center" onClick={() => { requireAuth(handleNewTrip, "Please sign in to plan a trip"); setMobileMenuOpen(false); }}>Plan Trip</Button>
              {!user && (
                <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => { setCurrentView('signIn'); setMobileMenuOpen(false); }}>
                  <Lucide.LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-20">
        {currentView === 'explore' ? (
          <>
            <HeroCarousel
              destinations={destinations}
              loading={loading}
              savedDestinations={savedDestinations}
              onToggleSave={toggleSaveDestination}
              onRefresh={() => {
                // Refresh with the appropriate data based on current mode
                if (personalized) {
                  loadPersonalizedDestinations(topTags.slice(0, 10));
                } else {
                  loadRandomDestinations();
                }
              }}
            />

            <section className="max-w-7xl mx-auto px-6 py-12 md:py-20">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <Lucide.Sparkles className="w-4 h-4" />
                    {personalized ? 'Curated For You' : 'Curated Collections'}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-xl">
                    {personalized ? 'Your Personalized Escapes' : 'Discover Your Next Adventure'}
                  </h2>
                  <p className="text-slate-500 mt-4 font-light">
                    Click on any destination to explore more
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4">
                  <Toggle
                    label="Personalized for Me"
                    active={personalized}
                    onToggle={handlePersonalizedToggle}
                  />
                  <p className="text-xs text-slate-400 italic">
                    {personalized
                      ? `Showing destinations matching your ${topTags.length} saved tags`
                      : 'Showing the global trending collection'
                    }
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
                        onClick={() => setSelectedDestination(dest)}
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

            {/* Trip Planning CTA */}
            <section className="max-w-7xl mx-auto px-6 pb-12 md:pb-20">
              <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-[80px] -ml-24 -mb-24" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 p-8 md:p-14">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                      <Lucide.Sparkles className="w-4 h-4" />
                      AI-Powered Trip Planner
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif leading-tight mb-4">
                      Turn your dream trip into a real itinerary
                    </h2>
                    <p className="text-slate-300 font-light text-lg leading-relaxed max-w-lg">
                      Tell us where you want to go, and our AI will craft a personalized day-by-day itinerary with activities, timings, and local recommendations.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => requireAuth(handleNewTrip, "Please sign in to plan a trip")}
                      className="group flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium py-4 px-8 rounded-full text-lg transition-all"
                    >
                      <Lucide.Map className="w-5 h-5" />
                      Plan a Trip
                      <Lucide.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : currentView === 'passport' ? (
          <Passport
            savedDestinations={savedDestinations}
            onToggleSave={toggleSaveDestination}
            onNavigateToDestinations={() => setCurrentView('explore')}
            onCardClick={(dest) => setSelectedDestination(dest)}
          />
        ) : currentView === 'tripForm' ? (
          <TripPlanningForm
            onSubmit={handleTripSubmit}
            onCancel={() => setCurrentView('trips')}
            savedDestinations={savedDestinations}
            googleMapsApiKey={(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''}
            userId={user?.id}
          />
        ) : currentView === 'signIn' ? (
          <SignIn
            onSignIn={() => {
              // After successful sign in, navigate back to destinations
              // The user state will be automatically updated by the auth listener
              setCurrentView('explore');
            }}
            onNavigateToRegister={() => setCurrentView('registration')}
          />
        ) : currentView === 'registration' ? (
          <Registration
            onRegister={() => {
              // After successful registration, navigate back to destinations
              // Note: If email confirmation is enabled in Supabase,
              // the user won't be logged in until they confirm their email
              setCurrentView('explore');
            }}
            onNavigateToSignIn={() => setCurrentView('signIn')}
          />
        ) : currentView === 'about' ? (
          <About onNavigateToExplore={() => setCurrentView('explore')} />
        ) : currentView === 'profile' && user ? (
          <Profile
            user={user}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            onUserUpdate={(updatedUser) => setUser(updatedUser)}
          />
        ) : (
          <Trips
            trips={trips}
            onDeleteTrip={handleTripDelete}
            onPlanTrip={handleNewTrip}
            onEditTrip={handleEditTrip}
          />
        )}

        {currentView === 'explore' && (
          <section className="bg-slate-50 py-24 px-6 mt-12 overflow-hidden relative">
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-6">
                <Lucide.Mail className="w-4 h-4" />
                Weekly Newsletter
              </div>
              <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
                Get personalised destinations delivered to your inbox
              </h2>
              <p className="text-lg text-slate-500 mb-10 font-light max-w-2xl mx-auto">
                Every week, we'll send you handpicked travel spots tailored to your interests. No spam, just wanderlust.
              </p>
              <Button onClick={handleSubscribe} className="py-4 mx-auto text-lg">
                Subscribe
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-[120px] opacity-30 -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[120px] opacity-30 -ml-48 -mb-48" />
          </section>
        )}
      </main>

      <footer className="py-12 px-6 md:px-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Lucide.Plane className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-serif tracking-tight">Voyager.</span>
        </div>
        <p className="text-slate-400 text-sm font-light">© 2026 Voyager Travel Inc. All rights reserved.</p>
        <div className="flex gap-6 text-slate-400">
          <a className="hover:text-slate-900 transition-colors"><Lucide.Info className="w-5 h-5" /></a>
          <a className="hover:text-slate-900 transition-colors text-sm font-medium">Privacy</a>
          <a className="hover:text-slate-900 transition-colors text-sm font-medium">Terms</a>
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

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out;
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
