/**
 * =====================================================
 * WOLF SHIELD: PRICING PAGE
 * Transparent $300/month flat fee
 * =====================================================
 */

import Link from 'next/link';
import { Card } from '@/components/ui/AnimatedCard';
import { STRIPE_CONFIG } from '@/config/stripe.config';
import { GlobalFooter } from '@/components/shared/GlobalFooter';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-bold text-white">
            One Price. Unlimited Units.
          </h1>
          <p className="text-xl text-slate-300">
            No per-unit fees. No hidden costs. No surprises.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto mb-16 max-w-2xl">
          <Card className="border-emerald-500 bg-slate-800/50 p-8 backdrop-blur lg:p-12">
            <div className="mb-6 text-center">
              <div className="mb-2 inline-block rounded-full bg-emerald-500/20 px-4 py-1 text-sm font-bold text-emerald-400">
                WOLF SHIELD HUD-SECURE PRO
              </div>
            </div>
            
            <div className="mb-8 text-center">
              <div className="mb-2 text-6xl font-bold text-white">
                $299<span className="text-2xl text-slate-400">/month</span>
              </div>
              <p className="text-slate-400">Flat fee • Unlimited units • Unlimited users</p>
            </div>

            <div className="mb-8 space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>30-Day Free Trial</strong> - No credit card required
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Immutable Append Ledger</strong> - Cryptographically tamper-proof
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Smart Recertification Alerts</strong> - 90-60-30 day warnings
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Maintenance SLA Tracking</strong> - 24hr emergency enforcement
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Tenant Document Vault</strong> - Secure income verification
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>HUD Waitlist Management</strong> - Priority auto-sorting
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Unlimited Properties & Units</strong> - Manage your entire portfolio
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Export for Auditors</strong> - PDF/CSV with cryptographic proof
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 text-emerald-400">✓</span>
                <span className="text-slate-200">
                  <strong>Cancel Anytime</strong> - No contracts, no commitments
                </span>
              </div>
            </div>

            <Link
              href="/signup"
              className="block w-full rounded-lg bg-emerald-500 py-4 text-center text-lg font-bold text-white transition hover:bg-emerald-600"
            >
              Start 30-Day Free Trial
            </Link>
            
            <p className="mt-4 text-center text-sm text-slate-400">
              No credit card required • 5-minute setup
            </p>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">
            Why Property Managers Are Switching
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-emerald-500">
                <tr>
                  <th className="pb-4 pr-4 text-slate-400"></th>
                  <th className="pb-4 px-4 text-center text-white">
                    <div className="text-lg font-bold">Wolf Shield</div>
                    <div className="text-sm font-normal text-emerald-400">$299/mo</div>
                  </th>
                  <th className="pb-4 px-4 text-center text-slate-400">
                    <div className="text-lg">Legacy Software</div>
                    <div className="text-sm">$8-15 per unit</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Pricing Model</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-bold">Flat Fee</td>
                  <td className="py-4 px-4 text-center text-slate-400">Per-Unit</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Cost for 100 units</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-bold">$299/mo</td>
                  <td className="py-4 px-4 text-center text-slate-400">$800-1,500/mo</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Immutable Ledger</td>
                  <td className="py-4 px-4 text-center text-emerald-400 text-2xl">✓</td>
                  <td className="py-4 px-4 text-center text-red-400 text-2xl">✗</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Database-Level Protection</td>
                  <td className="py-4 px-4 text-center text-emerald-400 text-2xl">✓</td>
                  <td className="py-4 px-4 text-center text-red-400 text-2xl">✗</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Smart Recertification Alerts</td>
                  <td className="py-4 px-4 text-center text-emerald-400 text-2xl">✓</td>
                  <td className="py-4 px-4 text-center text-yellow-400 text-2xl">~</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">24-Hour SLA Enforcement</td>
                  <td className="py-4 px-4 text-center text-emerald-400 text-2xl">✓</td>
                  <td className="py-4 px-4 text-center text-red-400 text-2xl">✗</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 text-slate-300">Setup Time</td>
                  <td className="py-4 px-4 text-center text-emerald-400 font-bold">5 minutes</td>
                  <td className="py-4 px-4 text-center text-slate-400">2-4 weeks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="mx-auto max-w-3xl space-y-6">
            <Card className="border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="mb-2 font-bold text-white">
                What if I manage 500 units?
              </h3>
              <p className="text-slate-300">
                Still $299/month. We don't believe in per-unit pricing. You pay the same whether you manage 10 units or 10,000 units.
              </p>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="mb-2 font-bold text-white">
                Can I really edit the ledger if I make a mistake?
              </h3>
              <p className="text-slate-300">
                No—and that's the point. The ledger is append-only and protected by database triggers. If you accidentally charge $500 instead of $50, you post a new offsetting adjustment. This is exactly how banks work, and it's what HUD auditors require.
              </p>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="mb-2 font-bold text-white">
                How does the 30-day trial work?
              </h3>
              <p className="text-slate-300">
                Sign up without a credit card. You get full access for 30 days. After the trial, you'll be prompted to add payment. If you don't, your account simply pauses—no charges, no surprises.
              </p>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="mb-2 font-bold text-white">
                What happens to my data if I cancel?
              </h3>
              <p className="text-slate-300">
                You can export your complete ledger (with cryptographic hashes) as a PDF or CSV before canceling. The export serves as your permanent HUD audit record.
              </p>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
              <h3 className="mb-2 font-bold text-white">
                Do you integrate with QuickBooks or Yardi?
              </h3>
              <p className="text-slate-300">
                Not yet, but it's on the roadmap. Wolf Shield is purpose-built for HUD compliance first. For now, you can export CSV files for accounting software imports.
              </p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-emerald-500 px-12 py-5 text-xl font-bold text-white transition hover:bg-emerald-600"
          >
            Start Your 30-Day Free Trial
          </Link>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}
