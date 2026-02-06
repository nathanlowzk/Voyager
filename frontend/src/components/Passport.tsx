import React, { useMemo } from 'react';
import * as Lucide from 'lucide-react';
import { Destination, DestinationCard } from './DestinationCard';
import { Button } from './Button';

interface PassportProps {
  savedDestinations: Destination[];
  onToggleSave: (dest: Destination) => void;
  onNavigateToDestinations: () => void;
  onCardClick?: (dest: Destination) => void;
}

export function Passport({ savedDestinations, onToggleSave, onNavigateToDestinations, onCardClick }: PassportProps) {
  // Calculate top 5 tags from saved destinations
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};

    savedDestinations.forEach((dest) => {
      dest.tags.forEach((tag) => {
        const normalizedTag = tag.toLowerCase();
        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1;
      });
    });

    // Sort by count descending and take top 5
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [savedDestinations]);

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
        <>
          {/* Top 5 Tags Section */}
          {topTags.length > 0 && (
            <div className="mb-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-widest text-[10px] uppercase mb-4">
                <Lucide.TrendingUp className="w-4 h-4" />
                Your Travel Interests
              </div>
              <h3 className="text-xl font-serif text-slate-900 mb-4">Top Tags from Your Saved Destinations</h3>
              <div className="flex flex-wrap gap-3">
                {topTags.map(({ tag, count }, index) => (
                  <div
                    key={tag}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm
                      ${index === 0
                        ? 'bg-emerald-500 text-white'
                        : index === 1
                        ? 'bg-emerald-400 text-white'
                        : index === 2
                        ? 'bg-emerald-300 text-emerald-900'
                        : 'bg-white text-slate-700 border border-slate-200'
                      }
                    `}
                  >
                    {index === 0 && <Lucide.Crown className="w-4 h-4" />}
                    <span className="capitalize">{tag}</span>
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${index < 3 ? 'bg-white/20' : 'bg-slate-100'}
                    `}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4 italic">
                Based on {savedDestinations.length} saved {savedDestinations.length === 1 ? 'destination' : 'destinations'}
              </p>
            </div>
          )}

          {/* Destination Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {savedDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                dest={dest}
                isSaved={true}
                onToggleSave={onToggleSave}
                onClick={() => onCardClick?.(dest)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
