/**
 * =====================================================
 * MAINTENANCE SLA BOARD
 * Kanban-style board with SLA countdown timers
 * EMERGENCY: 24hrs | ROUTINE: 30 days
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';

interface MaintenanceRequest {
  id: string;
  category: string;
  priority: 'EMERGENCY' | 'ROUTINE';
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  unit_id: string;
  property_id: string;
  tenant_id: string;
  photo_url: string | null;
  sla_deadline: string;
  is_sla_breached: boolean;
  created_at: string;
  vendor_id: string | null;
}

export default function MaintenanceBoardPage() {
  const { organization } = useSystemState();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (organization?.id) {
      fetchRequests();
      
      // Refresh every minute to update timers
      const interval = setInterval(fetchRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [organization]);

  async function fetchRequests() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('maintenance_requests')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: false });

    if (data) setRequests(data);
  }

  async function handleResolve() {
    if (!selectedRequest) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Calculate time to resolve
    const createdAt = new Date(selectedRequest.created_at);
    const now = new Date();
    const hoursToResolve = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

    // Update request status
    await supabase
      .from('maintenance_requests')
      .update({
        status: 'RESOLVED',
        resolved_at: now.toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq('id', selectedRequest.id);

    // Log to immutable ledger
    const today = new Date();
    await supabase.from('hud_append_ledger').insert({
      organization_id: organization!.id,
      property_id: selectedRequest.property_id,
      unit_id: selectedRequest.unit_id,
      tenant_id: selectedRequest.tenant_id,
      transaction_type: 'MAINTENANCE_RESOLVED',
      amount: 0.0,
      description: `Maintenance Request #${selectedRequest.id.substring(0, 8)} Resolved. Priority: ${selectedRequest.priority}. Time to resolve: ${hoursToResolve} hours. Notes: ${resolutionNotes}`,
      accounting_period: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
      cryptographic_hash: '', // Auto-generated
      created_by: 'current-user-id', // TODO: Replace with actual user
    });

    alert('✓ Maintenance resolved and logged to immutable ledger');
    setShowResolveModal(false);
    setSelectedRequest(null);
    setResolutionNotes('');
    fetchRequests();
  }

  function calculateTimeRemaining(slaDeadline: string, isBreached: boolean) {
    if (isBreached) {
      return { text: 'SLA BREACHED', color: 'text-red-500 font-bold' };
    }

    const deadline = new Date(slaDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();

    if (diff < 0) {
      return { text: 'OVERDUE', color: 'text-red-500 font-bold' };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 1) {
      return { text: `${days} days remaining`, color: 'text-slate-400' };
    } else if (hours > 0) {
      return { text: `${hours} hours remaining`, color: hours < 6 ? 'text-red-400 font-bold' : 'text-yellow-400' };
    } else {
      return { text: 'Less than 1 hour', color: 'text-red-500 font-bold animate-pulse' };
    }
  }

  const getPriorityColor = (priority: string) => {
    return priority === 'EMERGENCY' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-blue-500/20 border-blue-500 text-blue-400';
  };

  const getByStatus = (status: string) => requests.filter((r) => r.status === status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-emerald-400">🔧 Maintenance SLA Board</h1>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* OPEN Column */}
          <div>
            <div className="mb-4 rounded-lg bg-slate-800/50 p-3 backdrop-blur">
              <h3 className="font-bold text-white">OPEN</h3>
              <span className="text-sm text-slate-400">{getByStatus('OPEN').length} requests</span>
            </div>
            <div className="space-y-4">
              {getByStatus('OPEN').map((request) => {
                const timer = calculateTimeRemaining(request.sla_deadline, request.is_sla_breached);
                return (
                  <Card
                    key={request.id}
                    className="cursor-pointer border-slate-700 bg-slate-800/50 p-4 backdrop-blur transition hover:border-emerald-500/50"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowResolveModal(true);
                    }}
                  >
                    <div className={`mb-2 inline-block rounded border px-2 py-1 text-xs font-bold ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </div>
                    <h4 className="mb-2 font-bold text-white">{request.category}</h4>
                    <p className="mb-3 text-sm text-slate-400">{request.description.substring(0, 60)}...</p>
                    <div className={`text-xs ${timer.color}`}>⏱️ {timer.text}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ASSIGNED Column */}
          <div>
            <div className="mb-4 rounded-lg bg-slate-800/50 p-3 backdrop-blur">
              <h3 className="font-bold text-white">ASSIGNED</h3>
              <span className="text-sm text-slate-400">{getByStatus('ASSIGNED').length} requests</span>
            </div>
            <div className="space-y-4">
              {getByStatus('ASSIGNED').map((request) => {
                const timer = calculateTimeRemaining(request.sla_deadline, request.is_sla_breached);
                return (
                  <Card
                    key={request.id}
                    className="cursor-pointer border-slate-700 bg-slate-800/50 p-4 backdrop-blur transition hover:border-emerald-500/50"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowResolveModal(true);
                    }}
                  >
                    <div className={`mb-2 inline-block rounded border px-2 py-1 text-xs font-bold ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </div>
                    <h4 className="mb-2 font-bold text-white">{request.category}</h4>
                    <p className="mb-3 text-sm text-slate-400">{request.description.substring(0, 60)}...</p>
                    <div className={`text-xs ${timer.color}`}>⏱️ {timer.text}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* IN_PROGRESS Column */}
          <div>
            <div className="mb-4 rounded-lg bg-slate-800/50 p-3 backdrop-blur">
              <h3 className="font-bold text-white">IN PROGRESS</h3>
              <span className="text-sm text-slate-400">{getByStatus('IN_PROGRESS').length} requests</span>
            </div>
            <div className="space-y-4">
              {getByStatus('IN_PROGRESS').map((request) => {
                const timer = calculateTimeRemaining(request.sla_deadline, request.is_sla_breached);
                return (
                  <Card
                    key={request.id}
                    className="cursor-pointer border-slate-700 bg-slate-800/50 p-4 backdrop-blur transition hover:border-emerald-500/50"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowResolveModal(true);
                    }}
                  >
                    <div className={`mb-2 inline-block rounded border px-2 py-1 text-xs font-bold ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </div>
                    <h4 className="mb-2 font-bold text-white">{request.category}</h4>
                    <p className="mb-3 text-sm text-slate-400">{request.description.substring(0, 60)}...</p>
                    <div className={`text-xs ${timer.color}`}>⏱️ {timer.text}</div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* RESOLVED Column */}
          <div>
            <div className="mb-4 rounded-lg bg-slate-800/50 p-3 backdrop-blur">
              <h3 className="font-bold text-white">RESOLVED</h3>
              <span className="text-sm text-slate-400">{getByStatus('RESOLVED').length} requests</span>
            </div>
            <div className="space-y-4">
              {getByStatus('RESOLVED').map((request) => (
                <Card key={request.id} className="border-emerald-700 bg-slate-800/50 p-4 backdrop-blur">
                  <div className="mb-2 inline-block rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                    ✓ RESOLVED
                  </div>
                  <h4 className="mb-2 font-bold text-white">{request.category}</h4>
                  <p className="text-sm text-slate-400">{request.description.substring(0, 60)}...</p>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Resolve Modal */}
        {showResolveModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-2xl border-emerald-500/20 bg-slate-800 p-8">
              <h2 className="mb-6 text-2xl font-bold text-emerald-400">Resolve Maintenance Request</h2>

              <div className="mb-6 space-y-3 rounded bg-slate-900/50 p-4">
                <div>
                  <span className="text-sm text-slate-400">Priority:</span>{' '}
                  <span className={`font-bold ${selectedRequest.priority === 'EMERGENCY' ? 'text-red-400' : 'text-blue-400'}`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Category:</span>{' '}
                  <span className="text-white">{selectedRequest.category}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Description:</span>{' '}
                  <p className="mt-1 text-white">{selectedRequest.description}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400">Created:</span>{' '}
                  <span className="text-white">{new Date(selectedRequest.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-slate-300">Resolution Notes *</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="h-32 w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="Describe the work performed..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleResolve}
                  disabled={!resolutionNotes}
                  className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  Mark Resolved & Log to Ledger
                </button>
                <button
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedRequest(null);
                    setResolutionNotes('');
                  }}
                  className="flex-1 rounded-lg border-2 border-slate-600 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
