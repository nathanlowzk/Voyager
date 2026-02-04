import React, { useState } from 'react';
import { Button } from './components/Button';

interface SignInProps {
  onSignIn: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
}

export function SignIn({ onSignIn, onNavigateToRegister }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email, password);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-serif text-center mb-2">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-10 font-light">Sign in to your Voyager account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            Sign In
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
