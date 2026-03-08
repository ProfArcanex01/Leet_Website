'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GH_COUNTRY_CODE = '+233';

const RECRUITMENT_CHANNELS = [
  { value: 'WASHING_BAYS', label: 'Washing bays' },
  { value: 'FUEL_STATIONS', label: 'Fuel stations' },
  { value: 'MECHANICAL_SHOPS', label: 'Mechanical shops' },
  { value: 'EATERIES', label: 'Eateries' },
  { value: 'OFFICES', label: 'Offices' },
  { value: 'CHURCHES', label: 'Churches' },
  { value: 'OTHER', label: 'Other' },
] as const;

const WEEKLY_GOALS = [
  { value: '1_10', label: '1-10 drivers' },
  { value: '10_20', label: '10-20 drivers' },
  { value: '20_50', label: '20-50 drivers' },
  { value: '50_PLUS', label: '50+ drivers' },
] as const;

type FormState = {
  full_name: string;
  phone_number: string;
  location: string;
  recruitment_channels: string[];
  weekly_recruitment_estimate: string;
  has_smartphone: string;
  notes: string;
};

const INITIAL_FORM: FormState = {
  full_name: '',
  phone_number: '',
  location: '',
  recruitment_channels: [],
  weekly_recruitment_estimate: '',
  has_smartphone: '',
  notes: '',
};

export function AgentApplicationForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const loadedAt = useRef(0);

  useEffect(() => {
    loadedAt.current = Math.floor(Date.now() / 1000);
  }, []);

  const canSubmit = useMemo(
    () =>
      Boolean(
        API_URL &&
          form.full_name.trim() &&
          form.phone_number.trim() &&
          form.location.trim() &&
          form.recruitment_channels.length > 0 &&
          form.weekly_recruitment_estimate &&
          form.has_smartphone,
      ),
    [form],
  );

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleChannel(channel: string) {
    setForm((prev) => {
      const exists = prev.recruitment_channels.includes(channel);
      return {
        ...prev,
        recruitment_channels: exists
          ? prev.recruitment_channels.filter((item) => item !== channel)
          : [...prev.recruitment_channels, channel],
      };
    });
  }

  function sanitizePhoneInput(rawPhone: string): string {
    const compact = rawPhone.replace(/\s+/g, '');
    const cleaned = compact.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+233')) {
      return cleaned.slice(4).replace(/\D/g, '').slice(0, 10);
    }

    if (cleaned.startsWith('233')) {
      return cleaned.slice(3).replace(/\D/g, '').slice(0, 10);
    }

    return cleaned.replace(/\D/g, '').slice(0, 10);
  }

  function normalizeGhanaPhoneNumber(rawPhone: string): string | null {
    const numeric = rawPhone.replace(/\D/g, '');
    if (!numeric) return null;

    let local = '';

    // Already includes country code without plus.
    if (numeric.startsWith('233') && numeric.length === 12) {
      local = numeric.slice(3);
    } else if (numeric.startsWith('0') && numeric.length === 10) {
      // Standard local format: 0XXXXXXXXX
      local = numeric.slice(1);
    } else if (numeric.length === 9) {
      // Local format without leading zero.
      local = numeric;
    } else {
      return null;
    }

    // Ghana mobile local part should be exactly 9 digits.
    if (local.length !== 9) return null;

    return `${GH_COUNTRY_CODE}${local}`;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit || !API_URL) return;

    const normalizedPhone = normalizeGhanaPhoneNumber(form.phone_number);
    if (!normalizedPhone) {
      setStatus('error');
      setErrorMsg('Enter a valid Ghana number, for example 0240000000.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await fetch(`${API_URL}/campaigns/agent-recruitment/submit/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          phone_number: normalizedPhone,
          has_smartphone: form.has_smartphone === 'yes',
          notes: form.notes.trim(),
          website: honeypot,
          _t: loadedAt.current,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setForm(INITIAL_FORM);
        setHoneypot('');
        return;
      }

      const data = await response.json().catch(() => null);
      const firstError = data && typeof data === 'object' ? Object.values(data)[0] : null;
      const normalizedMessage = Array.isArray(firstError)
        ? String(firstError[0])
        : typeof firstError === 'string'
          ? firstError
          : data?.detail || data?.message || 'Unable to submit your application right now.';
      setErrorMsg(normalizedMessage);
      setStatus('error');
    } catch {
      setErrorMsg('Unable to connect right now. Please try again later.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50/90 p-6 text-center shadow-[var(--shadow)]">
        <p className="text-lg font-semibold text-emerald-800">Application received.</p>
        <p className="mt-2 text-sm text-emerald-700">
          Our team will review your submission and contact you on WhatsApp if you are a fit for the campaign.
        </p>
        <Button type="button" variant="outline" className="mt-5 rounded-full" onClick={() => setStatus('idle')}>
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div aria-hidden="true" className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <div className="rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Section 1</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">Basic details</p>
          </div>
          <div className="rounded-full bg-[color:var(--paper)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Required
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(event) => update('full_name', event.target.value)}
              placeholder="Your full name"
              disabled={status === 'loading'}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--paper)]/35 px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Phone Number (WhatsApp)</label>
            <div className="flex overflow-hidden rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--paper)]/35 focus-within:border-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--accent)]/20">
              <span className="inline-flex items-center border-r border-[color:var(--stroke)] bg-[color:var(--soft)]/65 px-3 text-sm font-semibold text-[color:var(--ink)]">
                {GH_COUNTRY_CODE}
              </span>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={form.phone_number}
                onChange={(event) => update('phone_number', sanitizePhoneInput(event.target.value))}
                placeholder="0240000000"
                disabled={status === 'loading'}
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Country code is set to Ghana by default.</p>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Location</label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(event) => update('location', event.target.value)}
            placeholder="Madina, East Legon, Tema"
            disabled={status === 'loading'}
            className="w-full rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--paper)]/35 px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
          />
        </div>
      </div>

      <fieldset className="rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Section 2</p>
            <legend className="mt-1 text-lg font-semibold text-[color:var(--ink)]">Where will you recruit drivers?</legend>
          </div>
          <div className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">
            Choose all
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {RECRUITMENT_CHANNELS.map((option) => {
            const checked = form.recruitment_channels.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  checked
                    ? 'border-[color:var(--accent)] bg-[color:var(--paper)] shadow-[0_12px_30px_rgba(224,108,44,0.08)]'
                    : 'border-[color:var(--stroke)] bg-[color:var(--paper)]/20 hover:bg-[color:var(--soft)]/30'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleChannel(option.value)}
                  disabled={status === 'loading'}
                  className="h-4 w-4 rounded border-[color:var(--stroke)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Section 3</p>
            <legend className="mt-1 text-lg font-semibold text-[color:var(--ink)]">How many drivers can you recruit in a week?</legend>
          </div>
          <div className="rounded-full bg-[color:var(--paper)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            One answer
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {WEEKLY_GOALS.map((option) => {
            const checked = form.weekly_recruitment_estimate === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  checked
                    ? 'border-[color:var(--accent)] bg-[color:var(--paper)] shadow-[0_12px_30px_rgba(224,108,44,0.08)]'
                    : 'border-[color:var(--stroke)] bg-[color:var(--paper)]/20 hover:bg-[color:var(--soft)]/30'
                }`}
              >
                <input
                  type="radio"
                  name="weekly_recruitment_estimate"
                  checked={checked}
                  onChange={() => update('weekly_recruitment_estimate', option.value)}
                  disabled={status === 'loading'}
                  className="h-4 w-4 border-[color:var(--stroke)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Section 4</p>
            <legend className="mt-1 text-lg font-semibold text-[color:var(--ink)]">Do you have a smartphone?</legend>
          </div>
        </div>
        <div className="grid gap-3 sm:max-w-sm sm:grid-cols-2">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ].map((option) => {
            const checked = form.has_smartphone === option.value;
            return (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                  checked
                    ? 'border-[color:var(--accent)] bg-[color:var(--paper)] shadow-[0_12px_30px_rgba(224,108,44,0.08)]'
                    : 'border-[color:var(--stroke)] bg-[color:var(--paper)]/20 hover:bg-[color:var(--soft)]/30'
                }`}
              >
                <input
                  type="radio"
                  name="has_smartphone"
                  checked={checked}
                  onChange={() => update('has_smartphone', option.value)}
                  disabled={status === 'loading'}
                  className="h-4 w-4 border-[color:var(--stroke)] text-[color:var(--accent)] focus:ring-[color:var(--accent)]"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-5 py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Section 5</p>
            <label className="mt-1 block text-lg font-semibold text-[color:var(--ink)]">
              Anything else we should know? <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </label>
          </div>
          <div className="rounded-full bg-[color:var(--paper)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Short note
          </div>
        </div>
        <textarea
          rows={4}
          maxLength={500}
          value={form.notes}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="Tell us about your experience, availability, or the areas you know well."
          disabled={status === 'loading'}
          className="w-full resize-none rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--paper)]/35 px-4 py-3 text-sm outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20"
        />
        <p className="mt-2 text-xs text-muted-foreground">{form.notes.length}/500 characters</p>
      </div>

      {status === 'error' ? <p className="text-sm text-red-600">{errorMsg}</p> : null}

      <Button
        type="submit"
        disabled={status === 'loading' || !canSubmit}
        className="w-full rounded-full py-6 text-sm font-semibold shadow-[0_20px_40px_rgba(224,108,44,0.2)]"
      >
        {status === 'loading' ? 'Submitting...' : 'Apply as a Leet Agent'}
      </Button>
    </form>
  );
}
