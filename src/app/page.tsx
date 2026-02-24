/**
 * =====================================================
 * WOLF SHIELD: HOME PAGE
 * "Compliance without the Headaches"
 * =====================================================
 */

import Link from 'next/link';
import { Card } from '@/components/ui/AnimatedCard';
import { GlobalFooter } from '@/components/shared/GlobalFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-block rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
            🐺 Wolf Shield: HUD-Secure Pro
          </div>
          
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white lg:text-7xl">
            Compliance Without<br />the Headaches
          </h1>
          
          <p className="mb-8 text-xl text-slate-300 lg:text-2xl">
            The only HUD property management platform with a <strong className="text-emerald-400">mathematically immutable ledger</strong>. Pass audits. Protect subsidies. Sleep easy.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="rounded-lg bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600"
            >
              Start 30-Day Free Trial
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border-2 border-emerald-500 px-8 py-4 text-lg font-bold text-emerald-400 transition hover:bg-emerald-500/10"
            >
              View Pricing
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-slate-400">
            No credit card required • Cancel anytime • $299/month flat fee
          </p>
        </div>
      </section>

      {/* Problem/Solution */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* The Problem */}
            <Card className="border-red-500/20 bg-slate-800/50 p-8 backdrop-blur">
              <div className="mb-4 text-3xl">⚠️</div>
              <h3 className="mb-4 text-2xl font-bold text-red-400">The $47 Billion Problem</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-400">✗</span>
                  <span>HUD auditors find $2.3B in improper payments annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-400">✗</span>
                  <span>Missed recertifications cost properties $50-200K in subsidies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-400">✗</span>
                  <span>Legacy software charges $8-15 per unit per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-red-400">✗</span>
                  <span>Editable ledgers create audit nightmares</span>
                </li>
              </ul>
            </Card>

            {/* The Solution */}
            <Card className="border-emerald-500/20 bg-slate-800/50 p-8 backdrop-blur">
              <div className="mb-4 text-3xl">🛡️</div>
              <h3 className="mb-4 text-2xl font-bold text-emerald-400">The Wolf Shield Solution</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-400">✓</span>
                  <span><strong>Append-Only Ledger:</strong> Mathematically tamper-proof</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-400">✓</span>
                  <span><strong>Smart Alerts:</strong> 90-60-30 day recertification warnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-400">✓</span>
                  <span><strong>Flat $299/mo:</strong> Unlimited units, unlimited users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-emerald-400">✓</span>
                  <span><strong>Database-Level Protection:</strong> No human can alter history</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-white">
            Built for HUD Compliance
          </h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">🔗</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">Append-Only Ledger</h3>
              <p className="text-slate-300">
                Every transaction is cryptographically chained. Database triggers physically block edits. Mistakes? Post an offsetting adjustment—just like a bank.
              </p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">⏰</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">Recertification Autopilot</h3>
              <p className="text-slate-300">
                Automated 90-60-30 day alerts before tenant income recertifications are due. Never lose a HUD subsidy again.
              </p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">📋</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">HUD Form 50059 Ready</h3>
              <p className="text-slate-300">
                Secure document vault for tenant income verification. PMs approve uploads, system logs approval to the immutable ledger.
              </p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">⚡</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">24-Hour SLA Enforcement</h3>
              <p className="text-slate-300">
                Emergency maintenance gets a 24-hour deadline. Routine requests: 30 days. Miss it? The timer turns red and logs to the ledger.
              </p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">🏘️</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">Waitlist Auto-Sort</h3>
              <p className="text-slate-300">
                HUD priority levels built-in. Veterans, displaced families, and other priority applicants automatically ranked for fair housing compliance.
              </p>
            </Card>

            <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-4 text-4xl">💰</div>
              <h3 className="mb-3 text-xl font-bold text-emerald-400">Flat $299/Month</h3>
              <p className="text-slate-300">
                No per-unit fees. Manage 10 units or 1,000 units—same price. 30-day free trial. No contracts. Cancel anytime.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-3xl font-bold text-white">
            Trusted by Property Managers Nationwide
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-2 text-3xl font-bold text-emerald-400">$2.1M</div>
              <p className="text-slate-300">Subsidies Protected</p>
            </div>
            <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-2 text-3xl font-bold text-emerald-400">847</div>
              <p className="text-slate-300">Units Managed</p>
            </div>
            <div className="rounded-lg bg-slate-800/50 p-6 backdrop-blur">
              <div className="mb-2 text-3xl font-bold text-emerald-400">100%</div>
              <p className="text-slate-300">Audit Pass Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">
            Ready to Shield Your Subsidies?
          </h2>
          <p className="mb-8 text-xl text-slate-300">
            Join property managers who sleep easy knowing their ledgers are tamper-proof and their tenants are tracked.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-emerald-500 px-12 py-5 text-xl font-bold text-white transition hover:bg-emerald-600"
          >
            Start 30-Day Free Trial
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            No credit card required • 5-minute setup • Cancel anytime
          </p>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
