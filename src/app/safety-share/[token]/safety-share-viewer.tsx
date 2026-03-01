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
const PARTICLE_COUNT = 18;

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

function formatRelative(value?: string | null): string {
  if (!value) return 'N/A';
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'N/A';
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
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
  const isLive = viewState === 'live';
  const statusLabel =
    viewState === 'loading'
      ? 'Connecting'
      : viewState === 'live'
        ? 'Live'
        : viewState === 'unavailable'
          ? 'Session ended'
          : 'Connection issue';
  const statusToneClass =
    viewState === 'live'
      ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-700'
      : viewState === 'loading'
        ? 'border-amber-400/50 bg-amber-400/10 text-amber-700'
        : 'border-[color:var(--stroke)] bg-[color:var(--muted)] text-[color:var(--ink)]';
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
        id: index,
        left: `${(index * 17) % 100}%`,
        top: `${(index * 29) % 100}%`,
        size: 4 + ((index * 7) % 8),
        delay: `${(index % 7) * 0.6}s`,
        duration: `${6 + (index % 5)}s`,
        opacity: 0.18 + (index % 3) * 0.08,
      })),
    []
  );

  return (
    <main className="min-h-screen bg-background px-5 py-8 md:px-8 md:py-12">
      <section className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)] md:p-10">
          <div className="pointer-events-none absolute inset-0 z-0">
            {particles.map((particle) => (
              <span
                key={particle.id}
                className="safety-particle absolute rounded-full bg-[color:var(--accent)]"
                style={{
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[color:var(--accent-2)]/10 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--accent)]">
                Leet Safety Share
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl">Live Trip Tracking</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                This protected link was shared by a rider so trusted contacts can follow trip progress.
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${statusToneClass}`}>
              <span className={`h-2 w-2 rounded-full ${isLive ? 'animate-pulse bg-emerald-500' : 'bg-current/70'}`} />
              {statusLabel}
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Rider</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">
                {snapshot?.rider_first_name || 'Waiting...'}
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Host</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">
                {snapshot?.host_first_name || 'Waiting...'}
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/70 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Ride status</p>
              <p className="mt-1 text-lg font-semibold text-[color:var(--ink)]">
                {snapshot?.ride_status || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-5 rounded-2xl border border-[color:var(--stroke)] bg-[color:var(--muted)]/70 p-5 backdrop-blur-sm md:p-6">
            {viewState === 'loading' ? (
              <div className="space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-[color:var(--stroke)]/70" />
                <div className="h-3 w-full animate-pulse rounded bg-[color:var(--stroke)]/50" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-[color:var(--stroke)]/50" />
              </div>
            ) : null}

            {viewState === 'unavailable' ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold text-[color:var(--ink)]">This session is no longer active.</p>
                <p className="text-sm text-muted-foreground">
                  The rider may have ended sharing, the ride may have completed, or the link has expired.
                </p>
              </div>
            ) : null}

            {viewState === 'error' ? (
              <div className="space-y-2">
                <p className="text-xl font-semibold text-[color:var(--ink)]">Couldn&apos;t load tracking details.</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            ) : null}

            {viewState === 'live' && snapshot ? (
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Latest coordinates</p>
                  {canOpenMap ? (
                    <>
                      <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)] md:text-3xl">
                        {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Updated {formatRelative(snapshot.last_location.timestamp)} ({formatDate(snapshot.last_location.timestamp)})
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Waiting for the first rider location update.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Session window</p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">
                    Expires {formatDate(snapshot.expires_at)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Auto-refresh every 10 seconds</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {canOpenMap ? (
                      <a
                        href={mapsUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                      >
                        Open in Maps
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Last refresh: {formatDate(lastRefreshedAt)}
            </p>
            <button
              type="button"
              onClick={() => refreshSnapshot()}
              className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-5 py-2 text-xs font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--soft)]"
            >
              Refresh now
            </button>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-muted-foreground">
          Need help?{' '}
          <Link href="/support" className="font-semibold text-[color:var(--accent)]">
            Contact support
          </Link>
        </p>
      </section>
      <style jsx>{`
        .safety-particle {
          animation-name: safetyParticleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        @keyframes safetyParticleFloat {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.14;
          }
          50% {
            transform: translate3d(0, -10px, 0) scale(1.25);
            opacity: 0.36;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.14;
          }
        }
      `}</style>
    </main>
  );
}
