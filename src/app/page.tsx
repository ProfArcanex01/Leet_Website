import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { WaitlistForm } from './waitlist-form';
import { WaitlistStickyCta } from './waitlist-sticky-cta';
import { DollarSign, Navigation, Route, CheckCircle2, Star } from 'lucide-react';

const steps = [
  {
    title: 'For riders',
    steps: ['Search a route that matches yours', 'Request a seat from a verified host', 'Track your ride & pay in-app'],
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
    copy: 'Leet is not ride-hailing. Hosts share routes they already drive — riders join those existing trips. It\'s carpooling, not on-demand taxi service.',
  },
  {
    title: 'What platforms is Leet available on?',
    copy: 'Leet is available now on both iOS and Android. Download from the App Store or Google Play and start carpooling today.',
  },
  {
    title: 'Is Leet only for daily commutes?',
    copy: 'No. You can use Leet for any repeatable route — work, school, or weekend trips between cities.',
  },
  {
    title: 'How do payments work?',
    copy: 'Riders pay in-app after the ride starts. Hosts can request payment automatically or manually.',
  },
  {
    title: 'Can hosts choose who rides with them?',
    copy: 'Yes. Hosts review every request and decide who joins before confirming seats.',
  },
];

const testimonials = [
  {
    quote: 'I cut my weekly transport cost by about 30% and finally have a reliable ride to work.',
    name: 'Ama K.',
    role: 'Verified Rider',
  },
  {
    quote: 'I post my route before leaving home, and my seats fill fast without changing my normal commute.',
    name: 'Kwesi A.',
    role: 'Verified Host',
  },
  {
    quote: 'Pickup times are clearer than other options. I know who I am riding with before I request.',
    name: 'Efua M.',
    role: 'Verified Rider',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <WaitlistStickyCta />
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-20">
        <nav className="flex items-center justify-between">
          <span className="rounded-xl bg-black px-4 py-2 text-2xl font-bold tracking-tight text-white">Leet</span>
          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a className="hover:text-[color:var(--ink)]" href="#how">
              How it works
            </a>
            <a className="hover:text-[color:var(--ink)]" href="#trust">
              Trust & safety
            </a>
            <a className="hover:text-[color:var(--ink)]" href="#faqs">
              FAQ
            </a>
          </div>
          <Button asChild className="rounded-full px-6 text-sm font-semibold shadow-[var(--shadow)]">
            <a href="#download">Download App</a>
          </Button>
        </nav>

        <div id="download" className="mt-20 grid gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-8">
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
              Share your route. Ride together. Split the cost.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Leet matches riders with hosts already driving the same way. Not ride-hailing — real carpooling. Hosts
              share their commute, riders book a seat, and everyone saves.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Route-first
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Book a seat
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Split the fare
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Now Live on iOS &amp; Android</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://apps.apple.com/app/leet-carpooling/id6758221255"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Leet on the App Store"
                  className="transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Image src="/app-store.svg" alt="Download on the App Store" width={190} height={56} className="h-10 w-auto" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.leetgh.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Leet on Google Play"
                  className="transition-transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Image src="/play-store.svg" alt="Get it on Google Play" width={190} height={56} className="h-10 w-auto" />
                </a>
              </div>
            </div>
          </div>
          <div className="relative">
            <Card className="rounded-[32px] border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Today&apos;s route</span>
                  <Badge className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-2)]">
                    Active
                  </Badge>
                </div>
                <CardTitle className="sr-only">Example route card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Accra → Kasoa</span>
                    <span>55 min</span>
                  </div>
                  <div className="mt-4 h-28 overflow-hidden rounded-xl border border-[color:var(--stroke)] bg-white/80 backdrop-blur-sm">
                    <Image src="/cover.jpg" alt="Map showing a shared route" width={400} height={112} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold">3 seats left</span>
                    <Badge className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                      GHS 12
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mx-auto mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
            How it works
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">Built around the routes you already take.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Hosts plan routes they drive every day. Riders search, request a seat, and pay — all in the app. No
            middleman, no surge.
          </p>
        </div>

        <div className="mb-12">
          <Card className="rounded-3xl border-[color:var(--stroke)] bg-gradient-to-br from-blue-50/50 to-emerald-50/50">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-3">
                {routes.map((route) => (
                  <div key={`${route.from}-${route.to}`} className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm">
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

      <section className="mx-auto max-w-6xl px-6 pb-16">
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
        <Card className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardContent className="flex flex-col gap-5 p-5 text-center sm:p-6 md:flex-row md:items-center md:justify-between md:text-left">
            <div className="mx-auto md:mx-0">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-2)]">Now Available</p>
              <h3 className="mt-1 font-sans text-2xl font-semibold leading-tight sm:text-3xl md:text-2xl">Ready to start carpooling?</h3>
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
        </Card>
      </section>

      <section className="bg-[#0b111a]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <Badge className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/70">Coming soon</Badge>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance text-3xl font-semibold text-white md:text-4xl">
              Smart features to make every trip better.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/60">
              We&apos;re building smarter tools to take the guesswork out of every commute.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {comingSoonFeatures.map((item) => (
              <div key={item.title} className="overflow-hidden rounded-2xl border border-white/8 bg-white/5 text-left backdrop-blur-sm">
                <div className="h-44 w-full overflow-hidden">
                  <Image src={item.image} alt={item.title} width={720} height={540} className="h-full w-full object-cover object-top" />
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

      <section id="trust" className="mx-auto max-w-6xl px-6 py-16">
        <Card className="rounded-[36px] border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[0.6fr_0.4fr] md:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">Trust & safety</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Ride with people you can rely on.</h2>
              <p className="mt-4 text-muted-foreground">
                Every host is verified, riders are rated after each trip, and routes are visible before you request a
                seat. You always know who you&apos;re riding with.
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
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm">{item}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Card className="overflow-hidden rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
                <div className="h-72 w-full">
                  <Image
                    src="/Ride-people-you-can-rely-on.png"
                    alt="Two people sharing a ride"
                    width={500}
                    height={288}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="faqs" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">Frequently asked questions</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.title} className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{faq.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.copy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-8 text-center">
          <p className="mx-auto text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">Community Feedback</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">What riders and hosts are saying</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <Card
              key={item.name}
              className="rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]"
            >
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-[color:var(--stroke)] pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-xs font-bold text-white">
                    {item.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--ink)]">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.08em] text-[color:var(--accent-2)]">{item.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="waitlist" className="mx-auto max-w-6xl px-6 pb-20">
        <Card className="rounded-[36px] border-[color:var(--stroke)] bg-gradient-to-br from-blue-50/50 to-emerald-50/50 shadow-[var(--shadow)]">
          <CardContent className="p-8 text-center md:p-12">
            <h2 className="text-3xl font-semibold md:text-4xl">Be the first to know.</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Get early access to new routes, features, and community updates — straight to your inbox.
            </p>
            <WaitlistForm idPrefix="main" platform="all" />
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-[color:var(--stroke)] bg-[color:var(--card)]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-lg font-semibold">Leet</p>
              <p className="text-sm text-muted-foreground">Routes that respect your time.</p>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://apps.apple.com/app/leet-carpooling/id6758221255"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download on the App Store"
                  className="opacity-80 transition hover:opacity-100"
                >
                  <Image src="/app-store.svg" alt="Download on the App Store" width={110} height={32} className="h-8 w-auto" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.leetgh.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get it on Google Play"
                  className="opacity-80 transition hover:opacity-100"
                >
                  <Image src="/play-store.svg" alt="Get it on Google Play" width={110} height={32} className="h-8 w-auto" />
                </a>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground md:pt-1">
              <Link className="hover:text-[color:var(--ink)]" href="/terms">Terms</Link>
              <Link className="hover:text-[color:var(--ink)]" href="/privacy">Privacy</Link>
              <Link className="hover:text-[color:var(--ink)]" href="/support">Support</Link>
              <a
                href="https://twitter.com/LeetCarpooling"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[color:var(--ink)]"
                aria-label="Leet on X (Twitter)"
              >
                X&nbsp;/&nbsp;Twitter
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-[color:var(--stroke)] pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Leet. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
