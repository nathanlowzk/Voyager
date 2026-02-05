import React, { useState } from 'react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface SignInProps {
  onSignIn: () => void;
  onNavigateToRegister: () => void;
}

export function SignIn({ onSignIn, onNavigateToRegister }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onSignIn();
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-10 font-light">Sign in to your Voyager account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none transition-all text-base"
            />
          </div>

          <Button variant="primary" className="w-full justify-center py-3 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Do not have an account?{' '}
          <button
            onClick={onNavigateToRegister}
            className="text-emerald-600 font-medium hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
