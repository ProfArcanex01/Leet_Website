import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--paper)]">
      {/* Dark header */}
      <header className="border-b border-white/10 bg-[#0A0907]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="rounded-xl bg-white/10 px-4 py-2.5 text-lg font-bold tracking-tight text-white backdrop-blur-sm">
            Leet
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12 md:pt-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            Leet Terms of Use
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Terms of Use</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: January 25, 2026</p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">1. About Leet</h2>
            <p className="mt-3">
              Leet connects passengers with drivers who share planned routes. Inside the app, drivers are
              referred to as Hosts and passengers are referred to as Riders. The service helps users coordinate
              pickup, tracking, and payment for rides. We do not operate vehicles; we provide the platform to
              help users arrange rides.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">2. Eligibility & accounts</h2>
            <p className="mt-3">
              You must be at least 18 years old, provide accurate information, and keep your account secure.
              Drivers (Hosts) must maintain valid driving documents and comply with applicable local laws.
            </p>
            <p className="mt-3">
              Leet may require an invitation or referral code for account activation. Referral tools are
              provided for trust onboarding and anti-abuse controls, and may not be used for spam, fraud,
              or other prohibited activity.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">3. Driver responsibilities</h2>
            <p className="mt-3">
              Drivers (Hosts) are responsible for vehicle condition, safe driving, and honoring confirmed ride requests.
              Drivers control who joins their routes, and must follow Leet safety policies and community standards.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">4. Passenger responsibilities</h2>
            <p className="mt-3">
              Passengers (Riders) must follow pickup instructions, respect drivers and vehicles, and pay the fare shown in-app.
              Passengers agree to provide feedback after completed rides when prompted.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">5. Payments & fees</h2>
            <p className="mt-3">
              Fares are set and displayed before you ride. Payment is processed through in-app methods.
              Leet may charge a service fee to support platform operations.
            </p>
            <p className="mt-3">
              For drivers, Leet applies a platform fee as a percentage of weekly completed-ride revenue.
              The applicable percentage is determined by Leet and may be updated with notice.
            </p>
            <p className="mt-3">
              Weekly earnings are calculated as gross completed-ride revenue minus platform fees, refunds,
              and other applicable adjustments. Net payout amounts and breakdowns are shown in-app.
            </p>
            <p className="mt-3">
              Payout timing and available payout methods may vary by location and payment provider.
              Users are responsible for any taxes or duties required under applicable law.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">6. Cancellations</h2>
            <p className="mt-3">
              Passengers and drivers should avoid last-minute cancellations. Repeated cancellations may result in
              account limits. Specific timing rules are shown in-app.
            </p>
            <p className="mt-3">
              Where applicable, cancellation, no-show, refund, and dispute outcomes may affect final fare,
              host earnings, and platform fees.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">7. Safety & community</h2>
            <p className="mt-3">
              Leet expects respectful behavior, accurate identity details, and adherence to safety guidelines.
              We may remove users who violate these standards.
            </p>
            <p className="mt-3">
              Referral and invite activity may be reviewed as part of fraud detection, account safety checks,
              and enforcement actions. Misuse of referral systems may result in limits, suspension, or removal.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">8. Changes to these terms</h2>
            <p className="mt-3">
              We may update these terms from time to time. The latest version is always posted here.
            </p>
          </section>
        </div>
      </section>

      {/* Dark footer */}
      <footer className="border-t border-[color:var(--stroke)]/60 bg-[#0A0907] px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-white">Leet</span>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} Leet · Ghana</p>
          <Link href="/" className="text-sm font-medium text-white/60 transition hover:text-[#E06C2C]">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
