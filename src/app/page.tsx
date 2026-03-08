import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { NewsletterForm } from './newsletter-form';
import { DownloadStickyCta } from './download-sticky-cta';
import { MobileNav } from './mobile-nav';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DollarSign, Navigation, Route, CheckCircle2, Star, UserRound, Car, MapPin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leet — Commute smarter',
  description:
    'Share your existing route. Ride together. Split the cost. Leet matches riders with hosts on reliable routes for safer, cheaper commuting in Ghana.',
  openGraph: {
    title: 'Leet — Commute smarter',
    description:
      'Share your existing route. Ride together. Split the cost. Leet matches riders with hosts already driving the same way.',
  },
  twitter: {
    title: 'Leet — Commute smarter',
    description: 'Share your existing route. Ride together. Split the cost.',
  },
};

const steps = [
  {
    title: 'For riders',
    steps: [
      'Search a route that matches yours',
      'Request a seat from a verified host',
      'Track your ride, share with trusted contacts, and pay in-app',
    ],
  },
  {
    title: 'For hosts',
    steps: ['Plan a route you already drive', 'Review and approve rider requests', 'Earn per seat, every trip'],
  },
];

const features = [
  {
    title: 'Transparent pricing',
    copy: 'Know the fare before you book. Costs are based on distance and seat count — no surge pricing.',
    icon: DollarSign,
  },
  {
    title: 'Real-time tracking',
    copy: 'Live location sharing and clear pickup points so everyone stays on schedule.',
    icon: Navigation,
  },
  {
    title: 'Route-first matching',
    copy: 'Riders join planned routes instead of requesting random pickups. Every trip is reliable and repeatable.',
    icon: Route,
  },
];


const comingSoonFeatures = [
  {
    title: 'Route intelligence',
    copy: 'Detects overlapping routes in real time to connect the right riders with the right hosts.',
    image: '/adaptiv-routing.png',
  },
  {
    title: 'Smart pricing',
    copy: 'Demand-based fare suggestions that help hosts earn more without guessing.',
    image: '/ai-commute-2.svg',
  },
  {
    title: 'Demand insights',
    copy: 'Seat fill predictions so hosts can plan better and riders always find a spot.',
    image: '/ai-commute-3.svg',
  },
];

const routes = [
  { from: 'Accra', to: 'Tema', time: '45 min', seats: 4, fare: 'GHS 10' },
  { from: 'Accra', to: 'Kasoa', time: '55 min', seats: 3, fare: 'GHS 12' },
  { from: 'Kumasi', to: 'Obuasi', time: '1 hr 20 min', seats: 2, fare: 'GHS 25' },
];

const faqs = [
  {
    title: 'How is Leet different from Uber or Bolt?',
    copy: 'Leet is not ride-hailing. Hosts share routes they already drive \u2014 riders join those existing trips. It\'s carpooling, not on-demand taxi service.',
  },
  {
    title: 'How do I become a host?',
    copy: 'Sign up, verify your phone and email, then add your vehicle details (make, model, plate number, and capacity). Once your vehicle is set up, you can start planning routes and accepting riders.',
  },
  {
    title: 'What are the payment methods?',
    copy: 'Leet supports Mobile Money (including MTN MoMo), credit/debit cards, bank accounts, and cash. Riders pay during or after the ride, and hosts confirm receipt before completing the trip.',
  },
  {
    title: 'What happens if a host cancels?',
    copy: 'If a host cancels a ride or deactivates a route, all affected riders are notified immediately and their seats are freed. Cancel as early as possible so riders can find alternatives.',
  },
  {
    title: 'What cities is Leet available in?',
    copy: 'Leet works anywhere in Ghana \u2014 you can plan and search routes in any city. Pricing is currently optimised for Accra, Kumasi, and Tamale, with more regions coming soon.',
  },
  {
    title: 'Is Leet only for daily commutes?',
    copy: 'No. You can use Leet for any repeatable route \u2014 work, school, or weekend trips between cities.',
  },
  {
    title: 'Can hosts choose who rides with them?',
    copy: 'Yes. Hosts review every request and decide who joins before confirming seats.',
  },
  {
    title: 'What platforms is Leet available on?',
    copy: 'Leet is available on iOS and Android. Use the App Store or Google Play buttons here, or search for "Leet-carpooling" in store search.',
  },
  {
    title: 'How does Safety Share work?',
    copy: 'During an active ride, riders can generate a temporary Safety Share link and send it to trusted contacts. Contacts can view live trip updates while the session is active. Riders can pause, resume, or stop sharing at any time.',
  },
];

const testimonials = [
  {
    quote: 'I cut my weekly transport cost by about 30% and now have a consistent Kasoa → Accra ride every weekday.',
    name: 'Ama K.',
    role: 'Rider',
    route: 'Kasoa → Accra',
    trips: 34,
    stars: 5,
  },
  {
    quote: 'I share my usual Accra → Oyibi route after work, when traffic is packed and people are waiting for a lift, and my seats still fill without changing my normal commute.',
    name: 'Kwesi A.',
    role: 'Host',
    route: 'Accra → Oyibi',
    trips: 61,
    stars: 5,
  },
  {
    quote: 'Pickup times are clearer than other options, and I can see a host\u2019s ratings and verified details before I request a seat.',
    name: 'Efua M.',
    role: 'Rider',
    route: 'Tema → Accra',
    trips: 12,
    stars: 4,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[color:var(--paper)]">
      <DownloadStickyCta />

      {/* ─── DARK HERO ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-[#0A0907]">
        {/* Subtle orbs */}
        <div
          className="pointer-events-none absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(224,108,44,0.28) 0%, transparent 70%)' }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(30,111,92,0.22) 0%, transparent 70%)' }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-20 md:px-12 md:pb-28 md:pt-12">
          <nav className="flex items-center justify-between">
            <span className="rounded-xl bg-white/10 px-4 py-2.5 text-xl font-bold tracking-tight text-white backdrop-blur-sm">Leet</span>
            <div className="hidden items-center gap-8 text-base text-white/70 md:flex">
              <a className="transition hover:text-white" href="#how">How it works</a>
              <a className="transition hover:text-white" href="#trust">Trust & safety</a>
              <a className="transition hover:text-white" href="#faqs">FAQ</a>
              <Link className="transition hover:text-white" href="/agents">Become an agent</Link>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#download"
                className="hidden items-center gap-2.5 rounded-full bg-[#E06C2C] px-7 py-3.5 text-base font-bold text-white shadow-[0_8px_28px_rgba(224,108,44,0.45)] transition-all duration-200 hover:bg-[#c95d24] hover:shadow-[0_12px_36px_rgba(224,108,44,0.5)] active:scale-[0.98] md:inline-flex"
              >
                Download App
                <ArrowRight className="h-4 w-4" />
              </a>
              <MobileNav />
            </div>
          </nav>

          <div id="download" className="mt-14 grid gap-12 md:mt-24 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:items-center">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl md:text-6xl lg:text-7xl" style={{ color: 'white' }}>
                Share your route.
                <br />
                <span
                  style={{
                    WebkitTextFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    backgroundImage: 'linear-gradient(100deg, #f5c49a 0%, #E06C2C 60%)',
                  }}
                >
                  Ride together. Split the cost.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-white/65 sm:text-xl">
                Leet connects riders with hosts already going the same way. It&apos;s real carpooling: hosts share their route, riders book a seat, everyone saves. Riders can share live trip progress with trusted contacts.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/60">Route-first</span>
                <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/60">Book a seat</span>
                <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/60">Split the fare</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <a
                  href="https://apps.apple.com/app/leet-carpooling/id6758221255"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Leet on the App Store"
                  className="transition hover:-translate-y-0.5"
                >
                  <Image src="/app-store.svg" alt="Download on the App Store" width={190} height={56} className="h-12 w-auto sm:h-11" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.leetgh.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Leet on Google Play"
                  className="transition hover:-translate-y-0.5"
                >
                  <Image src="/play-store.svg" alt="Get it on Google Play" width={190} height={56} className="h-12 w-auto sm:h-11" />
                </a>
              </div>
              <p className="mt-3 text-sm text-white/45">
                Can&apos;t find it? Search <span className="font-semibold text-white/70">Leet-carpooling</span> in the store.
              </p>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="relative w-[280px] flex-shrink-0 sm:w-[300px] md:w-[320px] phone-mockup" aria-hidden>
                <div className="absolute -top-4 left-6 z-20">
                  <span className="phone-tag inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/30 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#f0b48c] backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E06C2C] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E06C2C]" />
                    </span>
                    Live route
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-[2.75rem] border-[10px] border-white/20 bg-[#15130F] shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                  <div className="absolute left-1/2 top-5 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-[#15130F]" />
                  <div className="aspect-[9/19] w-full overflow-hidden rounded-[2rem] bg-[#15130F]">
                    <Image
                      src="/hero-app-screenshot.webp"
                      alt="Leet app — map and route view"
                      width={390}
                      height={844}
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
                      className="h-full w-full object-cover object-top"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <div className="mb-12 text-center">
          <p className="mx-auto mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            How it works
          </p>
          <h2 className="text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Built around the routes you already take.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Hosts plan routes they drive every day. Riders search, request a seat, and pay — all in the app. No middleman, no surge.
          </p>
        </div>

        <div className="mb-12">
          <Card className="rounded-3xl border-[color:var(--stroke)] bg-white shadow-[0_8px_32px_rgba(21,19,15,0.08)]">
            <CardContent className="p-6 md:p-8">
              <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
                {routes.map((route) => (
                  <div key={`${route.from}-${route.to}`} className="flex min-w-[220px] flex-shrink-0 items-center justify-between rounded-2xl bg-[color:var(--paper)]/80 px-4 py-3.5 text-sm md:min-w-0 md:flex-shrink">
                    <div>
                      <p className="font-semibold text-[color:var(--ink)]">{route.from} → {route.to}</p>
                      <p className="text-xs text-muted-foreground">{route.time} · {route.seats} seats</p>
                    </div>
                    <Badge className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                      {route.fare}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((card) => (
            <Card
              key={card.title}
              className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{card.title}</CardTitle>
                <CardDescription className="sr-only">Steps for {card.title.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {card.steps.map((step, index) => (
                    <li key={step} className="group flex items-start gap-4">
                      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--soft)] text-sm font-semibold text-[color:var(--accent)] transition-colors group-hover:bg-[color:var(--accent)] group-hover:text-white">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-sm font-medium text-[color:var(--ink)] transition-colors group-hover:text-[color:var(--accent)]">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 md:pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)]/60">
                  <feature.icon className="h-6 w-6 text-white" strokeWidth={1.75} />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 md:pb-16">
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[#0A0907] shadow-[0_24px_56px_rgba(0,0,0,0.25)]">
          <CardContent className="flex flex-col gap-5 p-6 text-center sm:p-8 md:flex-row md:items-center md:justify-between md:text-left">
            <div className="mx-auto md:mx-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0b48c]">Now available</p>
              <h3 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl md:text-2xl" style={{ color: 'white' }}>Ready to start carpooling?</h3>
            </div>
            <div className="mx-auto grid w-full max-w-[340px] grid-cols-2 gap-2 md:mx-0 md:gap-3">
              <a
                href="https://apps.apple.com/app/leet-carpooling/id6758221255"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download Leet on the App Store"
                className="transition hover:-translate-y-0.5 md:justify-self-end"
              >
                <Image src="/app-store.svg" alt="Download on the App Store" width={170} height={50} className="h-10 w-auto md:h-11" />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.leetgh.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get Leet on Google Play"
                className="transition hover:-translate-y-0.5"
              >
                <Image src="/play-store.svg" alt="Get it on Google Play" width={170} height={50} className="h-10 w-auto md:h-11" />
              </a>
            </div>
          </CardContent>
          <p className="px-6 pb-6 text-center text-xs text-white/50 sm:px-8 md:text-left">
            Can&apos;t find it? Search <span className="font-semibold text-white/70">Leet-carpooling</span> in the store.
          </p>
        </Card>
      </section>

      <section className="bg-[#0A0907]">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E06C2C]/30 bg-[#E06C2C]/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f0b48c]">
              Coming soon
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-bold md:text-4xl" style={{ color: 'white' }}>
              Smart features to make every trip better.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
              We&apos;re building smarter tools to take the guesswork out of every commute.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {comingSoonFeatures.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur-sm">
                <div className="aspect-video w-full overflow-hidden">
                  <Image src={item.image} alt={item.title} width={720} height={405} sizes="(max-width: 768px) 100vw, 33vw" className="h-full w-full object-cover object-top" />
                </div>
                <div className="p-6">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-white/55">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <Card className="rounded-[36px] border-[color:var(--stroke)] bg-white shadow-[0_8px_32px_rgba(21,19,15,0.08)]">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[0.6fr_0.4fr] md:p-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">Trust & safety</p>
              <h2 className="mt-4 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Ride with people you can rely on.</h2>
              <p className="mt-4 text-muted-foreground">
                Every host is verified, riders are rated after each trip, and routes are visible before you request a
                seat. You always know who you&apos;re riding with.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Riders can also use Safety Share to send a temporary live trip link to trusted contacts and end sharing anytime.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                {[
                  'Identity verification',
                  'Rider & host ratings',
                  'Secure in-app payments',
                  'Verified vehicle details',
                  'Live trip sharing',
                  'In-app support',
                ].map((item) => (
                  <Card key={item} className="rounded-2xl border-[color:var(--stroke)] bg-[color:var(--soft)]">
                    <CardContent className="flex items-center gap-2.5 p-4">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[color:var(--accent-2)]" />
                      <span className="text-sm">{item}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Card className="overflow-hidden rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
                <div className="h-56 w-full md:h-72">
                  <Image
                    src="/Ride-people-you-can-rely-on.webp"
                    alt="Two people sharing a ride"
                    width={500}
                    height={288}
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="earnings" className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">For hosts</p>
            <h2 className="mt-4 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">See your earnings at a glance.</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Track gross earnings, platform fees, and recent payouts by day, week, or month. Everything in one place — no spreadsheets.
            </p>
            <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-muted-foreground">
              <li>Daily, weekly, and monthly views</li>
              <li>Platform fee and net payout breakdown</li>
              <li>Recent payouts list</li>
            </ul>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <div
              className="relative w-[280px] flex-shrink-0 sm:w-[300px] md:w-[320px] phone-mockup"
              aria-hidden
            >
              <div className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 md:left-6 md:translate-x-0">
                <span className="phone-tag inline-flex items-center gap-1 rounded-full bg-[color:var(--soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent-2)] shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--accent-2)] opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--accent-2)]" />
                  </span>
                  Host earnings
                </span>
              </div>
              <div className="relative overflow-hidden rounded-[2.75rem] border-[10px] border-[color:var(--ink)] bg-[color:var(--ink)] shadow-[0_40px_80px_rgba(21,19,15,0.25),0_0_0_1px_rgba(21,19,15,0.08)]">
                <div className="absolute left-1/2 top-5 z-10 h-7 w-24 -translate-x-1/2 rounded-full bg-[color:var(--ink)]" />
                <div className="aspect-[9/19] w-full overflow-hidden rounded-[2rem] bg-[color:var(--ink)]">
                  <Image
                    src="/earnings-screen.webp"
                    alt="Leet app — Earnings screen showing payouts and trends"
                    width={390}
                    height={844}
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faqs" className="mx-auto max-w-6xl px-6 pb-10 md:pb-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Frequently asked questions</h2>
        </div>
        <Card className="mx-auto max-w-3xl rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardContent className="p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={faq.title} value={`faq-${i}`} className="border-[color:var(--stroke)]">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">{faq.title}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{faq.copy}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 md:pb-16">
        <div className="mb-8 text-center">
          <p className="mx-auto text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--accent)]">Community feedback</p>
          <h2 className="mt-3 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">What riders and hosts are saying</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card
              key={item.name}
              className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < item.stars ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-[color:var(--stroke)]'}`}
                      />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.route}
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-[color:var(--stroke)] pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-white shadow-sm">
                    {item.role === 'Host' ? (
                      <Car className="h-5 w-5" />
                    ) : (
                      <UserRound className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role} · {item.trips} trips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Become an agent — uses recruit_driver_5 */}
      <section className="bg-[#0A0907] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_32px_72px_rgba(0,0,0,0.35)]">
              <Image
                src="/recruit_driver_5.webp"
                alt="Leet agents recruiting drivers in the field"
                width={720}
                height={480}
                className="w-full object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f0b48c]">Join the team</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
                Become a Leet agent. Recruit drivers, earn on every activation.
              </h2>
              <p className="mt-5 text-white/65">
                Meet drivers where they are — washing bays, fuel stations, mechanics. Help them go live on Leet and get credited for every real activation. No experience needed.
              </p>
              <Link
                href="/agents"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#E06C2C] px-7 py-4 text-base font-bold text-white shadow-[0_8px_28px_rgba(224,108,44,0.45)] transition hover:bg-[#c95d24]"
              >
                Apply to become an agent
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="newsletter" className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <Card className="rounded-[36px] border-[color:var(--stroke)] bg-white shadow-[0_8px_32px_rgba(21,19,15,0.08)]">
          <CardContent className="p-8 text-center md:p-12">
            <h2 className="text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Stay in the loop.</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Get updates on new routes, features, and community news — straight to your inbox.
            </p>
            <NewsletterForm idPrefix="main" platform="all" />
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-white/10 bg-[#0A0907] pb-20 md:pb-0">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div className="flex flex-col items-center space-y-3 md:items-start">
              <p className="text-xl font-bold tracking-tight text-white">Leet</p>
              <p className="text-sm text-white/55">Routes that respect your time.</p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 md:justify-start">
                <a
                  href="https://apps.apple.com/app/leet-carpooling/id6758221255"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download on the App Store"
                  className="opacity-85 transition hover:opacity-100"
                >
                  <Image src="/app-store.svg" alt="Download on the App Store" width={110} height={32} className="h-8 w-auto" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.leetgh.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get it on Google Play"
                  className="opacity-85 transition hover:opacity-100"
                >
                  <Image src="/play-store.svg" alt="Get it on Google Play" width={110} height={32} className="h-8 w-auto" />
                </a>
              </div>
              <p className="text-xs text-white/45">
                Search: <span className="font-semibold text-white/70">Leet-carpooling</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/55 md:justify-start md:pt-1">
              <Link className="transition hover:text-white" href="/terms">Terms</Link>
              <Link className="transition hover:text-white" href="/privacy">Privacy</Link>
              <Link className="transition hover:text-white" href="/support">Support</Link>
              <Link className="transition hover:text-[#E06C2C]" href="/agents">Become an agent</Link>
              <a
                href="https://twitter.com/LeetCarpooling"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-white"
                aria-label="Leet on X (Twitter)"
              >
                X / Twitter
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} Leet. Ghana.
          </div>
        </div>
      </footer>
    </main>
  );
}
