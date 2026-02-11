'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !API_URL) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/waitlist/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.email?.[0] || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Unable to connect. Please try again later.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="mt-6 text-sm font-medium text-[color:var(--accent-2)]">
        You&apos;re on the list! We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={status === 'loading'}
          className="flex-1 rounded-full border border-[color:var(--stroke)] bg-white px-5 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-full px-6 py-3 text-sm font-semibold shadow-[var(--shadow)] disabled:opacity-60"
        >
          {status === 'loading' ? 'Joining...' : 'Join waitlist'}
        </Button>
      </form>
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
