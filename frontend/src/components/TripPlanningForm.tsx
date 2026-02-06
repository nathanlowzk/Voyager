import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import { Destination } from './DestinationCard';

// --- Budget slider config ---
const BUDGET_MAX = 10000;
const BUDGET_STEP = 100;

// --- Types ---

// A specific place the user wants to visit
export interface SpecificDestination {
  id: string;
  name: string;
  address: string;
  placeId?: string; // Google Maps place ID
}

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  currency: string;
  budgetRange: string;
  companions: string;
  activities: string[];
  specificDestinations: SpecificDestination[];
  createdAt: string;
}

interface TripPlanningFormProps {
  onSubmit: (trip: TripPlan) => void;
  savedDestinations: Destination[];
  googleMapsApiKey: string;
  userId?: string; // User ID for user-specific form caching
}

// --- Countries and Regions ---

// Regions
const REGIONS = [
  "Oceania",
  "East Asia",
  "Middle East",
  "South East Asia",
  "Europe",
  "North America",
  "South America",
  "Central America",
  "Africa",
];

// 193 UN member states + Vatican City, Palestine, Taiwan, Kosovo
const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (Democratic Republic)",
  "Congo (Republic)",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// Combined list: Regions first (marked), then countries
const DESTINATIONS = [
  ...REGIONS.map(r => ({ name: r, isRegion: true })),
  ...COUNTRIES.map(c => ({ name: c, isRegion: false })),
];

// --- Currency config (SGD and USD only) ---

const CURRENCIES = [
  { code: 'SGD', symbol: 'S$', label: 'SGD' },
  { code: 'USD', symbol: '$', label: 'USD' },
];

// --- Companion options ---

const COMPANIONS = [
  { value: 'solo', label: 'Solo', icon: Lucide.User },
  { value: 'couple', label: 'Couple', icon: Lucide.Heart },
  { value: 'family', label: 'Family', icon: Lucide.Users },
  { value: 'friends', label: 'Friends', icon: Lucide.UsersRound },
];

// --- Activity options ---

const ACTIVITIES = [
  { value: 'beaches', label: 'Beaches', icon: Lucide.Waves },
  { value: 'city-sightseeing', label: 'City Sightseeing', icon: Lucide.Building2 },
  { value: 'outdoor-activities', label: 'Outdoor Activities', icon: Lucide.Mountain },
  { value: 'festivals-events', label: 'Festivals / Events', icon: Lucide.PartyPopper },
  { value: 'food-exploration', label: 'Food Exploration', icon: Lucide.UtensilsCrossed },
  { value: 'nightlife', label: 'Nightlife', icon: Lucide.Moon },
  { value: 'shopping', label: 'Shopping', icon: Lucide.ShoppingBag },
  { value: 'spa-wellness', label: 'Spa & Wellness', icon: Lucide.Flower2 },
];

// --- Country code mapping for Google Maps API ---
const COUNTRY_CODES: Record<string, string> = {
  "Afghanistan": "af", "Albania": "al", "Algeria": "dz", "Andorra": "ad", "Angola": "ao",
  "Argentina": "ar", "Armenia": "am", "Australia": "au", "Austria": "at", "Azerbaijan": "az",
  "Bahamas": "bs", "Bahrain": "bh", "Bangladesh": "bd", "Barbados": "bb", "Belarus": "by",
  "Belgium": "be", "Belize": "bz", "Benin": "bj", "Bhutan": "bt", "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba", "Botswana": "bw", "Brazil": "br", "Brunei": "bn", "Bulgaria": "bg",
  "Cambodia": "kh", "Cameroon": "cm", "Canada": "ca", "Chile": "cl", "China": "cn",
  "Colombia": "co", "Costa Rica": "cr", "Croatia": "hr", "Cuba": "cu", "Cyprus": "cy",
  "Czech Republic": "cz", "Denmark": "dk", "Dominican Republic": "do", "Ecuador": "ec", "Egypt": "eg",
  "El Salvador": "sv", "Estonia": "ee", "Ethiopia": "et", "Fiji": "fj", "Finland": "fi",
  "France": "fr", "Germany": "de", "Ghana": "gh", "Greece": "gr", "Guatemala": "gt",
  "Honduras": "hn", "Hungary": "hu", "Iceland": "is", "India": "in", "Indonesia": "id",
  "Iran": "ir", "Iraq": "iq", "Ireland": "ie", "Israel": "il", "Italy": "it",
  "Jamaica": "jm", "Japan": "jp", "Jordan": "jo", "Kazakhstan": "kz", "Kenya": "ke",
  "Kuwait": "kw", "Laos": "la", "Latvia": "lv", "Lebanon": "lb", "Lithuania": "lt",
  "Luxembourg": "lu", "Madagascar": "mg", "Malaysia": "my", "Maldives": "mv", "Malta": "mt",
  "Mexico": "mx", "Monaco": "mc", "Mongolia": "mn", "Montenegro": "me", "Morocco": "ma",
  "Myanmar": "mm", "Nepal": "np", "Netherlands": "nl", "New Zealand": "nz", "Nicaragua": "ni",
  "Nigeria": "ng", "Norway": "no", "Oman": "om", "Pakistan": "pk", "Panama": "pa",
  "Paraguay": "py", "Peru": "pe", "Philippines": "ph", "Poland": "pl", "Portugal": "pt",
  "Qatar": "qa", "Romania": "ro", "Russia": "ru", "Saudi Arabia": "sa", "Senegal": "sn",
  "Serbia": "rs", "Singapore": "sg", "Slovakia": "sk", "Slovenia": "si", "South Africa": "za",
  "South Korea": "kr", "Spain": "es", "Sri Lanka": "lk", "Sweden": "se", "Switzerland": "ch",
  "Taiwan": "tw", "Tanzania": "tz", "Thailand": "th", "Tunisia": "tn", "Turkey": "tr",
  "Ukraine": "ua", "United Arab Emirates": "ae", "United Kingdom": "gb", "United States": "us",
  "Uruguay": "uy", "Uzbekistan": "uz", "Vatican City": "va", "Venezuela": "ve", "Vietnam": "vn",
  "Zambia": "zm", "Zimbabwe": "zw"
};

function getCountryCode(country: string): string | null {
  return COUNTRY_CODES[country] || null;
}

// --- Calendar helpers ---

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- Form cache config ---
const FORM_CACHE_KEY_PREFIX = 'voyager-trip-form-cache';

interface FormCache {
  destination: string;
  specificDestinations: SpecificDestination[];
  startDate: string | null;
  endDate: string | null;
  calMonth: number;
  calYear: number;
  currency: string;
  budgetAmount: number;
  companions: string;
  selectedActivities: string[];
  savedAt: number;
}

// Helper to get user-specific cache key
function getFormCacheKey(userId?: string): string {
  return userId ? `${FORM_CACHE_KEY_PREFIX}_${userId}` : FORM_CACHE_KEY_PREFIX;
}

// --- Component ---

export function TripPlanningForm({ onSubmit, savedDestinations, googleMapsApiKey, userId }: TripPlanningFormProps) {
  // Track if initial load from cache is done
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the cache key for the current user
  const cacheKey = getFormCacheKey(userId);

  // Field 1
  const [destination, setDestination] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Specific destinations section
  const [specificDestinations, setSpecificDestinations] = useState<SpecificDestination[]>([]);
  const [placeSearch, setPlaceSearch] = useState('');
  const [placePredictions, setPlacePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPlaceSuggestions, setShowPlaceSuggestions] = useState(false);
  const placesRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Field 2
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // Field 3: Budget
  const [currency, setCurrency] = useState('SGD');
  const [budgetAmount, setBudgetAmount] = useState(5000); // Slider value

  // Field 4
  const [companions, setCompanions] = useState('');

  // Field 5
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Load cached form data on mount or when user changes
  useEffect(() => {
    // Reset form state first when user changes
    setDestination('');
    setSpecificDestinations([]);
    setStartDate(null);
    setEndDate(null);
    setCalMonth(today.getMonth());
    setCalYear(today.getFullYear());
    setCurrency('SGD');
    setBudgetAmount(5000);
    setCompanions('');
    setSelectedActivities([]);
    setIsInitialized(false);

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data: FormCache = JSON.parse(cached);
        // Only restore if cache is less than 24 hours old
        const cacheAge = Date.now() - data.savedAt;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (cacheAge < maxAge) {
          setDestination(data.destination || '');
          setSpecificDestinations(data.specificDestinations || []);
          setStartDate(data.startDate);
          setEndDate(data.endDate);
          setCalMonth(data.calMonth ?? today.getMonth());
          setCalYear(data.calYear ?? today.getFullYear());
          setCurrency(data.currency || 'SGD');
          setBudgetAmount(data.budgetAmount ?? 5000);
          setCompanions(data.companions || '');
          setSelectedActivities(data.selectedActivities || []);
        }
      }
    } catch (err) {
      console.error('Failed to load form cache:', err);
    }
    setIsInitialized(true);
  }, [cacheKey]);

  // Save form data to cache whenever it changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save until initial load is done

    const formData: FormCache = {
      destination,
      specificDestinations,
      startDate,
      endDate,
      calMonth,
      calYear,
      currency,
      budgetAmount,
      companions,
      selectedActivities,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(formData));
    } catch (err) {
      console.error('Failed to save form cache:', err);
    }
  }, [isInitialized, cacheKey, destination, specificDestinations, startDate, endDate, calMonth, calYear, currency, budgetAmount, companions, selectedActivities]);

  // Clear form cache
  const clearFormCache = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (err) {
      console.error('Failed to clear form cache:', err);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (placesRef.current && !placesRef.current.contains(e.target as Node)) {
        setShowPlaceSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setGoogleMapsLoaded(true);
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      setGoogleMapsLoaded(true);
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove the script as it might be used elsewhere
    };
  }, [googleMapsApiKey]);

  // Handle place search with debounce
  const searchPlaces = useCallback((input: string) => {
    if (!autocompleteServiceRef.current || input.length < 2) {
      setPlacePredictions([]);
      return;
    }

    // Add country restriction if a country is selected (not a region)
    const isRegion = REGIONS.includes(destination);
    const request: google.maps.places.AutocompletionRequest = {
      input,
      types: ['establishment', 'geocode'],
    };

    // If a specific country is selected, restrict to that country
    if (destination && !isRegion) {
      // Get ISO country code (simplified mapping for common countries)
      const countryCode = getCountryCode(destination);
      if (countryCode) {
        request.componentRestrictions = { country: countryCode };
      }
    }

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPlacePredictions(predictions);
        } else {
          setPlacePredictions([]);
        }
      }
    );
  }, [destination]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (placeSearch.length >= 2) {
        searchPlaces(placeSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [placeSearch, searchPlaces]);

  // Add a place from Google Maps search
  const addPlaceFromSearch = (prediction: google.maps.places.AutocompletePrediction) => {
    const newDest: SpecificDestination = {
      id: `place-${Date.now()}`,
      name: prediction.structured_formatting.main_text,
      address: prediction.description,
      placeId: prediction.place_id,
    };
    setSpecificDestinations(prev => [...prev, newDest]);
    setPlaceSearch('');
    setPlacePredictions([]);
    setShowPlaceSuggestions(false);
  };

  // Add a saved destination to specific destinations
  const addSavedDestination = (dest: Destination) => {
    // Check if already added
    if (specificDestinations.some(d => d.id === `saved-${dest.id}`)) return;

    const newDest: SpecificDestination = {
      id: `saved-${dest.id}`,
      name: dest.name,
      address: dest.location,
    };
    setSpecificDestinations(prev => [...prev, newDest]);
  };

  // Remove a specific destination
  const removeSpecificDestination = (id: string) => {
    setSpecificDestinations(prev => prev.filter(d => d.id !== id));
  };

  // Filter saved destinations by selected country/region
  const filteredSavedDestinations = savedDestinations.filter(dest => {
    if (!destination) return false;

    const isRegion = REGIONS.includes(destination);

    if (isRegion) {
      // Match by region
      return dest.region?.toLowerCase() === destination.toLowerCase();
    } else {
      // Match by country (check location field for country name)
      const locationLower = dest.location.toLowerCase();
      const destLower = destination.toLowerCase();
      return locationLower.includes(destLower) || dest.country?.toLowerCase() === destLower;
    }
  });

  // --- Field 1: Country/Region ---
  const filteredDestinations = destination.length >= 2
    ? DESTINATIONS.filter(d => d.name.toLowerCase().includes(destination.toLowerCase())).slice(0, 8)
    : [];

  // --- Field 2: Calendar ---
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  function handleDayClick(dateStr: string) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate(null);
    } else {
      if (dateStr < startDate) {
        setStartDate(dateStr);
      } else {
        setEndDate(dateStr);
      }
    }
  }

  function isInRange(dateStr: string) {
    if (!startDate || !endDate) return false;
    return dateStr >= startDate && dateStr <= endDate;
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  }

  // --- Field 3: Budget ---
  const currencyObj = CURRENCIES.find(c => c.code === currency)!;

  // Format amount with commas
  const formatAmount = (amount: number) => amount.toLocaleString();

  // Get the budget range string for form submission
  const getBudgetRangeString = () => {
    if (budgetAmount >= BUDGET_MAX) {
      return `${currencyObj.symbol}${formatAmount(BUDGET_MAX)}++`;
    }
    return `${currencyObj.symbol}${formatAmount(budgetAmount)}`;
  };

  // --- Field 5: Activities ---
  function toggleActivity(value: string) {
    setSelectedActivities(prev =>
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  }

  // --- Submit ---
  function handleSubmit() {
    const newErrors: string[] = [];
    if (!destination.trim()) newErrors.push('destination');
    if (!startDate || !endDate) newErrors.push('dates');
    if (!companions) newErrors.push('companions');
    if (selectedActivities.length === 0) newErrors.push('activities');
    setErrors(newErrors);
    if (newErrors.length > 0) return;

    const trip: TripPlan = {
      id: `trip-${Date.now()}`,
      destination,
      startDate: startDate!,
      endDate: endDate!,
      currency,
      budgetRange: getBudgetRangeString(),
      companions,
      activities: selectedActivities,
      specificDestinations,
      createdAt: new Date().toISOString(),
    };

    // Clear the form cache after successful submission
    clearFormCache();

    onSubmit(trip);
  }

  const fieldHasError = (field: string) => errors.includes(field);

  // --- Shared styles ---
  const sectionLabel = "text-lg font-serif text-slate-900 mb-4";
  const pillBase = "px-5 py-3 rounded-full border-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2 select-none";
  const pillActive = "border-emerald-500 bg-emerald-50 text-emerald-700";
  const pillInactive = "border-slate-200 text-slate-600 hover:border-slate-300";

  return (
    <section className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
          <Lucide.Map className="w-4 h-4" />
          Plan Your Journey
        </div>
        <h2 className="text-4xl md:text-5xl font-serif leading-tight">
          Let's plan your next adventure
        </h2>
      </div>

      <div className="space-y-10">
        {/* Field 1: Country/Region */}
        <div>
          <label className={sectionLabel}>Which country or region do you want to visit?</label>
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <Lucide.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (destination.length >= 2) setShowSuggestions(true); }}
                placeholder="Type to search countries or regions..."
                className={`w-full pl-12 pr-4 py-4 rounded-full border-2 text-base outline-none transition-all ${fieldHasError('destination') ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'}`}
              />
            </div>
            {showSuggestions && filteredDestinations.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                {filteredDestinations.map(d => (
                  <button
                    key={d.name}
                    onClick={() => { setDestination(d.name); setShowSuggestions(false); }}
                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 transition-colors text-sm flex items-center gap-3"
                  >
                    {d.isRegion ? (
                      <Lucide.Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Lucide.MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-slate-700">{d.name}</span>
                    {d.isRegion && (
                      <span className="ml-auto text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Region</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {fieldHasError('destination') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select a country or region</p>
          )}
        </div>

        {/* Specific Destinations Section */}
        <div className="rounded-3xl border-2 border-slate-200 p-6 bg-gradient-to-br from-slate-50 to-white">
          <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-2">
            <Lucide.Navigation className="w-4 h-4" />
            Optional
          </div>
          <label className={sectionLabel}>Any specific destinations in mind?</label>
          <p className="text-sm text-slate-500 mb-6">Search for places or select from your saved destinations</p>

          {/* Part 1: Google Maps Search */}
          <div className="relative mb-6" ref={placesRef}>
            <div className="relative">
              <Lucide.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => { setPlaceSearch(e.target.value); setShowPlaceSuggestions(true); }}
                onFocus={() => { if (placeSearch.length >= 2) setShowPlaceSuggestions(true); }}
                placeholder={googleMapsLoaded ? "Search for attractions, hotels, restaurants..." : "Loading Google Maps..."}
                disabled={!googleMapsLoaded}
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 text-base outline-none transition-all focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
            {showPlaceSuggestions && placePredictions.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                {placePredictions.map(prediction => (
                  <button
                    key={prediction.place_id}
                    onClick={() => addPlaceFromSearch(prediction)}
                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 transition-colors text-sm flex items-center gap-3"
                  >
                    <Lucide.MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-700 font-medium truncate">{prediction.structured_formatting.main_text}</span>
                      <span className="text-slate-400 text-xs truncate">{prediction.structured_formatting.secondary_text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Saved Destinations (filtered by country/region) */}
          {destination && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Lucide.Heart className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-medium text-slate-700">
                  Your saved destinations in {destination}
                </span>
              </div>
              {filteredSavedDestinations.length > 0 ? (
                <div
                  className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {filteredSavedDestinations.map(dest => {
                    const isAdded = specificDestinations.some(d => d.id === `saved-${dest.id}`);
                    return (
                      <button
                        key={dest.id}
                        onClick={() => addSavedDestination(dest)}
                        disabled={isAdded}
                        className={`shrink-0 w-48 rounded-2xl border-2 overflow-hidden transition-all ${
                          isAdded
                            ? 'border-emerald-500 bg-emerald-50 opacity-60 cursor-not-allowed'
                            : 'border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        {dest.imageUrl && (
                          <div className="h-24 overflow-hidden">
                            <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3">
                          <p className="font-medium text-sm text-slate-800 truncate">{dest.name}</p>
                          <p className="text-xs text-slate-500 truncate">{dest.location}</p>
                          {isAdded && (
                            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                              <Lucide.Check className="w-3 h-3" /> Added
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Lucide.MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No saved destinations in {destination}</p>
                  <p className="text-xs text-slate-400 mt-1">Save destinations from the Explore page</p>
                </div>
              )}
            </div>
          )}

          {/* Part 3: Accumulated Destinations */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lucide.ListChecks className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700">
                Selected places ({specificDestinations.length})
              </span>
            </div>
            {specificDestinations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {specificDestinations.map(dest => (
                  <div
                    key={dest.id}
                    className="flex items-center gap-2 pl-4 pr-2 py-2 bg-emerald-50 border border-emerald-200 rounded-full"
                  >
                    <Lucide.MapPin className="w-3 h-3 text-emerald-600" />
                    <span className="text-sm text-emerald-800 font-medium">{dest.name}</span>
                    <button
                      onClick={() => removeSpecificDestination(dest.id)}
                      className="p-1 hover:bg-emerald-200 rounded-full transition-colors"
                    >
                      <Lucide.X className="w-3 h-3 text-emerald-600" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500">No places selected yet</p>
                <p className="text-xs text-slate-400 mt-1">Search above or pick from your saved destinations</p>
              </div>
            )}
          </div>
        </div>

        {/* Field 2: Travel Dates */}
        <div>
          <label className={sectionLabel}>When are you planning to travel?</label>
          <div className={`rounded-3xl border-2 p-6 transition-all ${fieldHasError('dates') ? 'border-rose-400' : 'border-slate-200'}`}>
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Lucide.ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <span className="text-base font-semibold text-slate-800">
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Lucide.ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_HEADERS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = toDateStr(calYear, calMonth, day);
                const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
                const isStart = dateStr === startDate;
                const isEnd = dateStr === endDate;
                const inRange = isInRange(dateStr);

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(dateStr)}
                    className={`
                      relative py-2 text-sm font-medium transition-all rounded-full mx-0.5 my-0.5
                      ${isStart || isEnd ? 'bg-emerald-500 text-white' : ''}
                      ${inRange && !isStart && !isEnd ? 'bg-emerald-100 text-emerald-800' : ''}
                      ${!isStart && !isEnd && !inRange ? 'hover:bg-slate-100 text-slate-700' : ''}
                      ${isToday && !isStart && !isEnd && !inRange ? 'ring-2 ring-emerald-400' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Selected range display */}
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
              <Lucide.Calendar className="w-4 h-4" />
              {startDate && endDate ? (
                <span>{formatDisplayDate(startDate)} &mdash; {formatDisplayDate(endDate)}</span>
              ) : startDate ? (
                <span>{formatDisplayDate(startDate)} &mdash; Select end date</span>
              ) : (
                <span className="italic">Select your travel dates</span>
              )}
            </div>
          </div>
          {fieldHasError('dates') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select both start and end dates</p>
          )}
        </div>

        {/* Field 3: Budget */}
        <div>
          <label className={sectionLabel}>What is your budget?</label>
          <div className="flex flex-col gap-6">
            {/* Currency toggle */}
            <div className="flex items-center gap-4">
              <Lucide.Wallet className="w-5 h-5 text-slate-400" />
              <div className="flex rounded-full border-2 border-slate-200 overflow-hidden">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`px-5 py-2 text-sm font-medium transition-all ${
                      currency === c.code
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c.symbol} {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget display */}
            <div className="text-center">
              <div className="text-4xl font-serif text-slate-900 mb-2">
                {budgetAmount >= BUDGET_MAX ? (
                  <>{currencyObj.symbol}{formatAmount(BUDGET_MAX)}<span className="text-emerald-500">++</span></>
                ) : (
                  <>{currencyObj.symbol}{formatAmount(budgetAmount)}</>
                )}
              </div>
              <p className="text-sm text-slate-500">
                {budgetAmount >= BUDGET_MAX ? 'No budget limit' : 'per person'}
              </p>
            </div>

            {/* Slider */}
            <div className="px-2">
              <input
                type="range"
                min={0}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-emerald-500
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:hover:scale-110
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-emerald-500
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(budgetAmount / BUDGET_MAX) * 100}%, #e2e8f0 ${(budgetAmount / BUDGET_MAX) * 100}%, #e2e8f0 100%)`
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>{currencyObj.symbol}0</span>
                <span>{currencyObj.symbol}{formatAmount(2500)}</span>
                <span>{currencyObj.symbol}{formatAmount(5000)}</span>
                <span>{currencyObj.symbol}{formatAmount(7500)}</span>
                <span>{currencyObj.symbol}{formatAmount(BUDGET_MAX)}++</span>
              </div>
            </div>
          </div>
        </div>

        {/* Field 4: Travel Companions */}
        <div>
          <label className={sectionLabel}>Who do you plan on traveling with on your next adventure?</label>
          <div className="flex flex-wrap gap-3">
            {COMPANIONS.map(c => {
              const Icon = c.icon;
              return (
                <button
                  key={c.value}
                  onClick={() => setCompanions(c.value)}
                  className={`${pillBase} ${companions === c.value ? pillActive : pillInactive}`}
                >
                  <Icon className="w-4 h-4" />
                  {c.label}
                </button>
              );
            })}
          </div>
          {fieldHasError('companions') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select who you're traveling with</p>
          )}
        </div>

        {/* Field 5: Activities */}
        <div>
          <label className={sectionLabel}>Which activities are you interested in?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIVITIES.map(a => {
              const Icon = a.icon;
              const isSelected = selectedActivities.includes(a.value);
              return (
                <button
                  key={a.value}
                  onClick={() => toggleActivity(a.value)}
                  className={`${pillBase} ${isSelected ? pillActive : pillInactive} flex-col items-center justify-center !rounded-2xl !py-5 text-center`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs leading-tight">{a.label}</span>
                </button>
              );
            })}
          </div>
          {fieldHasError('activities') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select at least one activity</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-4">
          <Button onClick={handleSubmit} className="py-4 px-12 text-lg">
            Submit Trip Plan
          </Button>
        </div>
      </div>
    </section>
  );
}
