import React from 'react';
import * as Lucide from 'lucide-react';

interface AboutProps {
  onNavigateToExplore?: () => void;
}

// --- Styles for the animations & textures ---
const styles = `
  @keyframes scroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -5%); }
    20% { transform: translate(-10%, 5%); }
    30% { transform: translate(5%, -10%); }
    40% { transform: translate(-5%, 15%); }
    50% { transform: translate(-10%, 5%); }
    60% { transform: translate(15%, 0); }
    70% { transform: translate(0, 10%); }
    80% { transform: translate(-15%, 0); }
    90% { transform: translate(10%, 5%); }
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }

  .bg-noise {
    position: fixed;
    top: -50%;
    left: -50%;
    right: -50%;
    bottom: -50%;
    width: 200%;
    height: 200vh;
    background: transparent url('http://assets.iceable.com/img/noise-transparent.png') repeat 0 0;
    background-repeat: repeat;
    animation: grain 8s steps(10) infinite;
    opacity: 0.05;
    z-index: 50;
    pointer-events: none;
  }

  .animate-scroll {
    animation: scroll 40s linear infinite;
  }
  
  .animate-compass {
    animation: pulse-slow 10s ease-in-out infinite;
  }
`;

export function About({ onNavigateToExplore }: AboutProps) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden font-sans text-slate-900">
      <style>{styles}</style>
      
      {/* Cinematic Noise Overlay */}
      <div className="bg-noise" />

      {/* --- HERO SECTION: Clean Typography --- */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        
        {/* Subtle Background Element to replace photos */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03]">
           <Lucide.Compass className="w-[800px] h-[800px] animate-compass" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm mb-10">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Established 2026</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif leading-[0.9] mb-10 tracking-tight text-slate-900">
            Don't just <br/>
            <span className="italic font-light text-slate-400">go there.</span> <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-500 to-emerald-600 animate-gradient">
              Be there.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Voyager is the antidote to boring travel. We help you find the places that don't make the top 10 lists, but should.
          </p>
        </div>
      </section>

      {/* --- SUBTLE MARQUEE --- */}
      {/* Changed: No dark background, no rotation. Very faint text. */}
      <div className="w-full border-y border-slate-100 bg-white/50 py-6 overflow-hidden relative z-20">
        <div className="flex whitespace-nowrap animate-scroll items-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 mx-6 opacity-30 select-none">
              <span className="text-5xl font-serif text-slate-300 italic">Kyoto</span>
              <span className="text-2xl text-slate-200">●</span>
              <span className="text-5xl font-serif text-slate-300 italic">Reykjavik</span>
              <span className="text-2xl text-slate-200">●</span>
              <span className="text-5xl font-serif text-slate-300 italic">Patagonia</span>
              <span className="text-2xl text-slate-200">●</span>
              <span className="text-5xl font-serif text-slate-300 italic">Marrakesh</span>
              <span className="text-2xl text-slate-200">●</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- HOW IT WORKS: The Boarding Pass --- */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-slate-900">Your Ticket to Everywhere</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg font-light">No complicated spreadsheets. Just three steps to get you from your couch to the departure gate.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-0 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
            
            {/* Step 1 */}
            <div className="p-12 border-b md:border-b-0 md:border-r border-dashed border-slate-200 relative group hover:bg-orange-50/30 transition-colors duration-500">
              <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">Step 01</div>
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-8 text-orange-600 group-hover:scale-110 transition-transform duration-500">
                <Lucide.Search className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-slate-900">Discover</h3>
              <p className="text-slate-500 font-light leading-relaxed">Swipe through thousands of curated hidden gems. No tourist traps allowed.</p>
            </div>

            {/* Step 2 */}
            <div className="p-12 border-b md:border-b-0 md:border-r border-dashed border-slate-200 relative group hover:bg-emerald-50/30 transition-colors duration-500">
              <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">Step 02</div>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                <Lucide.Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-slate-900">Curate</h3>
              <p className="text-slate-500 font-light leading-relaxed">Save the spots that speak to your soul. Build your personal "Someday" list.</p>
            </div>

            {/* Step 3 */}
            <div className="p-12 relative group hover:bg-blue-50/30 transition-colors duration-500">
              <div className="absolute top-6 right-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">Step 03</div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform duration-500">
                <Lucide.Plane className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-slate-900">Depart</h3>
              <p className="text-slate-500 font-light leading-relaxed">Turn that list into a plan. Book the flight. Pack the bag. Go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MISSION: The "Newspaper" --- */}
      <section className="py-32 px-6 bg-slate-900 text-slate-200 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             {/* Subtle pattern overlay */}
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Lucide.Quote className="w-10 h-10 text-orange-500 mx-auto mb-10 opacity-80" />
          
          <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-12 font-light text-white">
            "The world is a book, and those who do not travel read only one page."
          </h2>
          
          <div className="flex items-center justify-center gap-6">
             <div className="h-px w-16 bg-slate-700"></div>
             <p className="text-sm font-bold tracking-widest uppercase text-slate-400">St. Augustine</p>
             <div className="h-px w-16 bg-slate-700"></div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto relative z-10 px-6">
          <h2 className="text-5xl md:text-7xl font-serif mb-10 text-slate-900 tracking-tight">
            Ready to <br/> get lost?
          </h2>
          <button className="bg-orange-600 text-white px-10 py-5 rounded-full text-lg font-bold shadow-xl shadow-orange-500/30 hover:scale-105 hover:bg-orange-500 transition-all duration-300"
                            onClick={onNavigateToExplore}>
            Explore Destinations
          </button>
        </div>
        
        {/* Background Stamps (More subtle now) */}
        <Lucide.Stamp className="absolute top-10 left-10 w-48 h-48 text-slate-200/50 -rotate-12 z-0 pointer-events-none" />
        <Lucide.Compass className="absolute bottom-10 right-10 w-64 h-64 text-slate-200/50 rotate-45 z-0 pointer-events-none" />
      </section>

    </div>
  );
}