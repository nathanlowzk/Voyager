import React, { useState, useRef, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';

// --- Types ---

export interface TripPlan {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  currency: string;
  budgetRange: string;
  companions: string;
  activities: string[];
  createdAt: string;
}

interface TripPlanningFormProps {
  onSubmit: (trip: TripPlan) => void;
}

// --- Destination suggestions ---

const DESTINATIONS = [
  "Amsterdam, Netherlands", "Athens, Greece", "Auckland, New Zealand",
  "Bali, Indonesia", "Bangkok, Thailand", "Barcelona, Spain", "Berlin, Germany",
  "Buenos Aires, Argentina", "Cairo, Egypt", "Cape Town, South Africa",
  "Cancun, Mexico", "Copenhagen, Denmark", "Dubai, UAE", "Dublin, Ireland",
  "Edinburgh, Scotland", "Florence, Italy", "Hanoi, Vietnam",
  "Havana, Cuba", "Helsinki, Finland", "Hong Kong, China",
  "Istanbul, Turkey", "Jakarta, Indonesia", "Kyoto, Japan",
  "Lisbon, Portugal", "London, United Kingdom", "Los Angeles, USA",
  "Madrid, Spain", "Marrakech, Morocco", "Melbourne, Australia",
  "Mexico City, Mexico", "Milan, Italy", "Mumbai, India",
  "Munich, Germany", "Nairobi, Kenya", "New York, USA",
  "Osaka, Japan", "Oslo, Norway", "Paris, France",
  "Prague, Czech Republic", "Queenstown, New Zealand", "Reykjavik, Iceland",
  "Rio de Janeiro, Brazil", "Rome, Italy", "San Francisco, USA",
  "Santorini, Greece", "Seoul, South Korea", "Singapore, Singapore",
  "Stockholm, Sweden", "Sydney, Australia", "Taipei, Taiwan",
  "Tokyo, Japan", "Toronto, Canada", "Vancouver, Canada",
  "Venice, Italy", "Vienna, Austria", "Zurich, Switzerland",
];

// --- Currency config ---

const CURRENCIES = [
  { code: 'SGD', symbol: 'S$', label: 'SGD' },
  { code: 'USD', symbol: '$', label: 'USD' },
  { code: 'GBP', symbol: '\u00A3', label: 'GBP' },
  { code: 'JPY', symbol: '\u00A5', label: 'JPY' },
  { code: 'EUR', symbol: '\u20AC', label: 'EUR' },
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

// --- Component ---

export function TripPlanningForm({ onSubmit }: TripPlanningFormProps) {
  // Field 1
  const [destination, setDestination] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Field 2
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  // Field 3
  const [currency, setCurrency] = useState('SGD');
  const [budgetRange, setBudgetRange] = useState('');

  // Field 4
  const [companions, setCompanions] = useState('');

  // Field 5
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  // Validation
  const [errors, setErrors] = useState<string[]>([]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // --- Field 1: Destination ---
  const filteredDestinations = destination.length >= 2
    ? DESTINATIONS.filter(d => d.toLowerCase().includes(destination.toLowerCase())).slice(0, 8)
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

  const budgetRanges = [
    { value: 'low', label: `Low`, range: `${currencyObj.symbol}0 - ${currencyObj.symbol}1,000` },
    { value: 'medium', label: `Medium`, range: `${currencyObj.symbol}1,000 - ${currencyObj.symbol}2,500` },
    { value: 'high', label: `High`, range: `${currencyObj.symbol}2,500+` },
  ];

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
    if (!budgetRange) newErrors.push('budget');
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
      budgetRange,
      companions,
      activities: selectedActivities,
      createdAt: new Date().toISOString(),
    };

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
        {/* Field 1: Destination */}
        <div>
          <label className={sectionLabel}>What is your destination of choice?</label>
          <div className="relative" ref={suggestionsRef}>
            <div className="relative">
              <Lucide.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => { setDestination(e.target.value); setShowSuggestions(true); }}
                onFocus={() => { if (destination.length >= 2) setShowSuggestions(true); }}
                placeholder="Search for a city or destination..."
                className={`w-full pl-12 pr-4 py-4 rounded-full border-2 text-base outline-none transition-all ${fieldHasError('destination') ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'}`}
              />
            </div>
            {showSuggestions && filteredDestinations.length > 0 && (
              <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {filteredDestinations.map(d => (
                  <button
                    key={d}
                    onClick={() => { setDestination(d); setShowSuggestions(false); }}
                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 transition-colors text-sm flex items-center gap-3"
                  >
                    <Lucide.MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-700">{d}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {fieldHasError('destination') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select a destination</p>
          )}
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
          <div className="flex flex-col gap-4">
            {/* Currency selector */}
            <div className="flex items-center gap-3">
              <Lucide.Wallet className="w-5 h-5 text-slate-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-4 py-3 rounded-full border-2 border-slate-200 text-sm font-medium outline-none focus:border-emerald-500 transition-all bg-white cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>
                ))}
              </select>
            </div>

            {/* Range pills */}
            <div className="flex flex-wrap gap-3">
              {budgetRanges.map(r => (
                <button
                  key={r.value}
                  onClick={() => setBudgetRange(r.value)}
                  className={`${pillBase} ${budgetRange === r.value ? pillActive : pillInactive} flex-col items-start !rounded-2xl !px-6 !py-4`}
                >
                  <span className="font-semibold">{r.label}</span>
                  <span className="text-xs opacity-70">{r.range}</span>
                </button>
              ))}
            </div>
          </div>
          {fieldHasError('budget') && (
            <p className="text-rose-500 text-xs mt-2 ml-4">Please select a budget range</p>
          )}
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
