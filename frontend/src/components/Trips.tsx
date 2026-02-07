import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import { TripPlan, ItineraryDay } from './TripPlanningForm';

interface TripsProps {
  trips: TripPlan[];
  onDeleteTrip: (id: string) => void;
  onPlanTrip: () => void;
  onEditTrip: (trip: TripPlan) => void;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  SGD: 'S$', USD: '$', GBP: '\u00A3', JPY: '\u00A5', EUR: '\u20AC',
};

const COMPANION_LABELS: Record<string, string> = {
  solo: 'Solo', couple: 'Couple', family: 'Family', friends: 'Friends',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatAmount(amount: number) {
  return amount.toLocaleString();
}

function calculateTotalBudget(budgetAmount: number, numberOfPeople: number | undefined, companions: string): number {
  if (companions === 'solo') {
    return budgetAmount;
  }
  return budgetAmount * (numberOfPeople || 1);
}

function getCompanionDisplay(companions: string, numberOfPeople: number | undefined): string {
  const label = COMPANION_LABELS[companions] || companions;
  if (companions === 'solo') {
    return label;
  }
  return `${label} (${numberOfPeople || 2})`;
}

// Trip Detail Modal Component
function TripDetailModal({
  trip,
  onClose,
  onEdit,
  onDelete
}: {
  trip: TripPlan;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const symbol = CURRENCY_SYMBOLS[trip.currency] || trip.currency;
  const totalBudget = calculateTotalBudget(trip.budgetAmount, trip.numberOfPeople, trip.companions);
  const numberOfPeople = trip.companions === 'solo' ? 1 : (trip.numberOfPeople || 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Lucide.MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-slate-900">{trip.tripName || trip.destination}</h2>
              {trip.countries && trip.countries.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {trip.countries.map((country, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Planned on {new Date(trip.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <Lucide.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Travel Dates */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-2">
              <Lucide.Calendar className="w-4 h-4" />
              Travel Dates
            </div>
            <p className="text-lg text-slate-800">
              {formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}
            </p>
          </div>

          {/* Travelers & Budget Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Travelers */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-2">
                <Lucide.Users className="w-4 h-4" />
                Travelers
              </div>
              <p className="text-lg text-slate-800">
                {getCompanionDisplay(trip.companions, trip.numberOfPeople)}
              </p>
            </div>

            {/* Budget */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-2">
                <Lucide.Wallet className="w-4 h-4" />
                Total Budget
              </div>
              <p className="text-lg text-slate-800">
                {symbol}{formatAmount(totalBudget)}
                {trip.budgetAmount >= 10000 && <span className="text-emerald-500">++</span>}
              </p>
              {numberOfPeople > 1 && (
                <p className="text-xs text-slate-500 mt-1">
                  {symbol}{formatAmount(trip.budgetAmount)} per person
                </p>
              )}
            </div>
          </div>

          {/* Itinerary */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-3">
                <Lucide.Route className="w-4 h-4" />
                Itinerary
              </div>
              <div className="space-y-4">
                {trip.itinerary.map((day: ItineraryDay) => (
                  <div key={day.day} className="bg-slate-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {day.day}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatDate(day.date)}
                      </span>
                    </div>
                    <div className="space-y-3 ml-9">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-xs text-emerald-600 font-medium whitespace-nowrap pt-0.5 w-16 shrink-0">
                            {activity.time}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 text-sm">{activity.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{activity.description}</p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Lucide.MapPin className="w-3 h-3" />
                              {activity.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onDelete}
            className="px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-full transition-all flex items-center gap-2"
          >
            <Lucide.Trash2 className="w-4 h-4" />
            Delete
          </button>
          <Button onClick={onEdit} className="flex items-center gap-2">
            <Lucide.Pencil className="w-4 h-4" />
            Edit Trip
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Trips({ trips, onDeleteTrip, onPlanTrip, onEditTrip }: TripsProps) {
  const [selectedTrip, setSelectedTrip] = useState<TripPlan | null>(null);

  const handleEditTrip = (trip: TripPlan) => {
    setSelectedTrip(null);
    onEditTrip(trip);
  };

  const handleDeleteTrip = (tripId: string) => {
    setSelectedTrip(null);
    onDeleteTrip(tripId);
  };

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
            const totalBudget = calculateTotalBudget(trip.budgetAmount, trip.numberOfPeople, trip.companions);

            return (
              <div
                key={trip.id}
                onClick={() => setSelectedTrip(trip)}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Lucide.MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-slate-900">{trip.tripName || trip.destination}</h3>
                      {trip.countries && trip.countries.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {trip.countries.map((country, i) => (
                            <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                              {country}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          {trip.destination}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditTrip(trip); }}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
                      title="Edit trip"
                    >
                      <Lucide.Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                      title="Delete trip"
                    >
                      <Lucide.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatDate(trip.startDate)} &mdash; {formatDate(trip.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Wallet className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Total: {symbol}{formatAmount(totalBudget)}
                      {trip.budgetAmount >= 10000 && <span className="text-emerald-500">++</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Lucide.Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{getCompanionDisplay(trip.companions, trip.numberOfPeople)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trip Detail Modal */}
      {selectedTrip && (
        <TripDetailModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onEdit={() => handleEditTrip(selectedTrip)}
          onDelete={() => handleDeleteTrip(selectedTrip.id)}
        />
      )}
    </section>
  );
}
