import React from 'react';
import * as Lucide from 'lucide-react';
import { Destination, DestinationCard } from './DestinationCard';
import { Button } from './Button';

interface PassportProps {
  savedDestinations: Destination[];
  onToggleSave: (dest: Destination) => void;
  onNavigateToDestinations: () => void;
}

export function Passport({ savedDestinations, onToggleSave, onNavigateToDestinations }: PassportProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 min-h-[60vh]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-bold tracking-widest text-[10px] uppercase mb-4">
            <Lucide.Heart className="w-4 h-4 fill-current" />
            Your Travel Passport
          </div>
          <h2 className="text-4xl md:text-5xl font-serif leading-tight max-w-xl">
            Saved Destinations
          </h2>
          <p className="text-slate-500 mt-4 font-light">
            {savedDestinations.length} {savedDestinations.length === 1 ? 'destination' : 'destinations'} in your collection
          </p>
        </div>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <Lucide.Heart className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-serif mb-2 text-slate-900">Your passport is empty</h3>
          <p className="text-slate-500 font-light mb-8 max-w-md">
            Start building your dream travel collection by clicking the heart icon on destinations that inspire you.
          </p>
          <Button onClick={onNavigateToDestinations} variant="outline">
            Discover Destinations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {savedDestinations.map((dest) => (
            <DestinationCard
              key={dest.id}
              dest={dest}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      )}
    </section>
  );
}
