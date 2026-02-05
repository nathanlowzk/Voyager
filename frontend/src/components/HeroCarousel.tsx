import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Button } from './Button';
import { Destination } from './DestinationCard';

interface HeroCarouselProps {
  destinations: Destination[];
  loading: boolean;
  savedDestinations: Destination[];
  onToggleSave: (dest: Destination) => void;
  onRefresh: () => void;
}

export function HeroCarousel({ destinations, loading, savedDestinations, onToggleSave, onRefresh }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (destinations.length > 0) {
      const timer = setInterval(() => setCurrent(c => (c + 1) % destinations.length), 8000);
      return () => clearInterval(timer);
    }
  }, [destinations.length, current]);

  if (loading) return (
    <div className="h-[70vh] w-full bg-slate-50 flex flex-col items-center justify-center animate-pulse">
      <Lucide.Loader2 className="w-12 h-12 text-slate-300 animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Fetching the extraordinary...</p>
    </div>
  );

  if (!destinations.length) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      {destinations.map((dest, idx) => {
        const isSaved = savedDestinations.some(saved => saved.id === dest.id);

        return (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <img
              src={dest.imageUrl}
              alt={dest.name}
              className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-20 left-10 md:left-20 max-w-2xl text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest">
                  {dest.isPersonalized ? 'For You' : 'Trending'}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">{dest.name}</h1>
              <p className="text-lg md:text-xl text-white/80 font-light mb-8 max-w-lg leading-relaxed">
                {dest.description}
              </p>
              <div className="flex gap-4">
                <Button>Explore Destination</Button>
                <Button
                  variant="ghost"
                  className={`text-white hover:bg-white/10 px-4 ${isSaved ? 'bg-rose-500/30' : ''}`}
                  onClick={() => onToggleSave(dest)}
                >
                  <Lucide.Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={onRefresh}
        disabled={loading}
        className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Lucide.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>

      <div className="absolute bottom-10 right-10 flex gap-4">
        <button
          onClick={() => setCurrent(c => (c - 1 + destinations.length) % destinations.length)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <Lucide.ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => setCurrent(c => (c + 1) % destinations.length)}
          className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all"
        >
          <Lucide.ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {destinations.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 transition-all duration-300 rounded-full ${idx === current ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
