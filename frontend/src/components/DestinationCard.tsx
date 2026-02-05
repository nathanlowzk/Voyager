import React from 'react';
import * as Lucide from 'lucide-react';

export interface Destination {
  id: string;
  name: string;
  location: string;
  description: string;
  tags: string[];
  imagePrompt: string;
  imageUrl?: string;
  isPersonalized: boolean;
}

interface DestinationCardProps {
  dest: Destination;
  isSaved: boolean;
  onToggleSave: (dest: Destination) => void;
}

export function DestinationCard({ dest, isSaved, onToggleSave }: DestinationCardProps) {
  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={dest.imageUrl}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <button
          onClick={() => onToggleSave(dest)}
          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all ${isSaved ? 'bg-rose-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'}`}
        >
          <Lucide.Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-4 left-4 flex gap-2 flex-wrap">
          {dest.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-2 font-medium">
          <Lucide.MapPin className="w-3 h-3" />
          {dest.location}
        </div>
        <h3 className="text-xl font-serif text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
          {dest.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 font-light leading-relaxed">
          {dest.description}
        </p>
      </div>
    </div>
  );
}
