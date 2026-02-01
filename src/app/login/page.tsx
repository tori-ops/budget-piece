'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        setMessage('Login successful! Redirecting...');
        setTimeout(() => router.push('/'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        setError(authError.message);
      } else {
        setMessage('Sign up successful! Check your email to confirm your account.');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#D0CEB5' }}>
      {/* Header */}
      <header className="py-8 px-4 text-center border-b" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#274E13' }}>
          The Budget Piece
        </h1>
        <p className="text-sm" style={{ color: '#274E13' }}>
          a planning tool by The Missing Piece Planning and Events, LLC
        </p>
        <p className="text-xs mt-2 opacity-70" style={{ color: '#274E13' }}>
          copyright 2026 version 1.1.1
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: '#FFFFFF' }}>
          <h2 className="text-2xl font-bold text-center mb-2" style={{ color: '#274E13' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          <div className="h-1 w-16 mx-auto mb-8 rounded" style={{ backgroundColor: '#274E13' }}></div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#274E13' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-black"
                style={{ '--tw-ring-color': '#274E13' } as React.CSSProperties}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#274E13' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-black"
                style={{ '--tw-ring-color': '#274E13' } as React.CSSProperties}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#F8D7DA', color: '#721C24', borderLeft: '4px solid #F5C6CB' }}>
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#D4EDDA', color: '#155724', borderLeft: '4px solid #C3E6CB' }}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-50 text-white"
              style={{ backgroundColor: '#274E13' }}
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : mode === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          {/* Mode Toggle */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
            <p className="text-center text-sm" style={{ color: '#274E13' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                  setMessage(null);
                }}
                className="font-semibold underline hover:no-underline"
                style={{ color: '#274E13' }}
              >
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-4 text-center border-t" style={{ borderColor: 'rgba(39, 78, 19, 0.1)' }}>
        <p className="text-sm" style={{ color: '#274E13' }}>
          The Missing Piece Planning and Events, LLC
        </p>
      </footer>
    </div>
  );
}
