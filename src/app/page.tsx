import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    title: 'For riders',
    steps: ['Search a route', 'Request a seat', 'Track & pay in-app'],
  },
  {
    title: 'For hosts',
    steps: ['Plan a route', 'Approve riders', 'Earn per trip'],
  },
];

const features = [
  {
    title: 'Transparent pricing',
    copy: 'Know the fare before you book. Split costs fairly with fellow commuters.',
  },
  {
    title: 'Real-time tracking',
    copy: 'Live location sharing and clear pickup points keep everyone on schedule.',
  },
  {
    title: 'Route-first matching',
    copy: 'Riders join planned routes, so every trip is reliable and repeatable.',
  },
];

const faqs = [
  {
    title: 'Is Leet only for daily commutes?',
    copy: 'No. You can use Leet for any repeatable route — work, school, or weekend trips.',
  },
  {
    title: 'How do payments work?',
    copy: 'Riders pay in-app after the ride starts. Hosts request payment automatically or manually.',
  },
  {
    title: 'Can hosts limit who joins?',
    copy: 'Yes. Hosts review requests and choose riders before confirming seats.',
  },
  {
    title: 'When will Leet launch?',
    copy: 'We’re onboarding early riders and hosts now. Join the waitlist to get updates.',
  },
];

const aiShots = [
  {
    src: '/adaptiv-routing.png',
    title: 'Route intelligence',
    copy: 'See matching paths that cut time and cost.',
  },
  {
    src: '/predictive-demand.png',
    title: 'Predictive demand',
    copy: 'See the best pickup windows before you post.',
  },
  {
    src: '/smartprice.jpg',
    title: 'Smart pricing',
    copy: 'Fair ranges based on time, distance, and seat count.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 md:pt-20">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color:var(--card)] shadow-[var(--shadow)]">
              L
            </span>
            <span>Leet</span>
          </div>
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
          <Button variant="outline" className="rounded-full border-[color:var(--stroke)] bg-[color:var(--card)]">
            Get the app
          </Button>
        </nav>

        <div className="mt-20 grid gap-16 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-8">
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
              Share your existing route. Ride together. Split the cost.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Leet is a carpooling platform that matches riders with hosts already driving the same way. Hosts share
              their commute, riders book a seat, and everyone saves time and money.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent-2)]">
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Match on routes
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Book a seat
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[color:var(--soft)] px-4 py-2">
                Split the fare
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full px-8 py-6 text-sm font-semibold shadow-[var(--shadow)] hover:shadow-lg">
                Join as rider
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-[color:var(--stroke)] bg-[color:var(--card)] px-8 py-6 text-sm font-semibold"
              >
                Become a host
              </Button>
            </div>
          </div>
          <div className="relative">
            <Card className="rounded-[32px] border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Today’s route</span>
                  <Badge className="rounded-full bg-[color:var(--soft)] px-3 py-1 text-xs font-semibold text-[color:var(--accent-2)]">
                    Active
                  </Badge>
                </div>
                <CardTitle className="sr-only">Today’s route</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Accra → Tema</span>
                    <span>45 min</span>
                  </div>
                  <div className="mt-4 h-28 overflow-hidden rounded-xl border border-[color:var(--stroke)] bg-white/80 backdrop-blur-sm">
                    <img src="/cover.jpg" alt="Cover map" className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold">4 seats left</span>
                    <Badge className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-white">
                      GHS 10
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -bottom-8 -left-6 hidden rounded-3xl border-[color:var(--stroke)] bg-white/95 px-4 py-3 text-xs text-muted-foreground shadow-[var(--shadow)] backdrop-blur-sm md:block">
              <CardContent className="p-0">“I plan once. Riders fill the seats.”</CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {aiShots.map((shot) => (
            <Card
              key={shot.title}
              className="overflow-hidden rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-44 overflow-hidden bg-[color:var(--soft)]">
                <img src={shot.src} alt={shot.title} className="h-full w-full object-cover" />
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{shot.title}</CardTitle>
                <CardDescription>{shot.copy}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent-2)]">
            How it works
          </p>
          <h2 className="text-3xl font-semibold md:text-4xl">Built around the routes you already take.</h2>
        </div>
        <Card className="mb-12 rounded-3xl border-[color:var(--stroke)] bg-gradient-to-br from-blue-50/50 to-emerald-50/50">
          <CardContent className="p-6 md:p-8">
            <div className="grid items-center gap-4 md:grid-cols-[auto_1fr_auto]">
              <div className="flex flex-col items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[color:var(--accent)]"></div>
                <p className="text-xs font-medium text-[color:var(--ink)]">Start</p>
              </div>
              <div className="hidden h-1 rounded-full bg-gradient-to-r from-[color:var(--accent)] via-[color:var(--accent-2)] to-[color:var(--accent)] md:block"></div>
              <div className="h-1 w-full rounded-full bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] md:hidden"></div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[color:var(--accent-2)]"></div>
                <p className="text-xs font-medium text-[color:var(--ink)]">End</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-semibold text-[color:var(--ink)]">Accra → Tema</p>
              <p className="mt-1 text-xs text-muted-foreground">45 min • 4 seats available • GHS 10</p>
            </div>
          </CardContent>
        </Card>
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

      <section className="bg-[#0b111a]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[0.6fr_0.4fr]">
          <div>
            <Badge className="rounded-full bg-white/10 text-white">AI route intelligence</Badge>
            <h2 className="mt-6 text-balance text-3xl font-semibold text-white md:text-4xl">
              The intelligence layer for shared commutes.
            </h2>
            <p className="mt-4 text-sm text-white/70">
              We map overlap, demand windows, and price signals so hosts set fair ranges and riders see the best seats
              sooner.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['Live demand heatmap', 'Seat fill predictions', 'Pricing guardrails'].map((item) => (
                <Badge key={item} className="rounded-full bg-white/5 text-white/80">
                  {item}
                </Badge>
              ))}
            </div>
            <Button className="mt-8 rounded-full bg-white text-black hover:bg-white/90">Get early access</Button>
          </div>
          <div className="space-y-4">
            <Card className="rounded-3xl border-white/10 bg-white/5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <CardHeader>
                <CardTitle className="text-lg text-white">Weekly route signal</CardTitle>
                <CardDescription className="text-white/60">Accra ↔ Tema corridor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Peak window', value: '6:15 - 8:00 AM' },
                  { label: 'Avg. seat demand', value: '+38% WoW' },
                  { label: 'Recommended range', value: 'GHS 16 - 21' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm text-white/80">
                    <span>{row.label}</span>
                    <span className="font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-white/10 bg-gradient-to-br from-white/10 to-white/5 text-white">
              <CardContent className="p-6">
                <p className="text-sm text-white/70">“The AI guide helps me price consistently and fill seats faster.”</p>
                <p className="mt-4 text-sm font-semibold text-white">— Florence, host</p>
              </CardContent>
            </Card>
          </div>
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
                  <div className="h-6 w-6 rounded-lg bg-white/70"></div>
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

      <section id="trust" className="mx-auto max-w-6xl px-6 py-16">
        <Card className="rounded-[36px] border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
          <CardContent className="grid gap-8 p-8 md:grid-cols-[0.6fr_0.4fr] md:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">Trust & safety</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Ride with people you can rely on.</h2>
              <p className="mt-4 text-muted-foreground">
                Every host is verified, riders are rated after each trip, and routes are visible before you request a
                seat.
              </p>
              <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                {[
                  'Identity checks & ratings',
                  'Secure in-app payments',
                  'Share your trip status',
                  'Verified vehicle details',
                ].map((item) => (
                  <Card key={item} className="rounded-2xl border-[color:var(--stroke)] bg-[color:var(--soft)]">
                    <CardContent className="p-4">{item}</CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Card className="overflow-hidden rounded-3xl border-[color:var(--stroke)] bg-[color:var(--card)] shadow-[var(--shadow)]">
                <div className="h-56 w-full">
                  <img
                    src="/Ride-people-you-can-rely-on.png"
                    alt="Ride with people you can rely on"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
              <Card className="rounded-2xl bg-white/80 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Host rating</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-semibold">4.9</p>
                    <span className="text-xl text-yellow-500">★</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">Based on verified rider feedback</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl border-[color:var(--stroke)] bg-white/70">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  “Reliable routes, smooth pickups. I save every week.”
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="faqs" className="mx-auto max-w-6xl px-6 pb-16">
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

      <footer className="border-t border-[color:var(--stroke)] bg-[color:var(--card)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">Leet</p>
            <p className="text-sm text-muted-foreground">Routes that respect your time.</p>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a className="hover:text-[color:var(--ink)]" href="/terms">
              Terms
            </a>
            <a className="hover:text-[color:var(--ink)]" href="/privacy">
              Privacy
            </a>
            <a className="hover:text-[color:var(--ink)]" href="/support">
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
