/**
 * =====================================================
 * TENANT END USER LICENSE AGREEMENT (EULA)
 * WITH EMERGENCY DISCLAIMER
 * =====================================================
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';

export default function TenantEULAPage() {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAccept = async () => {
    if (!isAccepted) {
      setError('You must agree to the terms before continuing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Update user metadata to record EULA acceptance
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          eula_accepted: true,
          eula_accepted_at: new Date().toISOString(),
        },
      });

      if (updateError) throw updateError;

      // Redirect to tenant dashboard
      router.push('/dashboard/tenant');
    } catch (err) {
      console.error('EULA acceptance error:', err);
      setError('Failed to accept terms. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-slate-700 bg-slate-800/50 p-8 backdrop-blur lg:p-12">
          <h1 className="mb-8 text-4xl font-bold text-emerald-400">Tenant End User License Agreement</h1>

          <div className="space-y-6 text-slate-300">
            <div className="rounded bg-slate-900/50 p-4 text-sm text-slate-400">
              <strong className="text-white">Last Updated:</strong> February 23, 2026
              <br />
              <strong className="text-white">Effective Date:</strong> February 23, 2026
            </div>

            {/* EMERGENCY DISCLAIMER - MOST CRITICAL */}
            <section className="rounded border-4 border-red-500 bg-red-900/30 p-6">
              <div className="flex items-start gap-4">
                <div className="text-5xl">🚨</div>
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-red-400">EMERGENCY DISCLAIMER</h2>
                  <p className="font-bold text-white">
                    THIS PORTAL IS FOR ROUTINE MAINTENANCE LOGGING ONLY.
                  </p>
                  <p className="mt-4 text-lg font-bold text-red-300">
                    IN THE EVENT OF A FIRE, GAS LEAK, MEDICAL EMERGENCY, OR IMMEDIATE THREAT TO LIFE,
                    CALL 911 IMMEDIATELY.
                  </p>
                  <p className="mt-4">
                    <strong className="text-red-400">DO NOT RELY ON THIS SYSTEM FOR EMERGENCY RESPONSE.</strong>
                  </p>
                  <p className="mt-4">
                    Examples of emergencies that require calling 911:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-red-200">
                    <li>Fire or smoke in your unit</li>
                    <li>Gas leak or smell of gas</li>
                    <li>Carbon monoxide alarm sounding</li>
                    <li>Severe flooding or water damage</li>
                    <li>Electrical sparks or burning smell</li>
                    <li>Medical emergency</li>
                    <li>Active crime or threat to safety</li>
                    <li>Elevator entrapment with medical distress</li>
                  </ul>
                  <p className="mt-4 text-lg font-bold text-red-300">
                    THIS PORTAL DOES NOT GUARANTEE IMMEDIATE RESPONSE. MAINTENANCE REQUESTS ARE REVIEWED
                    DURING BUSINESS HOURS.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              <p>
                By using the Wolf Shield Tenant Portal ("the Portal"), you agree to be bound by this End User License
                Agreement ("EULA"). If you do not agree, you may not use the Portal.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">2. Purpose of the Portal</h2>
              <p>The Portal allows you to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>View your lease information and payment history</li>
                <li>Upload income verification documents for recertification</li>
                <li>Submit routine maintenance requests</li>
                <li>Receive notifications about your tenancy</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">3. Data Privacy</h2>
              <p>
                Your data is owned by your Property Manager. Wolf Shield acts as a Data Processor. For details, see
                our{' '}
                <a href="/privacy-policy" target="_blank" className="text-emerald-400 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <p className="mt-4">
                Documents you upload (paystubs, W-2s, etc.) are stored securely and only accessible by you and your
                Property Manager.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">4. Maintenance Request Limitations</h2>
              <div className="rounded border-2 border-yellow-500/50 bg-yellow-900/20 p-4">
                <p className="font-bold text-yellow-400">IMPORTANT NOTICE:</p>
                <p className="mt-2">
                  Maintenance requests submitted via the Portal are for <strong>non-emergency issues only</strong>.
                </p>
                <p className="mt-4">Examples of routine maintenance:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Leaky faucet (not flooding)</li>
                  <li>Light bulb replacement</li>
                  <li>HVAC not working properly (but not dangerously hot/cold)</li>
                  <li>Cosmetic repairs</li>
                </ul>
                <p className="mt-4 font-bold text-yellow-400">
                  Response times vary by priority. "Emergency" requests are reviewed within 24 hours, but this is
                  NOT suitable for life-threatening situations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">5. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Submit false or fraudulent information</li>
                <li>Upload malicious files or viruses</li>
                <li>Attempt to access other tenants' data</li>
                <li>Use the Portal for illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">6. No Warranties</h2>
              <p>
                THE PORTAL IS PROVIDED "AS IS" WITHOUT WARRANTY. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS OR ERROR-FREE
                OPERATION.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">7. Limitation of Liability</h2>
              <p>
                Wolf Shield and your Property Manager are not liable for any damages arising from your use of the
                Portal, including but not limited to:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Delayed maintenance responses</li>
                <li>Data loss</li>
                <li>Service downtime</li>
                <li>Miscommunication</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">8. Contact Your Property Manager</h2>
              <p>
                For urgent (but non-emergency) issues, contact your Property Manager directly via phone. The Portal
                should not be your only method of communication for time-sensitive matters.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">9. Changes to This EULA</h2>
              <p>
                This EULA may be updated at any time. You will be notified of material changes and may be required to
                re-accept.
              </p>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-bold text-white">10. Contact</h2>
              <p>
                For technical support:
                <br />
                <strong className="text-emerald-400">support@wolfshield.app</strong>
              </p>
            </section>

            {/* Acceptance Checkbox */}
            <div className="mt-12 rounded border-2 border-emerald-500/50 bg-emerald-900/20 p-6">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  checked={isAccepted}
                  onChange={(e) => {
                    setIsAccepted(e.target.checked);
                    setError(null);
                  }}
                  className="mt-1 h-6 w-6 rounded border-emerald-500 bg-slate-700 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-lg text-white">
                  I have read and agree to this End User License Agreement. I understand that{' '}
                  <strong className="text-red-400">
                    this portal is NOT for emergencies and I must call 911 for life-threatening situations.
                  </strong>
                </span>
              </label>

              {error && (
                <p className="mt-4 rounded bg-red-900/50 p-3 text-center text-sm font-bold text-red-400">{error}</p>
              )}

              <button
                onClick={handleAccept}
                disabled={!isAccepted || isLoading}
                className="mt-6 w-full rounded-lg bg-emerald-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'I Agree - Continue to Portal'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
