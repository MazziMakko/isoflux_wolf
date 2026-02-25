/**
 * =====================================================
 * TERMS OF SERVICE
 * Wolf Shield HUD-Secure Pro
 * =====================================================
 */

import { Card } from '@/components/ui/AnimatedCard';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-slate-700 bg-slate-800/50 p-8 backdrop-blur lg:p-12">
          <h1 className="mb-8 text-4xl font-bold text-emerald-400">Terms of Service</h1>

          <div className="space-y-8 text-slate-300">
            <div className="rounded bg-slate-900/50 p-4 text-sm text-slate-400">
              <strong className="text-white">Last Updated:</strong> February 23, 2026
              <br />
              <strong className="text-white">Effective Date:</strong> February 23, 2026
            </div>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              <p>
                By accessing or using Wolf Shield HUD-Secure Pro ("the Service"), you agree to be bound by these
                Terms of Service and our{' '}
                <a href="/msa" className="text-emerald-400 hover:underline">
                  Master Subscription Agreement
                </a>
                {' '}and{' '}
                <a href="/privacy-policy" className="text-emerald-400 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">2. Eligibility</h2>
              <p>
                You must be at least 18 years old and authorized to enter into binding contracts to use the Service.
                By subscribing, you represent that you meet these requirements.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">3. Account Security</h2>
              <p>
                You are responsible for maintaining the security of your account credentials. You must:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Use a strong, unique password</li>
                <li>Not share your login credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-4 font-bold text-yellow-400">
                You are liable for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">4. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to any systems or data</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
                <li>Scrape, crawl, or automatically extract data</li>
                <li>Upload malicious code or viruses</li>
                <li>Harass, abuse, or harm others</li>
              </ul>
              <p className="mt-4 font-bold text-red-400">
                Violation of these terms may result in immediate account termination and legal action.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">5. Intellectual Property</h2>
              <p>
                All content, features, and functionality of the Service are owned by New Jerusalem Holdings,
                LLC and are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mt-4">
                <strong className="text-emerald-400">Wolf Shield™</strong> is a registered trademark. You may not use
                our trademarks without prior written consent.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">6. Payment & Refunds</h2>
              <p>
                <strong>Subscription Fee:</strong> $299/month (flat rate)
                <br />
                <strong>Billing:</strong> Automatic monthly renewal via Stripe
                <br />
                <strong>Free Trial:</strong> 30 days (no credit card required)
                <br />
                <strong>Refund Policy:</strong> No refunds for partial months
              </p>
              <p className="mt-4">
                If payment fails, your account will be suspended until payment is received. Repeated payment failures
                may result in account termination.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">7. Service Availability</h2>
              <p>
                We strive for 99.9% uptime, but the Service is provided "as is" without guarantees. We may perform
                maintenance, updates, or experience downtime. We are not liable for any losses due to Service
                unavailability.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">8. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Violation of these Terms</li>
                <li>Non-payment</li>
                <li>Fraudulent or illegal activity</li>
                <li>Any reason deemed necessary to protect the Service</li>
              </ul>
              <p className="mt-4">
                Upon termination, you will have 30 days to export your data before it is permanently deleted.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">9. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR
                IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">10. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY SHALL NOT EXCEED $3,600 (THE AMOUNT PAID
                IN THE PRECEDING 12 MONTHS).
              </p>
              <p className="mt-4">
                See our{' '}
                <a href="/msa" className="text-emerald-400 hover:underline">
                  Master Subscription Agreement
                </a>
                {' '}for full details.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">11. Indemnification</h2>
              <p>
                You agree to indemnify and hold us harmless from any claims arising from your use of the Service or
                violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">12. Governing Law</h2>
              <p>
                These Terms are governed by the laws of the State of Wyoming. Disputes shall be resolved through
                binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">13. Changes to Terms</h2>
              <p>
                We may update these Terms at any time. Material changes will be communicated via email. Continued use
                after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">14. Contact</h2>
              <div className="rounded bg-slate-900/50 p-4">
                <p>
                  <strong className="text-emerald-400">New Jerusalem Holdings, LLC</strong>
                  <br />
                  Wyoming, USA
                </p>
                <p className="mt-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:thenationofmazzi@gmail.com" className="text-emerald-400 hover:underline">
                    thenationofmazzi@gmail.com
                  </a>
                </p>
                <p className="mt-2">
                  <strong>Phone:</strong>{' '}
                  <a href="tel:+18562748668" className="text-emerald-400 hover:underline">
                    (856) 274-8668
                  </a>
                </p>
              </div>
            </section>

            <div className="mt-12 rounded border-2 border-emerald-500/50 bg-emerald-900/20 p-6">
              <p className="font-bold text-emerald-400">ACKNOWLEDGMENT</p>
              <p className="mt-2">
                By using the Service, you acknowledge that you have read and agree to these Terms of Service.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
