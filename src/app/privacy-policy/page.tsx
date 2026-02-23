/**
 * =====================================================
 * PRIVACY POLICY
 * Wolf Shield HUD-Secure Pro
 * Data Processor for Property Managers
 * =====================================================
 */

import { Card } from '@/components/ui/AnimatedCard';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-slate-700 bg-slate-800/50 p-8 backdrop-blur lg:p-12">
          <h1 className="mb-8 text-4xl font-bold text-emerald-400">Privacy Policy</h1>

          <div className="space-y-8 text-slate-300">
            <div className="rounded bg-slate-900/50 p-4 text-sm text-slate-400">
              <strong className="text-white">Last Updated:</strong> February 23, 2026
              <br />
              <strong className="text-white">Effective Date:</strong> February 23, 2026
            </div>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">1. Overview</h2>
              <p>
                New Jerusalem Sovereign Holdings, LLC ("we," "us," "our") operates Wolf Shield HUD-Secure Pro
                ("the Service"). This Privacy Policy explains how we collect, use, store, and protect your information.
              </p>
              <div className="mt-4 rounded border-2 border-blue-500/50 bg-blue-900/20 p-4">
                <p className="font-bold text-blue-400">Our Role as Data Processor:</p>
                <p className="mt-2">
                  We act as a <strong>Data Processor</strong> on behalf of Property Managers (the "Data Controllers").
                  Tenant data is owned by the Property Manager, and we process it solely to provide the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">2. Information We Collect</h2>
              
              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">A. Property Manager Information</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Name, email address, phone number</li>
                <li>Organization name and address</li>
                <li>Payment information (processed by Stripe, not stored by us)</li>
                <li>IP address and browser information</li>
              </ul>

              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">B. Tenant Information (PII)</h3>
              <div className="mt-2 rounded border-2 border-yellow-500/50 bg-yellow-900/20 p-4">
                <p className="font-bold text-yellow-400">SENSITIVE DATA WARNING:</p>
                <p className="mt-2">The Service processes highly sensitive Personally Identifiable Information (PII):</p>
              </div>
              <ul className="mt-4 list-inside list-disc space-y-1">
                <li>Full name, address, phone number, email</li>
                <li>Lease agreements and rental payment history</li>
                <li>Income verification documents (paystubs, W-2s, bank statements)</li>
                <li>Social Security Numbers (on HUD Form 50059)</li>
                <li>Family composition and household income</li>
                <li>Recertification status and compliance records</li>
              </ul>

              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">C. System Usage Data</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Login timestamps and session duration</li>
                <li>Features accessed and actions performed</li>
                <li>Device type, operating system, browser type</li>
                <li>Aggregate usage statistics (anonymized)</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Provide and maintain the Service</li>
                <li>Process payments via Stripe</li>
                <li>Send recertification alerts and system notifications</li>
                <li>Generate compliance reports and ledger exports</li>
                <li>Respond to support requests</li>
                <li>Improve the Service (using anonymized data)</li>
                <li>Comply with legal obligations (e.g., HUD audits, subpoenas)</li>
              </ul>
              <p className="mt-4 font-bold text-emerald-400">
                We DO NOT sell, rent, or share tenant data with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">4. Data Storage & Security</h2>
              
              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">A. Where Data is Stored</h3>
              <p>
                All data is stored on <strong>Supabase</strong> (PostgreSQL), a SOC 2 Type II certified cloud database
                provider. Data is hosted in secure, geographically distributed data centers.
              </p>

              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">B. Security Measures</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  <strong>Encryption at Rest:</strong> All data is encrypted using AES-256
                </li>
                <li>
                  <strong>Encryption in Transit:</strong> TLS 1.3 for all connections
                </li>
                <li>
                  <strong>Row-Level Security (RLS):</strong> Database policies ensure users only access their own data
                </li>
                <li>
                  <strong>Private Storage Buckets:</strong> Tenant documents are stored in private Supabase Storage
                  with signed URLs
                </li>
                <li>
                  <strong>Immutable Ledger:</strong> Database triggers prevent unauthorized modification of audit logs
                </li>
                <li>
                  <strong>Role-Based Access Control:</strong> Super Admins, Property Managers, and Tenants have
                  separate permission levels
                </li>
              </ul>

              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">C. Document Vault Security</h3>
              <div className="mt-2 rounded border-2 border-red-500/50 bg-red-900/20 p-4">
                <p className="font-bold text-red-400">CRITICAL SECURITY NOTICE:</p>
                <p className="mt-2">
                  The <strong>tenant-documents</strong> storage bucket is configured as <strong>PRIVATE</strong>.
                  Documents are ONLY accessible via:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Authenticated users (tenant or property manager)</li>
                  <li>Short-lived signed URLs (expire after 1 hour)</li>
                  <li>RLS policies that verify user permissions</li>
                </ul>
                <p className="mt-4">
                  <strong>Public access is disabled.</strong> Documents cannot be accessed via direct URLs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">5. Data Retention</h2>
              <p>
                <strong>Active Accounts:</strong> Data is retained for the duration of your subscription plus 7 years
                (to comply with HUD audit retention requirements).
              </p>
              <p className="mt-2">
                <strong>Canceled Accounts:</strong> After cancellation, you have 30 days to export your data. After 30
                days, data is permanently deleted unless retention is required by law.
              </p>
              <p className="mt-4 font-bold text-yellow-400">
                The immutable ledger cannot be deleted during the retention period, as it serves as the legal audit trail.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">6. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  <strong>Stripe:</strong> Payment processing (does not store full credit card numbers)
                </li>
                <li>
                  <strong>Supabase:</strong> Database and file storage (SOC 2 Type II certified)
                </li>
                <li>
                  <strong>Vercel:</strong> Application hosting (SOC 2 Type II certified)
                </li>
              </ul>
              <p className="mt-4">
                These providers have their own privacy policies. We recommend reviewing them:
                <br />
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                  Stripe Privacy Policy
                </a>
                <br />
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                  Supabase Privacy Policy
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">7. Your Rights</h2>
              
              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">Property Managers</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Access your organization's data</li>
                <li>Export ledger data (CSV format)</li>
                <li>Request data deletion (after subscription cancellation)</li>
                <li>Update account information</li>
              </ul>

              <h3 className="mb-2 mt-4 text-xl font-bold text-emerald-400">Tenants</h3>
              <ul className="list-inside list-disc space-y-1">
                <li>Access your own documents and payment history</li>
                <li>Request deletion of uploaded documents</li>
                <li>Contact your Property Manager to exercise data rights (they are the Data Controller)</li>
              </ul>

              <p className="mt-4">
                To exercise these rights, contact us at:{' '}
                <strong className="text-emerald-400">privacy@wolfshield.app</strong>
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">8. Data Breach Notification</h2>
              <p>
                In the event of a data breach involving PII, we will:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Notify affected Property Managers within 72 hours</li>
                <li>Provide details of the breach and steps being taken</li>
                <li>Comply with all applicable breach notification laws</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">9. Children's Privacy</h2>
              <p>
                The Service is not intended for individuals under the age of 18. We do not knowingly collect information
                from children.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be communicated via email
                at least 30 days in advance. Continued use of the Service after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">11. Contact Us</h2>
              <p>
                For privacy-related questions or concerns:
                <br />
                <strong className="text-emerald-400">privacy@wolfshield.app</strong>
                <br />
                New Jerusalem Sovereign Holdings, LLC
              </p>
            </section>

            <div className="mt-12 rounded border-2 border-emerald-500/50 bg-emerald-900/20 p-6">
              <p className="font-bold text-emerald-400">SUMMARY</p>
              <p className="mt-2">
                We take your privacy seriously. Tenant data is encrypted, stored securely, and never sold. We act as
                a Data Processor for Property Managers and comply with all applicable privacy laws.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
