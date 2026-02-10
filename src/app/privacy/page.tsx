export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)]">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Leet Privacy Policy
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: January 25, 2026</p>
          </div>
          <a
            href="/"
            className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--soft)] transition-colors"
          >
            Back to home
          </a>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground">
          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">1. Information we collect</h2>
            <p className="mt-3">
              We collect account details (name, phone), ride activity (routes, requests), and device data
              (app version, crash logs) to provide the service.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">2. Location data</h2>
            <p className="mt-3">
              We use location data to match routes, show live tracking, and confirm pickups. You can manage
              location permissions in your device settings, but some features may not work without it.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">3. How we use data</h2>
            <p className="mt-3">
              We use your data to operate the platform, keep users safe, improve matching, and communicate
              important updates. We do not sell personal data.
            </p>
            <p className="mt-3">
              This includes using invitation and referral data (such as who invited whom, activation status,
              and related timestamps) for trust onboarding, fraud prevention, abuse detection, and account
              safety monitoring.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">4. Sharing</h2>
            <p className="mt-3">
              Limited information is shared between riders and hosts (names, ratings, pickup locations) to
              complete rides. We may share data with service providers for payment processing and analytics.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">5. Data retention</h2>
            <p className="mt-3">
              We keep data as long as your account is active or as needed to comply with legal obligations.
              You can request deletion by contacting support.
            </p>
            <p className="mt-3">
              Referral and invite records may be retained for a reasonable period where necessary for security,
              fraud investigation, dispute handling, and legal compliance.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">6. Your choices</h2>
            <p className="mt-3">
              You can update your profile details, manage notifications, and opt out of marketing messages
              in the app. Privacy requests can be sent to support.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
