import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
              Leet Privacy Policy
            </p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: March 1, 2026</p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-full border border-[color:var(--stroke)] bg-[color:var(--card)] px-4 py-2 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--soft)] transition-colors"
          >
            Back to home
          </Link>
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
            <p className="mt-3">
              If a rider enables Safety Share, we process live trip coordinates, timestamps, and trip status
              so a trusted contact can view trip progress through a temporary share link.
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
            <p className="mt-3">
              For Safety Share, trip information is disclosed to anyone with the active share link. Riders
              should only share this link with trusted contacts. Links are temporary and can be stopped,
              paused, resumed, or revoked by the rider.
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
            <p className="mt-3">
              Safety Share sessions are temporary by design. Active sessions expire automatically, and riders
              can end sharing at any time. We may retain limited session and access-log records for security,
              abuse prevention, incident response, and legal compliance.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">6. Your choices</h2>
            <p className="mt-3">
              You can update your profile details, manage notifications, and opt out of marketing messages
              in the app. Privacy requests can be sent to support.
            </p>
            <p className="mt-3">
              You can delete your account directly in the app at any time, or request deletion through
              support. After deletion is requested and confirmed, we will delete or anonymize your account
              data, except where retention is required for legal, safety, fraud prevention, or
              dispute-resolution purposes.
            </p>
            <p className="mt-3">
              Riders control Safety Share directly in the app and can pause, resume, stop, or revoke sharing
              during an active ride.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">7. Cookies and tracking</h2>
            <p className="mt-3">
              Our website uses cookies and similar technologies to remember your preferences, analyse site
              traffic, and improve your browsing experience. We use:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><strong className="text-[color:var(--ink)]">Essential cookies</strong> — required for core site functionality such as remembering your cookie consent choice.</li>
              <li><strong className="text-[color:var(--ink)]">Analytics cookies</strong> — help us understand how visitors use the site so we can improve it.</li>
              <li><strong className="text-[color:var(--ink)]">Third-party cookies</strong> — set by services we integrate with, such as our live-chat provider, to enable their features.</li>
            </ul>
            <p className="mt-3">
              When you first visit, a banner lets you accept or decline non-essential cookies. You can also
              clear your preference at any time by clearing your browser&apos;s local storage for our site. Most
              browsers let you block or delete cookies through their settings.
            </p>
          </section>

          <section className="rounded-3xl border border-[color:var(--stroke)] bg-[color:var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-lg font-semibold text-[color:var(--ink)]">8. Security and contact</h2>
            <p className="mt-3">
              We use technical and organizational safeguards to protect personal data, including access controls,
              tokenized sharing links, and monitoring for abuse. No system is completely risk-free, so users
              should keep account credentials and shared links private.
            </p>
            <p className="mt-3">
              For privacy questions, requests, or complaints, contact us at{' '}
              <a
                href="mailto:support@leetgh.com"
                className="font-semibold text-[color:var(--accent)] underline-offset-2 hover:underline"
              >
                support@leetgh.com
              </a>
              .
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
