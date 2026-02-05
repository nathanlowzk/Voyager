import React from 'react';

interface ToggleProps {
  active: boolean;
  onToggle: () => void;
  label: string;
}

export function Toggle({ active, onToggle, label }: ToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <span className={`text-sm font-semibold tracking-tight transition-colors ${active ? 'text-slate-900' : 'text-slate-400'}`}>
        {label}
      </span>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 transform ${active ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
