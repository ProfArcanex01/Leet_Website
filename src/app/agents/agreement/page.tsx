import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leet Agent Agreement',
  description: 'Review the Leet Agent Agreement, including commission rules, conduct expectations, and privacy obligations.',
};

export default function AgentAgreementPage() {
  return (
    <main className="min-h-screen bg-[color:var(--paper)]">
      <header className="border-b border-white/10 bg-[#0A0907]">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-5">
          <Link href="/" className="rounded-xl bg-white/10 px-4 py-2.5 text-lg font-bold tracking-tight text-white backdrop-blur-sm">
            Leet
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
          >
            Back to agents
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12 md:pt-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[color:var(--accent)]">
            Version 2026-03-10
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[color:var(--ink)] md:text-4xl">Leet Agent Agreement</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review this agreement before submitting your agent application.
          </p>
        </div>

        <div className="space-y-6 text-sm text-muted-foreground">
          {[
            {
              title: '1. Parties',
              body: 'This agreement is between Leet Ghana and the individual applying to act as an independent Leet field agent.',
            },
            {
              title: '2. Purpose',
              body: 'The agent helps recruit and onboard new users onto the Leet platform in Ghana. For clarity, drivers use Host accounts in the app and passengers use Rider accounts in the app.',
            },
            {
              title: '3. Agent responsibilities',
              body: 'Agents must recruit honestly, explain Leet accurately, use approved onboarding methods and codes, protect user privacy, and avoid false promises, harassment, or deceptive recruitment.',
            },
            {
              title: '4. Attribution of recruits',
              body: 'A recruit is credited to an agent only where the user signs up, activates, or is onboarded using that agent’s assigned Leet code, or is otherwise assigned to that agent in Leet’s records.',
            },
            {
              title: '5. Commission structure',
              body: 'Qualified Driver: GHS 5 when a credited driver completes at least 1 trip within 30 days of registration. Passenger referrals are not commissionable under this agreement. Bonus programs, if any, are discretionary unless confirmed by Leet in writing.',
            },
            {
              title: '6. Payment',
              body: 'Approved commissions are paid monthly by Mobile Money to the number provided by the agent, normally on or before the 5th day of the following month, subject to fraud review or payment delays.',
            },
            {
              title: '7. Fraud, reversals, and withholding',
              body: 'Leet may reject, withhold, reverse, or offset commissions for fraudulent, duplicate, inactive, self-referred, improperly attributed, or policy-breaching accounts. Leet may also suspend the agent code or terminate the relationship for abuse.',
            },
            {
              title: '8. Term and termination',
              body: 'The agreement runs for 6 months from the effective date and renews automatically unless terminated on 14 days written notice. Leet may terminate immediately for breach, fraud, misconduct, or reputational harm.',
            },
            {
              title: '9. Independent contractor status',
              body: 'Agents are independent contractors, not employees. Agents handle their own taxes, transport, phone/data, and expenses, and are not entitled to employee benefits.',
            },
            {
              title: '10. Confidentiality and data protection',
              body: 'Agents must keep user and Leet information confidential, may not reuse or sell personal data, and must not retain unnecessary screenshots, contact lists, or onboarding records after they are no longer needed.',
            },
            {
              title: '11. Use of brand',
              body: 'Agents may use only Leet-approved names, scripts, flyers, QR codes, and materials, and may not create unauthorized Leet-branded pages, posts, or promotional materials without written approval.',
            },
            {
              title: '12. Governing law',
              body: 'This agreement is governed by the laws of the Republic of Ghana.',
            },
          ].map((section) => (
            <section key={section.title} className="rounded-3xl border border-[color:var(--stroke)] bg-white p-6 shadow-[0_8px_32px_rgba(21,19,15,0.06)] md:p-8">
              <h2 className="text-lg font-semibold text-[color:var(--ink)]">{section.title}</h2>
              <p className="mt-3">{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
