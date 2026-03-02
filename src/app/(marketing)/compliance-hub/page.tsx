import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileCheck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'HUD Compliance Hub 2026 | NSPIRE & HOTMA Authority | IsoFlux Wolf Shield',
  description: 'Master HUD compliance for 2026: NSPIRE scoring methodology, HOTMA asset certification, and automated inspection tracking. Built for affordable housing operators.',
  keywords: 'HUD compliance 2026, NSPIRE HOTMA compliance, affordable housing regulations, HUD inspection automation, property management compliance software',
  openGraph: {
    title: 'HUD Compliance Hub 2026 | NSPIRE & HOTMA Authority',
    description: 'Complete HUD compliance resource for NSPIRE, HOTMA, and inspection automation',
    url: 'https://www.isoflux.app/compliance-hub',
    siteName: 'IsoFlux Wolf Shield',
    type: 'website',
    images: [
      {
        url: 'https://www.isoflux.app/og-compliance-hub.png',
        width: 1200,
        height: 630,
        alt: 'HUD Compliance Hub 2026',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.isoflux.app/compliance-hub',
  },
};

export default function ComplianceHubPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#050505] pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#50C878]/10 via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 bg-[#50C878]/10 text-[#50C878] px-4 py-2 rounded-full text-sm font-bold mb-6">
            <Shield className="h-4 w-4" />
            HUD COMPLIANCE AUTHORITY CENTER
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            HUD Compliance Hub<br />
            <span className="text-[#50C878]">2026</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Master NSPIRE, HOTMA, and HUD inspection protocols. Built for affordable and no-income housing operators managing HUD-subsidized properties.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
          >
            Automate Your Compliance
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Main Compliance Topics */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            2026 Compliance Topic Clusters
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NSPIRE Card */}
            <Link
              href="/compliance-hub/nspire-2026"
              className="group bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-8 hover:border-[#50C878] transition-all hover:scale-[1.02] transform"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#50C878] transition-colors">
                    NSPIRE 2026 Scoring Methodology
                  </h3>
                  <div className="text-gray-400 text-sm mb-4">
                    Updated: March 2026 | 15 min read
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Master the transition from HQS to NSPIRE. Learn how to fix Life-Threatening defects in 24 hours, understand the three deficiency tiers, and maintain a passing 60+ score.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Life-Threatening vs Severe vs Moderate deficiencies</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Affirmative habitability requirements</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Interactive deficiency calculator</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">24-hour fix tracking automation</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#50C878] font-bold group-hover:gap-3 transition-all">
                Read Full Guide
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>

            {/* HOTMA Card */}
            <Link
              href="/compliance-hub/hotma-readiness"
              className="group bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-8 hover:border-[#50C878] transition-all hover:scale-[1.02] transform"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#50C878]/20 p-4 rounded-lg border border-[#50C878]/30">
                  <FileCheck className="h-8 w-8 text-[#50C878]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#50C878] transition-colors">
                    HOTMA 2026 Compliance & Readiness
                  </h3>
                  <div className="text-gray-400 text-sm mb-4">
                    Updated: March 2026 | 12 min read
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6">
                Prepare for the HOTMA implementation deadline. Automate tenant selection plans, asset self-certification, and income recertifications with Wolf Shield.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">$50K asset self-certification threshold</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Mandatory Tenant Selection Plan updates</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Over-income tenant (120% AMI) tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#50C878] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">Interactive readiness checklist</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[#50C878] font-bold group-hover:gap-3 transition-all">
                Read Full Guide
                <ArrowRight className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Wolf Shield */}
      <section className="py-20 px-4 bg-[#0A0A0A] border-y border-[#50C878]/20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Affordable Housing Operators Choose Wolf Shield
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              HUD-aware, compliance-first automation for properties managing 20-300 subsidized units
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#050505] border border-[#50C878]/20 rounded-lg p-6">
              <Shield className="h-12 w-12 text-[#50C878] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Immutable Audit Trail</h3>
              <p className="text-gray-400">
                SHA-256 cryptographic ledger for every rent payment, repair, inspection, and recertification. Survive any HUD audit.
              </p>
            </div>

            <div className="bg-[#050505] border border-[#50C878]/20 rounded-lg p-6">
              <FileCheck className="h-12 w-12 text-[#50C878] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Automated Compliance Alerts</h3>
              <p className="text-gray-400">
                90-60-30 day recertification warnings, NSPIRE deficiency timers, and HOTMA over-income detection. Never miss a deadline.
              </p>
            </div>

            <div className="bg-[#050505] border border-[#50C878]/20 rounded-lg p-6">
              <AlertTriangle className="h-12 w-12 text-[#50C878] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">24-Hour LT Tracking</h3>
              <p className="text-gray-400">
                Automated countdown timers and escalation workflows for Life-Threatening NSPIRE defects. Protect your subsidy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Automate Your HUD Compliance?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join property managers protecting NSPIRE scores and meeting HOTMA requirements with Wolf Shield's HUD-compliant ledger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-lg border border-white/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
