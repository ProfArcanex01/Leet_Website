import Link from 'next/link';
import { SupportForm } from './support-form';

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg)]">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Help & Support
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">We&apos;re here to help</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: February 11, 2026</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] transition-colors hover:bg-[color:var(--soft)]"
          >
            Back to home
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">In-app support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Open the Leet app and go to <span className="font-semibold text-[color:var(--ink)]">Help & Support</span> for
              ride issues, payment questions, or account help. This is the fastest way to reach us.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Email support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              For non-urgent questions or if you can&apos;t access the app, email us at{' '}
              <a
                href="mailto:support@leetgh.com"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                support@leetgh.com
              </a>
              . Include your phone number and ride details for faster help.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Safety concerns</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              If something feels unsafe during a ride, report it immediately through the app. We review all safety
              reports with priority. You can also reach us at{' '}
              <a
                href="mailto:support@leetgh.com?subject=Safety%20Report"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                support@leetgh.com
              </a>
              .
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Refunds & disputes</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Payment disputes are handled through the in-app Help & Support flow. We may request trip details and
              timestamps to investigate. For urgent payment issues, email{' '}
              <a
                href="mailto:support@leetgh.com?subject=Payment%20Dispute"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                support@leetgh.com
              </a>
              .
            </p>
          </section>
        </div>

        <section className="mt-10 rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)] md:p-8">
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="mt-6">
            <SupportForm />
          </div>
        </section>
      </section>
    </main>
  );
}
