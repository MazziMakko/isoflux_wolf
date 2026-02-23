/**
 * =====================================================
 * TENANT MAINTENANCE REQUEST FORM
 * With emergency warning and photo upload
 * =====================================================
 */

'use client';

import { useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';

export default function TenantMaintenancePage() {
  const { user } = useSystemState();
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState({
    category: '',
    priority: 'ROUTINE' as 'EMERGENCY' | 'ROUTINE',
    description: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileName = `maintenance/${user.id}/${Date.now()}_${photoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tenant-documents')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('tenant-documents')
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      // Calculate SLA deadline
      const now = new Date();
      const slaDeadline = new Date(now);
      if (request.priority === 'EMERGENCY') {
        slaDeadline.setHours(now.getHours() + 24); // 24 hours
      } else {
        slaDeadline.setDate(now.getDate() + 30); // 30 days
      }

      // Insert maintenance request
      const { error } = await supabase.from('maintenance_requests').insert({
        organization_id: 'current-org-id', // TODO: Get from tenant's unit
        property_id: 'current-property-id', // TODO: Get from tenant's unit
        unit_id: 'current-unit-id', // TODO: Get from tenant's unit
        tenant_id: user.id,
        category: request.category,
        priority: request.priority,
        description: request.description,
        photo_url: photoUrl,
        status: 'OPEN',
        sla_deadline: slaDeadline.toISOString(),
        is_sla_breached: false,
      });

      if (error) throw error;

      alert('✓ Maintenance request submitted successfully!');
      setRequest({ category: '', priority: 'ROUTINE', description: '' });
      setPhotoFile(null);
    } catch (error) {
      alert('Error: ' + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-4xl font-bold text-blue-400">🔧 Submit Maintenance Request</h1>

        {/* CRITICAL EMERGENCY DISCLAIMER - ALWAYS VISIBLE */}
        <Card className="mb-6 border-4 border-red-500 bg-red-900/30 p-6 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="text-5xl">🚨</div>
            <div>
              <h3 className="text-xl font-bold text-red-400">EMERGENCY DISCLAIMER</h3>
              <p className="mt-2 text-lg font-bold text-red-300">
                THIS PORTAL IS FOR ROUTINE MAINTENANCE ONLY.
              </p>
              <p className="mt-4 text-white">
                <strong>IN THE EVENT OF A FIRE, GAS LEAK, MEDICAL EMERGENCY, OR IMMEDIATE THREAT TO LIFE, CALL 911 IMMEDIATELY.</strong>
              </p>
              <p className="mt-4 text-red-200">
                DO NOT RELY ON THIS SYSTEM FOR EMERGENCY RESPONSE. Maintenance requests are reviewed during business hours and may take up to 24 hours for emergency priority or 30 days for routine priority.
              </p>
            </div>
          </div>
        </Card>

        {/* Emergency Warning */}
        {request.priority === 'EMERGENCY' && (
          <Card className="mb-6 border-red-500/50 bg-red-900/20 p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🚨</div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Emergency Request Notice</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Emergency requests (no heat, flooding, gas leak, electrical hazards) are dispatched immediately
                  and must be resolved within 24 hours.
                </p>
                <p className="mt-2 text-sm font-bold text-red-400">
                  ⚠️ For fire or medical emergencies, call 911 immediately. Do not wait for a response.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Request Form */}
        <Card className="border-blue-500/20 bg-slate-800/50 p-8 backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Category *</label>
              <select
                required
                value={request.category}
                onChange={(e) => setRequest({ ...request, category: e.target.value })}
                className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a category...</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC / Heating / Cooling</option>
                <option value="Appliance">Appliance</option>
                <option value="Pest Control">Pest Control</option>
                <option value="Locks / Security">Locks / Security</option>
                <option value="Structural">Structural</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Priority *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRequest({ ...request, priority: 'ROUTINE' })}
                  className={`rounded-lg border-2 px-6 py-4 font-bold transition ${
                    request.priority === 'ROUTINE'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl">🔵</div>
                  <div className="mt-2">Routine</div>
                  <div className="text-xs">30-day response</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRequest({ ...request, priority: 'EMERGENCY' })}
                  className={`rounded-lg border-2 px-6 py-4 font-bold transition ${
                    request.priority === 'EMERGENCY'
                      ? 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <div className="text-2xl">🚨</div>
                  <div className="mt-2">Emergency</div>
                  <div className="text-xs">24-hour response</div>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Description *</label>
              <textarea
                required
                value={request.description}
                onChange={(e) => setRequest({ ...request, description: e.target.value })}
                className="h-40 w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Please describe the issue in detail. Include any relevant information such as when it started, what you've tried, etc."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Photo (Optional)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full rounded border-2 border-dashed border-slate-600 bg-slate-900 px-4 py-8 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-white hover:border-blue-500"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Upload a photo of the issue to help us understand the problem better
              </p>
            </div>

            <div className="rounded bg-slate-900/50 p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-300">What happens next?</h3>
              <ul className="space-y-1 text-xs text-slate-400">
                <li>• Your request will be reviewed by the property manager</li>
                <li>• {request.priority === 'EMERGENCY' ? 'Emergency requests are handled within 24 hours' : 'Routine requests are handled within 30 days'}</li>
                <li>• You'll be notified when a vendor is assigned</li>
                <li>• You can track the status in your dashboard</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Maintenance Request'}
            </button>
          </form>
        </Card>

        {/* Help Box */}
        <Card className="mt-6 border-blue-500/20 bg-slate-800/50 p-4 backdrop-blur">
          <p className="text-sm text-slate-300">
            <strong className="text-blue-400">Need Immediate Help?</strong> For life-threatening emergencies
            (fire, medical, gas leak), always call 911 first. For property emergencies outside business hours,
            contact the emergency maintenance line at (555) 123-4567.
          </p>
        </Card>
      </div>
    </div>
  );
}
