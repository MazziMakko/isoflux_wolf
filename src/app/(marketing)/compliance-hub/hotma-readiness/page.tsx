import { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck, Users, DollarSign, Shield, ArrowRight, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import HotmaReadinessChecklist from '@/components/compliance/HotmaReadinessChecklist';

export const metadata: Metadata = {
  title: 'HOTMA 2026 Compliance & Asset Certification | IsoFlux Wolf Shield',
  description: 'Prepare for the HOTMA compliance deadline. Automate your tenant selection plan, asset self-certification, and income calculations with IsoFlux Wolf Shield.',
  keywords: 'HOTMA self-certification of assets 2026, Tenant Selection Plan HOTMA updates, HOTMA compliance checklist, HUD asset limits 2026, HOTMA income calculation',
  openGraph: {
    title: 'HOTMA 2026 Compliance & Asset Certification',
    description: 'Automate HOTMA compliance: tenant selection plans, asset self-certification, and income calculations.',
    url: 'https://www.isoflux.app/compliance-hub/hotma-readiness',
    siteName: 'IsoFlux Wolf Shield',
    type: 'article',
    images: [
      {
        url: 'https://www.isoflux.app/og-hotma-2026.png',
        width: 1200,
        height: 630,
        alt: 'HOTMA 2026 Compliance Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOTMA 2026 Compliance & Asset Certification',
    description: 'Master HOTMA compliance and automate asset certifications.',
  },
  alternates: {
    canonical: 'https://www.isoflux.app/compliance-hub/hotma-readiness',
  },
};

export default function HotmaPage() {
  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0A0A] to-[#050505] pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#50C878]/10 via-transparent to-transparent"></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#50C878]/10 text-[#50C878] px-4 py-2 rounded-full text-sm font-bold mb-6">
              <FileCheck className="h-4 w-4" />
              HUD HOTMA COMPLIANCE AUTHORITY
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              HOTMA 2026<br />
              <span className="text-[#50C878]">Compliance & Readiness</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Master the Housing Opportunity Through Modernization Act (HOTMA) updates. Automate tenant selection plans, asset self-certification, and income calculations before the HUD deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105"
              >
                Automate HOTMA Compliance
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
              <div className="text-4xl font-bold text-[#50C878] mb-2">$50K</div>
              <div className="text-gray-400 text-sm">New Asset Threshold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">Every 3yr</div>
              <div className="text-gray-400 text-sm">Recertification Cycle</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">Self-Cert</div>
              <div className="text-gray-400 text-sm">Asset Declaration Method</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[#50C878] mb-2">100%</div>
              <div className="text-gray-400 text-sm">Documentation Required</div>
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
              {/* Understanding HOTMA */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileCheck className="h-8 w-8 text-[#50C878]" />
                  Understanding HOTMA 2026
                </h2>
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed mb-4">
                    The <strong className="text-white">Housing Opportunity Through Modernization Act (HOTMA)</strong> represents the most comprehensive update to HUD's Section 8 and public housing regulations in decades. For property managers, HOTMA introduces critical changes to income calculations, asset verification, and tenant selection processes.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Starting in 2026, <strong className="text-[#50C878]">all HUD-subsidized properties</strong> must comply with new tenant selection plans, mandatory asset self-certification, and updated over-income tenant rules.
                  </p>
                </div>
              </div>

              {/* Key HOTMA Changes */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">7 Critical HOTMA Changes</h2>
                <div className="space-y-4">
                  {/* Asset Limits */}
                  <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 hover:border-[#50C878]/60 transition-all">
                    <div className="flex items-start gap-4">
                      <DollarSign className="h-8 w-8 text-[#50C878] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">1. Asset Threshold Increase</h3>
                        <p className="text-gray-300 mb-4">
                          The asset limit for full verification increases from <strong>$5,000 to $50,000</strong>. Families below this threshold can now self-certify assets without third-party documentation.
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Key Implications:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Reduced administrative burden for 70%+ of tenants</li>
                            <li>Self-certification affidavits replace bank statements</li>
                            <li>Properties must track self-cert vs. full verification status</li>
                            <li>Annual recertifications still require signed declarations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tenant Selection Plan */}
                  <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 hover:border-[#50C878]/60 transition-all">
                    <div className="flex items-start gap-4">
                      <Users className="h-8 w-8 text-[#50C878] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">2. Mandatory Tenant Selection Plans</h3>
                        <p className="text-gray-300 mb-4">
                          All properties must adopt and publish a <strong>Tenant Selection Plan (TSP)</strong> that meets HUD's affirmative fair housing requirements.
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">TSP Requirements:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Nondiscriminatory selection criteria</li>
                            <li>Affirmative marketing plan</li>
                            <li>Reasonable accommodations procedures</li>
                            <li>Income targeting commitments (ELI/VELI)</li>
                            <li>Annual review and HUD submission</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Over-Income Tenants */}
                  <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 hover:border-[#50C878]/60 transition-all">
                    <div className="flex items-start gap-4">
                      <AlertCircle className="h-8 w-8 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">3. Over-Income Tenant Rules</h3>
                        <p className="text-gray-300 mb-4">
                          New procedures for tenants whose income exceeds 120% of Area Median Income (AMI) at recertification.
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Action Steps:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>Notify tenant within 30 days of over-income determination</li>
                            <li>Offer 6-month lease extension (at market rate)</li>
                            <li>Report over-income units to HUD quarterly</li>
                            <li>Track lease-up of over-income tenants' former units</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recertification Cycle */}
                  <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6 hover:border-[#50C878]/60 transition-all">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-8 w-8 text-[#50C878] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">4. Triennial Recertifications (Optional)</h3>
                        <p className="text-gray-300 mb-4">
                          Properties may adopt <strong>3-year recertification cycles</strong> for fixed-income elderly/disabled tenants (with HUD approval).
                        </p>
                        <div className="bg-[#050505] rounded p-4">
                          <div className="text-sm text-gray-400 mb-2">Eligibility Criteria:</div>
                          <ul className="list-disc list-inside text-gray-300 space-y-1">
                            <li>90%+ of income from fixed sources (SSI, pension)</li>
                            <li>No earned income from employment</li>
                            <li>Assets below $50K threshold</li>
                            <li>Annual income affidavits still required</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Key Changes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6">
                      <div className="font-bold text-white mb-2">5. Utility Allowance Updates</div>
                      <div className="text-sm text-gray-300">Mandatory annual review and tenant notification</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6">
                      <div className="font-bold text-white mb-2">6. Enterprise Income Verification (EIV)</div>
                      <div className="text-sm text-gray-300">Enhanced EIV reporting requirements</div>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#50C878]/30 rounded-lg p-6">
                      <div className="font-bold text-white mb-2">7. Fair Housing Certification</div>
                      <div className="text-sm text-gray-300">Annual staff training and HUD certification</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Timeline */}
              <div className="bg-gradient-to-r from-yellow-900/20 to-transparent border border-yellow-500/30 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                  HOTMA Implementation Timeline
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl font-bold text-yellow-400 flex-shrink-0">Q2 2026</div>
                    <div>
                      <div className="font-bold text-white mb-1">Compliance Deadline</div>
                      <div className="text-gray-300">All HUD-subsidized properties must implement HOTMA provisions</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl font-bold text-yellow-400 flex-shrink-0">Now</div>
                    <div>
                      <div className="font-bold text-white mb-1">Action Required</div>
                      <div className="text-gray-300">Update Tenant Selection Plans, train staff, and configure software systems</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wolf Shield Solution */}
              <div className="bg-gradient-to-r from-[#50C878]/10 to-transparent border border-[#50C878]/30 rounded-lg p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-[#50C878]" />
                  How Wolf Shield Automates HOTMA Compliance
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Asset Self-Certification Tracking</div>
                      <div className="text-gray-300">Automated $50K threshold detection and affidavit generation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Tenant Selection Plan Builder</div>
                      <div className="text-gray-300">HUD-compliant TSP templates with affirmative fair housing language</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Recertification Calendar</div>
                      <div className="text-gray-300">Automated 90-60-30 day reminders for annual and triennial recerts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Over-Income Tracking</div>
                      <div className="text-gray-300">Automatic AMI comparison and 120% over-income alerts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-[#50C878] flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-white mb-1">Immutable Audit Trail</div>
                      <div className="text-gray-300">SHA-256 ledger for all income certifications and affidavits</div>
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

            {/* Right Column - Interactive Checklist */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <HotmaReadinessChecklist />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 px-4 bg-[#0A0A0A] border-t border-[#50C878]/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Official HUD HOTMA Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="https://www.hud.gov/HOTMA"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">HUD HOTMA Portal</div>
              <div className="text-sm text-gray-400">Official guidance and regulations</div>
            </a>
            <a
              href="https://www.hud.gov/sites/dfiles/PIH/documents/HOTMA_Final_Rule.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">HOTMA Final Rule</div>
              <div className="text-sm text-gray-400">Complete regulatory text</div>
            </a>
            <a
              href="https://www.hud.gov/program_offices/public_indian_housing/programs/hcv/hotma"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#050505] border border-gray-800 rounded-lg p-6 hover:border-[#50C878]/50 transition-all group"
            >
              <ExternalLink className="h-6 w-6 text-[#50C878] mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-bold text-white mb-2">HOTMA Training</div>
              <div className="text-sm text-gray-400">Free HUD webinars and materials</div>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Don't Wait for the Deadline.<br />
            Automate HOTMA Compliance Today.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join property managers meeting 2026 HOTMA requirements with Wolf Shield's automated tenant selection and recertification tools.
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
              href="/compliance-hub/nspire-2026"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-lg border border-white/20 transition-all"
            >
              Back: NSPIRE 2026 Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
