/**
 * =====================================================
 * MASTER SUBSCRIPTION AGREEMENT (MSA)
 * Wolf Shield HUD-Secure Pro
 * New Jerusalem Sovereign Holdings, LLC
 * =====================================================
 */

import { Card } from '@/components/ui/AnimatedCard';

export default function MSAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-slate-700 bg-slate-800/50 p-8 backdrop-blur lg:p-12">
          <h1 className="mb-8 text-4xl font-bold text-emerald-400">
            Master Subscription Agreement
          </h1>

          <div className="space-y-8 text-slate-300">
            <div className="rounded bg-slate-900/50 p-4 text-sm text-slate-400">
              <strong className="text-white">Last Updated:</strong> February 23, 2026
              <br />
              <strong className="text-white">Effective Date:</strong> February 23, 2026
            </div>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">1. Agreement Overview</h2>
              <p>
                This Master Subscription Agreement ("Agreement") is entered into between{' '}
                <strong className="text-emerald-400">New Jerusalem Holdings, LLC</strong>{' '}
                ("Provider," "we," "us," or "our"), a Wyoming limited liability company, and the subscribing entity ("Customer," "you," or "your").
              </p>
              <p className="mt-4">
                By subscribing to Wolf Shield HUD-Secure Pro ("the Service"), you acknowledge that you have read,
                understood, and agree to be bound by all terms and conditions set forth in this Agreement.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">
                2. The "Tool, Not an Agent" Disclaimer
              </h2>
              <div className="rounded border-2 border-yellow-500/50 bg-yellow-900/20 p-6">
                <p className="font-bold text-yellow-400">CRITICAL NOTICE:</p>
                <p className="mt-2">
                  <strong>Wolf Shield is a software utility designed to assist with data management.</strong>
                </p>
                <p className="mt-4">
                  New Jerusalem Holdings, LLC is <strong className="text-yellow-400">NOT</strong>:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>A legal advisor</li>
                  <li>A HUD agent</li>
                  <li>A compliance officer</li>
                  <li>A substitute for professional legal or accounting services</li>
                </ul>
                <p className="mt-4 font-bold">
                  The <strong className="text-yellow-400">ultimate responsibility</strong> for adhering to HUD,
                  Section 8, LIHTC regulations, and the accuracy of TRACS submissions rests{' '}
                  <strong className="text-yellow-400">entirely with the Customer</strong> (the Property Manager).
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">3. Service Description</h2>
              <p>Wolf Shield provides:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>An immutable, append-only ledger for transaction tracking</li>
                <li>Automated recertification alerts (90-60-30 day notifications)</li>
                <li>Maintenance request SLA tracking</li>
                <li>Tenant document vault</li>
                <li>Compliance reporting tools</li>
              </ul>
              <p className="mt-4">
                The Service is provided "as is" and is intended to <strong>assist</strong> with compliance management,
                not to guarantee compliance outcomes.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">4. Subscription Terms & Pricing</h2>
              <p>
                <strong>Price:</strong> $300.00 USD per month (flat fee)
                <br />
                <strong>Billing Cycle:</strong> Monthly, auto-renewing
                <br />
                <strong>Trial Period:</strong> 30 days free trial (no credit card required)
                <br />
                <strong>Payment Method:</strong> Via Stripe payment processor
              </p>
              <p className="mt-4">
                You may cancel your subscription at any time. No refunds will be provided for partial months.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">5. Limitation of Liability</h2>
              <div className="rounded border-2 border-red-500/50 bg-red-900/20 p-6">
                <p className="font-bold text-red-400">LIABILITY CAP:</p>
                <p className="mt-2">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEW JERUSALEM SOVEREIGN HOLDINGS, LLC'S TOTAL LIABILITY
                  TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION (WHETHER IN CONTRACT, TORT, OR OTHERWISE)
                  SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
                <p className="mt-4 font-bold text-red-400">MAXIMUM LIABILITY: $3,600.00 USD</p>
                <p className="mt-4">
                  This limitation applies even if you experience losses due to:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Missed recertification deadlines</li>
                  <li>Lost HUD subsidies</li>
                  <li>Audit failures</li>
                  <li>Data loss or corruption</li>
                  <li>System downtime</li>
                  <li>Any other Service-related issue</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">6. No Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p className="mt-4">
                We do not warrant that:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>The Service will meet your specific requirements</li>
                <li>The Service will be uninterrupted or error-free</li>
                <li>The Service will prevent all compliance violations</li>
                <li>Any defects in the Service will be corrected</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">7. License Restrictions</h2>
              <div className="rounded border-2 border-purple-500/50 bg-purple-900/20 p-6">
                <p className="font-bold text-purple-400">STRICTLY PROHIBITED:</p>
                <p className="mt-2">You agree that you will NOT:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>
                    <strong>Reverse-engineer</strong> or attempt to derive the source code of the Service
                  </li>
                  <li>
                    <strong>White-label</strong> or rebrand the Service for resale
                  </li>
                  <li>
                    <strong>Scrape</strong> or automatically extract data from the platform
                  </li>
                  <li>Copy, modify, or create derivative works of the Service</li>
                  <li>Remove, alter, or obscure any proprietary notices</li>
                  <li>Use the Service to compete with us</li>
                  <li>Transfer, sublicense, or assign your subscription without written consent</li>
                </ul>
                <p className="mt-4 font-bold text-purple-400">
                  Violation of these restrictions may result in immediate termination and legal action.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">8. Intellectual Property</h2>
              <p>
                All intellectual property rights in the Service, including but not limited to software, algorithms,
                design, trademarks, and documentation, are and shall remain the exclusive property of New Jerusalem
                Sovereign Holdings, LLC.
              </p>
              <p className="mt-4">
                <strong className="text-emerald-400">Wolf Shield™</strong> is a trademark of New Jerusalem Sovereign
                Holdings, LLC. All rights reserved.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">9. Data Ownership & Processing</h2>
              <p>
                <strong>Your Data:</strong> You retain all rights to the data you input into the Service.
              </p>
              <p className="mt-2">
                <strong>Our Role:</strong> We act as a <strong>Data Processor</strong> on your behalf. We do not
                own, sell, or share your tenant data with third parties (except as required by law or to provide
                the Service).
              </p>
              <p className="mt-4">
                Data is stored securely via Supabase (PostgreSQL) with encryption at rest and in transit.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">10. Termination</h2>
              <p>
                Either party may terminate this Agreement at any time:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>You may cancel your subscription via your account dashboard</li>
                <li>We may terminate for breach of this Agreement or non-payment</li>
              </ul>
              <p className="mt-4">
                Upon termination, you may export your ledger data. We will retain data for 30 days, then permanently
                delete it unless otherwise required by law.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">11. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless New Jerusalem Sovereign Holdings, LLC from any
                claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Your use of the Service</li>
                <li>Your violation of this Agreement</li>
                <li>Your violation of any laws or regulations</li>
                <li>Claims by your tenants or third parties related to your use of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">12. Governing Law & Dispute Resolution</h2>
              <p>
                This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict
                of law provisions.
              </p>
              <p className="mt-4">
                Any disputes shall be resolved through binding arbitration in accordance with the American Arbitration
                Association rules.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">13. Modifications</h2>
              <p>
                We reserve the right to modify this Agreement at any time. Material changes will be communicated via
                email at least 30 days in advance. Continued use of the Service after modifications constitutes
                acceptance of the updated Agreement.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">14. Contact Information</h2>
              <p>
                For questions about this Agreement, contact us at:
                <br />
                <strong className="text-emerald-400">legal@wolfshield.app</strong>
                <br />
                New Jerusalem Sovereign Holdings, LLC
              </p>
            </section>

            <div className="mt-12 rounded border-2 border-emerald-500/50 bg-emerald-900/20 p-6">
              <p className="font-bold text-emerald-400">ACKNOWLEDGMENT</p>
              <p className="mt-2">
                By clicking "I Agree" during the subscription checkout process, you acknowledge that you have read,
                understood, and agree to be bound by this Master Subscription Agreement.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
