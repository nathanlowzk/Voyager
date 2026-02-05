import React from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import { TripPlan } from './TripPlanningForm';

interface TripsProps {
  trips: TripPlan[];
  onDeleteTrip: (id: string) => void;
  onPlanTrip: () => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  SGD: 'S$', USD: '$', GBP: '\u00A3', JPY: '\u00A5', EUR: '\u20AC',
};

const COMPANION_LABELS: Record<string, string> = {
  solo: 'Solo', couple: 'Couple', family: 'Family', friends: 'Friends',
};

const ACTIVITY_LABELS: Record<string, string> = {
  'beaches': 'Beaches',
  'city-sightseeing': 'City Sightseeing',
  'outdoor-activities': 'Outdoor Activities',
  'festivals-events': 'Festivals / Events',
  'food-exploration': 'Food Exploration',
  'nightlife': 'Nightlife',
  'shopping': 'Shopping',
  'spa-wellness': 'Spa & Wellness',
};

const BUDGET_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getBudgetRange(range: string, symbol: string) {
  switch (range) {
    case 'low': return `${symbol}0 - ${symbol}1,000`;
    case 'medium': return `${symbol}1,000 - ${symbol}2,500`;
    case 'high': return `${symbol}2,500+`;
    default: return range;
  }
}

export function Trips({ trips, onDeleteTrip, onPlanTrip }: TripsProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
            <Lucide.Map className="w-4 h-4" />
            Your Trips
          </div>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-xl">
            Planned Adventures
          </h2>
          <p className="text-slate-500 mt-4 font-light">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
          </p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Lucide.Map className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-serif mb-2 text-slate-900">No trips planned yet</h3>
          <p className="text-slate-500 font-light mb-8 max-w-md">
            Start planning your dream trip by clicking the button below.
          </p>
          <Button onClick={onPlanTrip} variant="outline">
            Plan a Trip
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map(trip => {
            const symbol = CURRENCY_SYMBOLS[trip.currency] || trip.currency;
            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Lucide.MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-slate-900">{trip.destination}</h3>
                      <p className="text-xs text-slate-400">
                        Planned on {new Date(trip.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                  >
                    <Lucide.Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Wallet className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{BUDGET_LABELS[trip.budgetRange] || trip.budgetRange} ({getBudgetRange(trip.budgetRange, symbol)})</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{COMPANION_LABELS[trip.companions] || trip.companions}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600">
                    <Lucide.Sparkles className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1.5">
                      {trip.activities.map(a => (
                        <span
                          key={a}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-full"
                        >
                          {ACTIVITY_LABELS[a] || a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
