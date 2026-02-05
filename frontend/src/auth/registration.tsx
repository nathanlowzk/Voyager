import React, { useState } from 'react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

interface RegistrationProps {
  onRegister: () => void;
  onNavigateToSignIn: () => void;
}

export function Registration({ onRegister, onNavigateToSignIn }: RegistrationProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          date_of_birth: dateOfBirth,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onRegister();
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-2">Create Account</h1>
        <p className="text-slate-500 text-center mb-10 font-light">Join the Voyager community</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="regEmail" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="regEmail"
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
              placeholder="Create a password"
              required
              minLength={6}
              className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none transition-all text-base"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-2">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 outline-none transition-all text-base"
            />
          </div>

          <Button variant="primary" className="w-full justify-center py-3 text-base">
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <button
            onClick={onNavigateToSignIn}
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
