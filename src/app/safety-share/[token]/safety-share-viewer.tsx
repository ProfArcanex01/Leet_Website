'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type SafetySnapshot = {
  session_id: string;
  status: string;
  expires_at: string;
  ride_status: string;
  rider_first_name: string;
  host_first_name: string;
  last_location: {
    latitude: number | string | null;
    longitude: number | string | null;
    heading: number | string | null;
    speed: number | string | null;
    timestamp: string | null;
  };
};

type ViewerState = 'loading' | 'live' | 'unavailable' | 'error';

type SafetyShareViewerProps = {
  token: string;
};

const POLL_INTERVAL_MS = 10000;

function getApiBase(): string {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  return apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
}

function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

function toNumber(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function SafetyShareViewer({ token }: SafetyShareViewerProps) {
  const [viewState, setViewState] = useState<ViewerState>('loading');
  const [snapshot, setSnapshot] = useState<SafetySnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    const apiBase = getApiBase();
    if (!apiBase) return null;
    return `${apiBase}/safety-share/view/${encodeURIComponent(token)}/`;
  }, [token]);

  const refreshSnapshot = useCallback(async () => {
    if (!endpoint) {
      setViewState('error');
      setErrorMessage('Tracking page is not configured yet. Please try again later.');
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.status === 404) {
        setSnapshot(null);
        setViewState('unavailable');
        setErrorMessage(null);
        setLastRefreshedAt(new Date().toISOString());
        return;
      }

      const data = (await response.json().catch(() => null)) as SafetySnapshot | null;
      if (!response.ok || !data) {
        throw new Error('Unable to load shared trip right now.');
      }

      setSnapshot(data);
      setViewState('live');
      setErrorMessage(null);
      setLastRefreshedAt(new Date().toISOString());
    } catch (error) {
      setViewState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load shared trip right now.');
    }
  }, [endpoint]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await refreshSnapshot();
    };
    run();
    const timerId = window.setInterval(run, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timerId);
    };
  }, [refreshSnapshot]);

  const latitude = toNumber(snapshot?.last_location?.latitude);
  const longitude = toNumber(snapshot?.last_location?.longitude);
  const canOpenMap = latitude !== null && longitude !== null;
  const mapsUrl = canOpenMap
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : null;

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)] md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">Leet Safety Share</p>
          <h1 className="mt-3 text-3xl md:text-4xl">Live Trip Tracking</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This link was shared by a rider for trusted-contact safety monitoring.
          </p>

          <div className="mt-6 space-y-4 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--muted)] p-5">
            {viewState === 'loading' ? (
              <p className="text-sm text-muted-foreground">Loading shared trip…</p>
            ) : null}

            {viewState === 'unavailable' ? (
              <>
                <p className="text-sm font-semibold text-[color:var(--ink)]">This tracking session is not available.</p>
                <p className="text-sm text-muted-foreground">
                  The rider may have stopped sharing, or the link may have expired.
                </p>
              </>
            ) : null}

            {viewState === 'error' ? (
              <>
                <p className="text-sm font-semibold text-[color:var(--ink)]">We couldn&apos;t load this trip.</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </>
            ) : null}

            {viewState === 'live' && snapshot ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Rider</p>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{snapshot.rider_first_name || 'Rider'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Host</p>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{snapshot.host_first_name || 'Host'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ride status</p>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{snapshot.ride_status}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Share expires</p>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{formatDate(snapshot.expires_at)}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Latest location</p>
                  {canOpenMap ? (
                    <>
                      <p className="mt-1 text-sm text-[color:var(--ink)]">
                        {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated: {formatDate(snapshot.last_location.timestamp)}
                      </p>
                      <div className="mt-3">
                        <a
                          href={mapsUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          Open in Maps
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Waiting for rider location update…</p>
                  )}
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Last refresh: {formatDate(lastRefreshedAt)}
            </p>
            <button
              type="button"
              onClick={() => refreshSnapshot()}
              className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--soft)]"
            >
              Refresh now
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help? <Link href="/support" className="font-semibold text-[color:var(--accent)]">Contact support</Link>
        </p>
      </section>
    </main>
  );
}

