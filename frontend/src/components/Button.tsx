import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export function Button({ children, onClick, variant = 'primary', className = '' }: ButtonProps) {
  const base = "px-6 py-2 rounded-full font-medium transition-all active:scale-95 flex items-center gap-2";
  const variants: Record<string, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg",
    outline: "border-2 border-slate-200 hover:border-slate-900 text-slate-900",
    ghost: "text-slate-500 hover:text-slate-900"
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
