'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`
      }
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <main className="min-h-screen bg-page flex flex-col items-center justify-center px-6">
      <img src="/citytadka-logo.png" alt="City Tadka" className="h-8 mb-8 invert" />

      <div className="w-full max-w-sm bg-card rounded-md shadow-sm p-6">
        {sent ? (
          <div className="text-center">
            <div className="font-heading font-bold text-lg text-ink mb-2">Check your email</div>
            <p className="text-sm text-ink-light">
              We sent a login link to <span className="font-semibold text-ink">{email}</span>. Open it on this
              device to finish logging in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="font-heading font-bold text-lg text-ink mb-1">Log in to City Tadka</div>
            <p className="text-sm text-ink-light mb-5">
              Enter your email — we'll send you a link, no password needed.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-ink-light rounded-md px-3.5 py-3 text-sm text-ink outline-none mb-3"
            />
            {error && <p className="text-brand text-xs font-semibold mb-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white rounded-pill py-3.5 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Login Link'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
