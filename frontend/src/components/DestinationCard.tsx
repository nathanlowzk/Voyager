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
  country?: string;  // Country where the destination is located
  region?: string;   // Region (e.g., "Europe", "South East Asia")
}

interface DestinationCardProps {
  dest: Destination;
  isSaved: boolean;
  onToggleSave: (dest: Destination) => void;
  onClick?: () => void;
}

export function DestinationCard({ dest, isSaved, onToggleSave, onClick }: DestinationCardProps) {
  // Handle card click - but not when clicking the heart button
  const handleCardClick = (e: React.MouseEvent) => {
    // Check if the click target is the heart button or its children
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return; // Don't trigger card click when clicking buttons
    }
    onClick?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer hover:-translate-y-2"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={dest.imageUrl}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Hover overlay with "View" indicator */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
            <Lucide.Eye className="w-4 h-4 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">View Details</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(dest);
          }}
          className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all z-10 ${
            isSaved ? 'bg-rose-500 text-white' : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Lucide.Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Horizontally scrollable tags container */}
        <div
          className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {dest.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-wider rounded whitespace-nowrap shrink-0"
            >
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
