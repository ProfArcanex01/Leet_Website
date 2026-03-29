import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { WHATSAPP_SUPPORT_DEEP_LINK, WHATSAPP_SUPPORT_NUMBER } from '@/lib/contact';
import { SupportForm } from './support-form';

export default function SupportPage() {
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
            Help & Support
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">We&apos;re here to help</h1>
          <p className="mt-2 text-sm text-muted-foreground">Get in touch for ride issues, account help, or general questions.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">In-app support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Open the Leet app and go to <span className="font-semibold text-[color:var(--ink)]">Help & Support</span> for
              ride issues, payment questions, or account help. This is the fastest way to reach us.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">Email support</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              For non-urgent questions or if you can&apos;t access the app, email us at{' '}
              <a
                href="mailto:support@leetgh.com"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                support@leetgh.com
              </a>
              . If you can&apos;t find the app in store search, use{' '}
              <span className="font-semibold text-[color:var(--ink)]">Leet-carpooling</span>. Include your phone number
              and ride details for faster help.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              You can also message us on WhatsApp at{' '}
              <a
                href={WHATSAPP_SUPPORT_DEEP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                {WHATSAPP_SUPPORT_NUMBER}
              </a>
              .
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
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

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
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

        <section className="mt-10 rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
          <h2 className="text-lg font-semibold text-[color:var(--ink)]">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="mt-6">
            <SupportForm />
          </div>
        </section>
      </section>

      {/* Dark footer */}
      <footer className="border-t border-[color:var(--stroke)]/60 bg-[#0A0907] px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <span className="text-lg font-bold tracking-tight text-white">Leet</span>
          <div className="flex flex-col items-center gap-1 md:items-start">
            <p className="text-xs text-white/40">© {new Date().getFullYear()} Leet · Ghana</p>
            <a
              href={WHATSAPP_SUPPORT_DEEP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-white/60 transition hover:text-[#E06C2C]"
            >
              WhatsApp: {WHATSAPP_SUPPORT_NUMBER}
            </a>
          </div>
          <Link href="/" className="text-sm font-medium text-white/60 transition hover:text-[#E06C2C]">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
