'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.topic || !form.message || !API_URL) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`${API_URL}/waitlist/support/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
