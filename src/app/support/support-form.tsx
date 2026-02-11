'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const topics = [
  { value: '', label: 'Select a topic' },
  { value: 'ACCOUNT', label: 'Account issue' },
  { value: 'RIDE', label: 'Ride issue' },
  { value: 'PAYMENT', label: 'Payment or refund' },
  { value: 'SAFETY', label: 'Safety concern' },
  { value: 'GENERAL', label: 'General question' },
];

export function SupportForm() {
  const [form, setForm] = useState({ email: '', topic: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const loadedAt = useRef(0);

  // Record when the form was first rendered
  useEffect(() => {
    loadedAt.current = Math.floor(Date.now() / 1000);
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.topic || !form.message || !API_URL) return;

    if (form.message.trim().length < 10) {
      setErrorMsg('Please provide more detail so we can help you (at least 10 characters).');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/waitlist/support/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website: honeypot,       // honeypot — should be empty
          _t: loadedAt.current,    // timestamp for timing check
        }),
      });

      if (res.ok) {
        setStatus('success');
        setForm({ email: '', topic: '', message: '' });
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.detail || data?.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Unable to connect. Please try again later.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-emerald-50 p-6 text-center">
        <p className="text-sm font-medium text-emerald-700">
          Your message has been sent. We&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users, bots will fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[color:var(--ink)]">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="you@example.com"
          disabled={status === 'loading'}
          className="w-full rounded-xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-60"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[color:var(--ink)]">Topic</label>
        <select
          required
          value={form.topic}
          onChange={(e) => update('topic', e.target.value)}
          disabled={status === 'loading'}
          className="w-full rounded-xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-60"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value} disabled={!t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-[color:var(--ink)]">Message</label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          placeholder="Describe your issue or question..."
          disabled={status === 'loading'}
          className="w-full resize-none rounded-xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-60"
        />
      </div>
      {status === 'error' && <p className="text-sm text-red-500">{errorMsg}</p>}
      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl py-3 text-sm font-semibold shadow-[var(--shadow)] disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending...' : 'Send message'}
      </Button>
    </form>
  );
}
