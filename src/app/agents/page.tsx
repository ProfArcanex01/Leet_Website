import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  MapPinned,
  Smartphone,
  Users2,
  MessageCircle,
  Flame,
} from 'lucide-react';
import { AgentApplicationForm } from './agent-application-form';

export const metadata: Metadata = {
  title: 'Become a Leet Agent',
  description:
    'Earn money recruiting drivers for Leet. Meet drivers at washing bays, fuel stations, and mechanics, help them qualify on Leet, and earn under the current commission terms. Flexible, field-based work across Ghana.',
  openGraph: {
    title: 'Become a Leet Agent — Earn money recruiting drivers',
    description:
      'Earn when your recruited drivers and passengers qualify on Leet under the current commission terms. Apply to become an agent.',
  },
  twitter: {
    title: 'Become a Leet Agent — Earn money recruiting drivers',
    description: 'Earn when your recruits qualify on Leet under the current commission terms.',
  },
};

const hotZones = [
  'Washing bays',
  'Fuel stations',
  'Mechanical shops',
  'Eateries',
  'Office parking',
  'Churches & community centres',
  'Trotro terminals',
  'Bus stations',
];

const roleSteps = [
  {
    step: '01',
    title: 'Find drivers in the right places.',
    copy: "Washing bays, fuel stations, mechanics — these are your turf. Drivers wait here naturally. That's your opening.",
    icon: MapPinned,
  },
  {
    step: '02',
    title: 'Get them set up in minutes.',
    copy: 'Download. Profile. First route. The onboarding is built for speed so nobody drops off halfway through.',
    icon: Smartphone,
  },
  {
    step: '03',
    title: 'Earn when they qualify.',
    copy: 'Your credit comes from qualified recruits under Leet’s current commission terms, not downloads or empty profiles.',
    icon: CircleDollarSign,
  },
];

const whoFits = [
  'Students who know their neighbourhood well',
  'Marketers comfortable with face-to-face pitches',
  'Side hustlers looking for flexible field work',
  'Community connectors with trusted local networks',
  'Anyone with a smartphone and the drive to hustle',
];

const earningsRules = [
  'GHS 1 per qualified driver after 1 completed trip within 30 days',
  'GHS 1 per qualified passenger after 3 completed trips within 30 days',
  'Only recruits attributed to your Leet agent code count',
];

export default function AgentsPage() {
  const ticker = [...hotZones, ...hotZones, ...hotZones, ...hotZones];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[color:var(--paper)]">

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-[#0A0907]">

        {/* Full-bleed banner image */}
        <Image
          src="/recruit_driver_5.webp"
          alt="Leet agent recruiting a driver"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        {/* Left gradient: dark where text sits, fades right so image stays bright */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to right, rgba(10,9,7,0.92) 0%, rgba(10,9,7,0.78) 28%, rgba(10,9,7,0.35) 55%, transparent 85%)',
          }}
          aria-hidden
        />

        {/* Nav */}
        <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-8 md:px-12 md:pt-10">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-sm transition hover:bg-white/12 hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180 opacity-70" />
            Leet
          </Link>
          <span className="flex items-center gap-2.5 rounded-full border border-[#E06C2C]/35 bg-[#E06C2C]/12 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#f0b48c] backdrop-blur-sm">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#f0b48c]" />
            Now recruiting
          </span>
        </div>

        {/* Copy — left-aligned, max half width so image shows on the right */}
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-6 pb-28 pt-14 md:px-12 md:pb-32 md:pt-20">
          <div className="max-w-xl">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm font-medium text-white/85 backdrop-blur-sm" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}>
              <Flame className="h-4 w-4 text-[#f0b48c]" />
              Field recruitment · Ghana
            </p>

            <h1
              className="mt-7 text-[clamp(2.8rem,5.5vw,4.8rem)] font-bold leading-[1.02] tracking-tight"
              style={{ color: 'white', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              Recruit drivers.<br />
              <span
                style={{
                  WebkitTextFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  backgroundImage: 'linear-gradient(100deg, #f5c49a 0%, #E06C2C 60%)',
                  filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.4))',
                }}
              >
                Earn on qualified recruits.
              </span>
            </h1>

            <p className="mt-6 text-base leading-relaxed text-white/90 md:text-lg" style={{ textShadow: '0 1px 12px rgba(0,0,0,0.45)' }}>
              You meet drivers where they already are — washing bays, fuel stations, mechanics. Help drivers and passengers join Leet and earn when they qualify under the current commission terms.
            </p>

            <p className="mt-2.5 text-sm font-semibold text-white/80" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
              Current public rates: GHS 1 per qualified driver, GHS 1 per qualified passenger. Full terms apply.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#apply"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#E06C2C] px-8 py-4 text-sm font-bold text-white shadow-[0_12px_36px_rgba(224,108,44,0.5)] transition-all duration-300 hover:bg-[#c95d24] hover:shadow-[0_16px_48px_rgba(224,108,44,0.55)]"
              >
                Apply — it&apos;s free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-7 py-4 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-black/40 hover:text-white"
              >
                How it works
              </a>
              <Link
                href="/agent-portal/login"
                className="inline-flex items-center gap-2 rounded-full border border-[#E06C2C]/45 bg-[#E06C2C]/18 px-6 py-4 text-sm font-medium text-[#f5c49a] backdrop-blur-sm transition hover:border-[#E06C2C]/70 hover:bg-[#E06C2C]/24 hover:text-white"
              >
                Agent login
              </Link>
            </div>

            {/* Feature pills */}
            <div className="mt-8 flex flex-wrap gap-2.5">
              {['Performance-based', 'Mobile-first', 'WhatsApp follow-up', 'No resume needed'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 bg-black/35 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm"
                  style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div className="absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t border-white/8 bg-black/40 backdrop-blur-sm">
          <div className="animate-marquee flex whitespace-nowrap py-3.5">
            {ticker.map((item, i) => (
              <span key={i} className="mx-7 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
                <span className="h-1 w-1 rounded-full bg-[#E06C2C]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="scroll-mt-4 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[color:var(--accent-2)]">
                How it works
              </p>
              <h2 className="mt-2.5 text-3xl text-[color:var(--ink)] md:text-4xl">
                Three steps.<br />Real results.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-muted-foreground sm:text-right">
              No sales training required. If you can talk to people, you can do this.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {roleSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="group relative overflow-hidden rounded-[2rem] border border-[color:var(--stroke)] bg-white p-8 shadow-[0_4px_24px_rgba(21,19,15,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(21,19,15,0.11)]"
                >
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: 'radial-gradient(circle at 80% 20%, rgba(224,108,44,0.05), transparent 60%)' }}
                    aria-hidden
                  />
                  <div className="relative flex items-start justify-between gap-2">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[color:var(--paper)]">
                      <Icon className="h-6 w-6 text-[color:var(--accent)]" />
                    </div>
                    <span className="font-mono text-3xl font-bold leading-none text-muted-foreground/70">
                      {step.step}
                    </span>
                  </div>
                  <div className="relative mt-6">
                    <h3 className="text-xl text-[color:var(--ink)]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── EARNINGS + FIT ──────────────────────────────── */}
      <section className="border-t border-[color:var(--stroke)]/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-[#15130F] p-8 text-white md:p-10">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Users2 className="h-5 w-5 text-[#f0b48c]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#f0b48c]">Who fits</p>
                  <h2 className="mt-0.5 text-xl" style={{ color: 'white' }}>This could be you</h2>
                </div>
              </div>

              <ul className="mt-8 space-y-4">
                {whoFits.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--accent-2)]" />
                    <span className="text-sm leading-relaxed text-white/75">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl border border-white/8 bg-white/5 px-5 py-4">
                <p className="text-xs leading-relaxed text-white/45">
                  No CV. No pitch deck. No prior experience. Just show up and talk to drivers the way you'd talk to a friend.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-[color:var(--stroke)] bg-white p-8 shadow-[0_4px_24px_rgba(21,19,15,0.05)] md:p-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                    Earnings
                  </p>
                  <h2 className="mt-1 text-xl text-[color:var(--ink)]">How commission works</h2>
                </div>
                <span className="shrink-0 rounded-full bg-[color:var(--soft)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">
                  Current terms
                </span>
              </div>

              <div className="mt-7 space-y-3">
                {earningsRules.map((rule) => (
                  <div
                    key={rule}
                    className="group flex items-start gap-4 rounded-2xl border border-[color:var(--stroke)]/70 px-4 py-4 transition hover:border-[color:var(--accent)]/25 hover:bg-[color:var(--paper)]/60"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)] transition-transform duration-200 group-hover:scale-125" />
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--ink)]">{rule}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Full commission, attribution, fraud, and payout rules are set out in the Leet Agent Agreement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT HAPPENS NEXT ────────────────────────────── */}
      <section className="border-t border-[color:var(--stroke)]/50 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:items-center">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[color:var(--accent-2)]">
                After you apply
              </p>
              <h2 className="mt-3 text-3xl text-[color:var(--ink)] md:text-4xl">
                What happens next
              </h2>
              <p className="mt-4 text-muted-foreground">
                Simple, fast, and done on WhatsApp. We review, reach out, and get you started.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  n: '1',
                  title: 'We review your application',
                  copy: 'We check your location, availability, and the demand in your area.',
                },
                {
                  n: '2',
                  title: 'WhatsApp follow-up',
                  copy: 'Shortlisted applicants get a message from the Leet team — usually within a few days.',
                },
                {
                  n: '3',
                  title: 'You get your brief',
                  copy: 'Approved agents receive clear guidance: where to recruit, what to say, and how to track qualified recruits.',
                },
              ].map((item) => (
                <div key={item.n} className="flex gap-5 rounded-[1.75rem] border border-[color:var(--stroke)] bg-white px-6 py-5 shadow-[0_2px_16px_rgba(21,19,15,0.04)]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent-2)] text-sm font-bold text-white">
                    {item.n}
                  </span>
                  <div>
                    <p className="font-semibold text-[color:var(--ink)]">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── APPLY ────────────────────────────────────────── */}
      <section
        id="apply"
        className="relative isolate scroll-mt-0 overflow-hidden py-20 md:py-32"
        style={{ background: 'linear-gradient(155deg, #0E0C09 0%, #141210 45%, #0b1a14 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 5% 70%, rgba(224,108,44,0.22), transparent), radial-gradient(ellipse 55% 50% at 95% 15%, rgba(30,111,92,0.20), transparent)',
          }}
          aria-hidden
        />

        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* Heading */}
          <div className="mb-14 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-medium text-white/55">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-[#E06C2C]" />
              Limited spots per city
            </p>
            <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-bold md:text-5xl" style={{ color: 'white' }}>
              Your city needs you.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-white/55">
              Fill the form in under 2 minutes. We'll follow up on WhatsApp if you're a fit.
            </p>
          </div>

          {/* Centered form */}
          <div className="mx-auto max-w-2xl">
            <div className="rounded-[2.2rem] border border-white/10 bg-white p-8 shadow-[0_40px_80px_rgba(0,0,0,0.35)] md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
                    Agent application
                  </p>
                  <h3 className="mt-2 text-2xl text-[color:var(--ink)] md:text-3xl">
                    Apply in under 2 minutes
                  </h3>
                </div>
                <span className="shrink-0 rounded-full bg-[color:var(--ink)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  Free
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Role', value: 'Field agent' },
                  { label: 'Focus', value: 'Qualified recruits' },
                  { label: 'Follow-up', value: 'WhatsApp' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--paper)]/60 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[color:var(--ink)]">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <AgentApplicationForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER BAR ───────────────────────────────────── */}
      <div className="border-t border-[color:var(--stroke)]/60 bg-[color:var(--paper)] px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="rounded-xl bg-[color:var(--ink)] px-4 py-2 text-lg font-bold tracking-tight text-white">
            Leet
          </Link>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Leet · Ghana
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/agent-portal/login"
              className="text-sm font-medium text-[color:var(--accent-2)] transition hover:opacity-75"
            >
              Agent login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[color:var(--accent-2)] transition hover:opacity-75"
            >
              Home
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
