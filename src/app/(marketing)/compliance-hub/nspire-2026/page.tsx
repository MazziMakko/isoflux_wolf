import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, AlertTriangle, CheckCircle2, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import NspireDeficiencyCalculator from '@/components/compliance/NspireDeficiencyCalculator';

export const metadata: Metadata = {
  title: '2026 NSPIRE Scoring Methodology & HUD Compliance | IsoFlux Wolf Shield',
  description: 'Master the transition from HQS to NSPIRE. Learn how to fix Life-Threatening defects in 24 hours to protect your property\'s 60+ score. Complete guide to affirmative habitability requirements.',
  keywords: 'NSPIRE scoring methodology 2026, Life-Threatening vs Severe defects, affirmative habitability requirements, HUD NSPIRE compliance, NSPIRE inspection scoring',
  openGraph: {
    title: '2026 NSPIRE Scoring Methodology & HUD Compliance',
    description: 'Master the transition from HQS to NSPIRE. Fix Life-Threatening defects in 24 hours to protect your property\'s 60+ score.',
    url: 'https://www.isoflux.app/compliance-hub/nspire-2026',
    siteName: 'IsoFlux Wolf Shield',
    type: 'article',
    images: [
      {
        url: 'https://www.isoflux.app/og-nspire-2026.png',
        width: 1200,
        height: 630,
        alt: 'NSPIRE 2026 Compliance Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2026 NSPIRE Scoring Methodology & HUD Compliance',
    description: 'Master NSPIRE scoring and protect your property\'s compliance score.',
  },
  alternates: {
    canonical: 'https://www.isoflux.app/compliance-hub/nspire-2026',
  },
};

export default function NspirePage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#050505] pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#50C878]/10 via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#50C878]/10 text-[#50C878] px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Shield className="h-4 w-4" />
              HUD NSPIRE COMPLIANCE AUTHORITY
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              2026 NSPIRE Scoring<br />
              <span className="text-[#50C878]">Methodology & Compliance</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Master the transition from HQS to NSPIRE. Learn how to fix Life-Threatening defects in 24 hours to protect your property's 60+ score and maintain HUD compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
              >
                Automate NSPIRE Tracking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-lg border border-white/20 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 px-4 border-y border-[#50C878]/20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">60+</div>
              <div className="text-gray-400 text-sm">Passing Score Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">24hr</div>
              <div className="text-gray-400 text-sm">Life-Threatening Fix Window</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">3 Tiers</div>
              <div className="text-gray-400 text-sm">Deficiency Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">100%</div>
              <div className="text-gray-400 text-sm">Audit Trail Required</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Understanding NSPIRE */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[#50C878]" />
                  Understanding NSPIRE 2026
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-4">
                    The <strong className="text-white">National Standards for the Physical Inspection of Real Estate (NSPIRE)</strong> represents HUD's most significant inspection protocol update in decades. Unlike the legacy HQS (Housing Quality Standards), NSPIRE uses a <strong className="text-[#50C878]">weighted scoring methodology</strong> that prioritizes health and safety deficiencies.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    For affordable housing operators managing HUD-subsidized units, maintaining a score of <strong className="text-[#50C878]">60 or higher</strong> is no longer optional—it's mission-critical for subsidy retention and tenant safety.
                  </p>
                </div>
              </div>

              {/* Deficiency Tiers */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">The Three Deficiency Tiers</h2>
                <div className="space-y-4">
                  {/* Life-Threatening */}
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 hover:border-red-500/60 transition-all">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-red-400 mb-3">Life-Threatening (LT)</h3>
                        <p className="text-gray-300 mb-4">
                          These deficiencies <strong>must be corrected within 24 hours</strong> of notification. Failure to remediate triggers immediate subsidy suspension and potential contract termination.
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Common Examples:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Blocked or locked emergency egress</li>
                            <li>Missing or non-functional smoke/CO detectors</li>
                            <li>Exposed electrical wiring with shock hazard</li>
                            <li>Gas leaks or severe carbon monoxide risks</li>
                            <li>Structural collapse risk</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Severe */}
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/60 transition-all">
                    <div className="flex items-start gap-4">
                      <Clock className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-3">Severe (SV)</h3>
                        <p className="text-gray-300 mb-4">
                          Deficiencies that pose a serious health or safety risk but are not immediately life-threatening. Must be corrected within the standard timeframe (typically 30 days).
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Common Examples:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Non-functional HVAC in extreme weather</li>
                            <li>Water leaks causing mold or structural damage</li>
                            <li>Trip hazards (broken stairs, uneven flooring)</li>
                            <li>Missing window locks on accessible windows</li>
                            <li>Pest infestation (rodents, bedbugs)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Moderate */}
                  <div className="bg-gray-800/40 border border-gray-500/30 rounded-lg p-6 hover:border-gray-500/60 transition-all">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-8 w-8 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-300 mb-3">Moderate (MO)</h3>
                        <p className="text-gray-300 mb-4">
                          Minor maintenance issues that don't pose immediate health/safety risks. Still impact your NSPIRE score and tenant satisfaction.
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Common Examples:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Cosmetic damage (chipped paint, minor cracks)</li>
                            <li>Loose cabinet handles or drawers</li>
                            <li>Slow drains (not fully clogged)</li>
                            <li>Missing outlet covers (no exposed wiring)</li>
                            <li>Light bulbs out in common areas</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Affirmative Habitability */}
              <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-6">Affirmative Habitability Requirements</h2>
                <p className="text-gray-300 text-lg mb-6">
                  Unlike HQS, NSPIRE introduces <strong className="text-[#50C878]">affirmative habitability</strong>—a proactive standard that requires properties to maintain baseline functionality even without specific deficiencies cited.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#050505] rounded p-4">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] mb-2" />
                    <div className="font-bold text-white mb-1">Climate Control</div>
                    <div className="text-sm text-gray-400">Functional HVAC year-round</div>
                  </div>
                  <div className="bg-[#050505] rounded p-4">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] mb-2" />
                    <div className="font-bold text-white mb-1">Hot Water</div>
                    <div className="text-sm text-gray-400">Reliable 120°F+ supply</div>
                  </div>
                  <div className="bg-[#050505] rounded p-4">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] mb-2" />
                    <div className="font-bold text-white mb-1">Sanitation</div>
                    <div className="text-sm text-gray-400">Working plumbing and drainage</div>
                  </div>
                  <div className="bg-[#050505] rounded p-4">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] mb-2" />
                    <div className="font-bold text-white mb-1">Safety Systems</div>
                    <div className="text-sm text-gray-400">Smoke/CO detectors, egress</div>
                  </div>
                </div>
              </div>

              {/* Wolf Shield Solution */}
              <div className="bg-gradient-to-r from-[#50C878]/10 to-transparent border border-[#50C878]/30 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[#50C878]" />
                  How Wolf Shield Automates NSPIRE Compliance
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">24-Hour LT Tracking</div>
                      <div className="text-gray-300">Automated countdown timers and escalation workflows for Life-Threatening defects</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Immutable Audit Trail</div>
                      <div className="text-gray-300">SHA-256 cryptographic ledger of all repairs, inspections, and tenant communications</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Pre-Inspection Prep</div>
                      <div className="text-gray-300">Automated unit readiness checklists and deficiency prevention workflows</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Score Protection</div>
                      <div className="text-gray-300">Real-time scoring simulations and risk alerts to maintain 60+ threshold</div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-6 py-3 rounded-lg transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Right Column - Interactive Calculator */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <NspireDeficiencyCalculator />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 px-4 bg-[#0A0A0A] border-t border-[#50C878]/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Official HUD NSPIRE Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://www.hud.gov/program_offices/public_indian_housing/reac/nspire"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">HUD NSPIRE Portal</div>
              <div className="text-sm text-gray-400">Official standards and documentation</div>
            </a>
            <a
              href="https://www.hud.gov/sites/dfiles/PIH/documents/NSPIRE_Standards.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">NSPIRE Standards PDF</div>
              <div className="text-sm text-gray-400">Complete scoring methodology</div>
            </a>
            <a
              href="https://www.hud.gov/program_offices/public_indian_housing/reac/nspire/training"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">NSPIRE Training</div>
              <div className="text-sm text-gray-400">Free HUD certification courses</div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Don't Risk Your Subsidy.<br />
            Automate NSPIRE Compliance Today.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join property managers protecting 60+ scores with Wolf Shield's HUD-compliant ledger and repair tracking.
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
              href="/compliance-hub/hotma-readiness"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-lg border border-white/20 transition-all"
            >
              Next: HOTMA 2026 Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
