export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)]">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Help & Support
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">We’re here to help</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: January 25, 2026</p>
          </div>
          <a
            href="/"
            className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--soft)] transition-colors"
          >
            Back to home
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">In-app support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Open the Leet app and go to Help & Support for ride issues, payment questions, or account help.
            </p>
            <div className="mt-4 rounded-2xl bg-[color:var(--soft)] p-4 text-xs text-muted-foreground">
              Fastest response is through the app.
            </div>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Email support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              For non-urgent questions, reach us at
              <span className="font-semibold text-[color:var(--ink)]"> support@leetgh.com</span>.
              Include your phone number and ride details for faster help.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Safety concerns</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              If something feels unsafe, stop the ride and report it in-app immediately. We review safety
              reports with priority.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Refunds & disputes</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Payment disputes are handled through the in-app Help & Support flow. We may request trip
              details and timestamps to review.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
