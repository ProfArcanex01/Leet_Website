export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)]">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Leet Terms of Use
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Terms of Use</h1>
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
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">1. About Leet</h2>
            <p className="mt-3">
              Leet connects riders with hosts who share planned routes. The service helps users coordinate
              pickup, tracking, and payment for rides. We do not operate vehicles; we provide the platform
              to help users arrange rides.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">2. Eligibility & accounts</h2>
            <p className="mt-3">
              You must be at least 18 years old, provide accurate information, and keep your account secure.
              Hosts must maintain valid driving documents and comply with applicable local laws.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">3. Host responsibilities</h2>
            <p className="mt-3">
              Hosts are responsible for vehicle condition, safe driving, and honoring confirmed ride requests.
              Hosts control who joins their routes, and must follow Leet safety policies and community standards.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">4. Rider responsibilities</h2>
            <p className="mt-3">
              Riders must follow pickup instructions, respect hosts and vehicles, and pay the fare shown in-app.
              Riders agree to provide feedback after completed rides when prompted.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">5. Payments & fees</h2>
            <p className="mt-3">
              Fares are set and displayed before you ride. Payment is processed through in-app methods.
              Leet may charge a service fee to support platform operations.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">6. Cancellations</h2>
            <p className="mt-3">
              Riders and hosts should avoid last-minute cancellations. Repeated cancellations may result in
              account limits. Specific timing rules are shown in-app.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">7. Safety & community</h2>
            <p className="mt-3">
              Leet expects respectful behavior, accurate identity details, and adherence to safety guidelines.
              We may remove users who violate these standards.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">8. Changes to these terms</h2>
            <p className="mt-3">
              We may update these terms from time to time. The latest version is always posted here.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
