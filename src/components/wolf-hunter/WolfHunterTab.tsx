/**
 * =====================================================
 * WOLF HUNTER - AUTONOMOUS LEAD ACQUISITION UI
 * Super Admin dashboard tab for lead approval
 * =====================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle, XCircle, Mail, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { approveLead, rejectLead, bulkApproveLead } from '@/app/actions/wolf-hunter';

interface HunterLead {
  id: string;
  company_name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string | null;
  state: string | null;
  estimated_units: number | null;
  tech_score: number | null;
  pain_point_hypothesis: string | null;
  status: string;
  source_type: string | null;
  scouted_at: string;
  metadata: any;
}

export default function WolfHunterTab() {
  const [leads, setLeads] = useState<HunterLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [processingLead, setProcessingLead] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('wolf_shield_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        /* ignore */
      }
    }
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const token = localStorage.getItem('wolf_shield_token');
    if (!token) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    try {
      // Fetch pending high-score leads
      const { data, error } = await supabase
        .from('hunter_leads')
        .select('*')
        .eq('status', 'pending')
        .gte('tech_score', 70) // High-value leads (70+)
        .order('tech_score', { ascending: false })
        .order('scouted_at', { ascending: false });

      if (error) throw error;

      setLeads((data as HunterLead[]) || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLoading(false);
    }
  }

  async function handleApproveLead(leadId: string) {
    if (!user?.id) {
      alert('User ID not found. Please refresh and try again.');
      return;
    }

    setProcessingLead(leadId);

    try {
      const result = await approveLead(leadId, user.id);

      if (result.success) {
        alert(result.message);
        // Remove from list
        setLeads(leads.filter(l => l.id !== leadId));
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingLead(null);
    }
  }

  async function handleRejectLead(leadId: string) {
    if (!user?.id) {
      alert('User ID not found. Please refresh and try again.');
      return;
    }

    const reason = prompt('Reason for rejection (optional):');
    setProcessingLead(leadId);

    try {
      const result = await rejectLead(leadId, user.id, reason || undefined);

      if (result.success) {
        alert('Lead rejected');
        setLeads(leads.filter(l => l.id !== leadId));
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingLead(null);
    }
  }

  async function handleBulkApprove() {
    if (selectedLeads.size === 0) {
      alert('No leads selected');
      return;
    }

    if (!confirm(`Approve and send outreach emails to ${selectedLeads.size} leads?`)) {
      return;
    }

    if (!user?.id) {
      alert('User ID not found');
      return;
    }

    setProcessingLead('bulk');

    try {
      const result = await bulkApproveLead(Array.from(selectedLeads), user.id);
      alert(`Bulk approval complete:\n✅ Approved: ${result.approved}\n📧 Emails sent: ${result.emailsSent}\n❌ Failed: ${result.failed}`);
      
      // Refresh leads
      fetchLeads();
      setSelectedLeads(new Set());
    } catch (error: any) {
      alert(`Bulk approval failed: ${error.message}`);
    } finally {
      setProcessingLead(null);
    }
  }

  function toggleLeadSelection(leadId: string) {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-[#50C878] animate-pulse">🐺 Loading targets...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#50C878] flex items-center gap-2">
              <Target className="h-7 w-7" />
              Wolf Hunter - Autonomous Acquisition
            </h2>
            <p className="text-gray-400 mt-1">
              High-value leads (Score ≥70) ready for approval
            </p>
          </div>

          {selectedLeads.size > 0 && (
            <button
              onClick={handleBulkApprove}
              disabled={processingLead === 'bulk'}
              className="bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Mail className="h-5 w-5" />
              Approve & Send ({selectedLeads.size})
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Target className="h-4 w-4" />
            Pending Approval
          </div>
          <div className="text-3xl font-bold text-white">{leads.length}</div>
        </div>

        <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <TrendingUp className="h-4 w-4" />
            Avg Score
          </div>
          <div className="text-3xl font-bold text-[#50C878]">
            {leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.tech_score || 0), 0) / leads.length) : 0}
          </div>
        </div>

        <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Mail className="h-4 w-4" />
            With Email
          </div>
          <div className="text-3xl font-bold text-white">
            {leads.filter(l => l.email).length}
          </div>
        </div>
      </div>

      {/* Leads List */}
      {leads.length === 0 ? (
        <div className="border border-gray-800 bg-[#0A0A0A] p-12 rounded-lg text-center">
          <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Targets Awaiting Approval</h3>
          <p className="text-gray-500">
            The Wolf Hunter will scout for new leads on Tuesday and Thursday at 3:00 AM EST.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className={`border ${
                selectedLeads.has(lead.id) ? 'border-[#50C878]' : 'border-gray-800'
              } bg-[#0A0A0A] p-6 rounded-lg hover:border-[#50C878]/50 transition-all`}
            >
              <div className="flex items-start justify-between">
                {/* Lead Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={() => toggleLeadSelection(lead.id)}
                      className="w-5 h-5 rounded border-gray-700 bg-[#050505] checked:bg-[#50C878] cursor-pointer"
                    />
                    <h3 className="text-xl font-bold text-white">{lead.company_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      (lead.tech_score || 0) >= 90 ? 'bg-[#50C878]/20 text-[#50C878]' :
                      (lead.tech_score || 0) >= 80 ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      Score: {lead.tech_score}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500">Location</div>
                      <div className="text-sm text-white">{lead.city}, {lead.state}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Units</div>
                      <div className="text-sm text-white font-bold">{lead.estimated_units || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm text-[#50C878]">{lead.email || 'None'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm text-white">{lead.phone || 'N/A'}</div>
                    </div>
                  </div>

                  {lead.pain_point_hypothesis && (
                    <div className="border-t border-gray-800 pt-3">
                      <div className="text-xs text-gray-500 mb-1">AI Analysis:</div>
                      <div className="text-sm text-gray-300 italic">
                        {lead.pain_point_hypothesis}
                      </div>
                    </div>
                  )}

                  {lead.metadata?.ai_reasoning && (
                    <div className="border-t border-gray-800 pt-3 mt-3">
                      <div className="text-xs text-gray-500 mb-1">AI Reasoning:</div>
                      <div className="text-sm text-gray-400">
                        {lead.metadata.ai_reasoning}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleApproveLead(lead.id)}
                    disabled={processingLead === lead.id || !lead.email}
                    className="bg-[#50C878] hover:bg-[#45B368] text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!lead.email ? 'No email address' : 'Approve and send outreach'}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {processingLead === lead.id ? 'Sending...' : 'Approve'}
                  </button>

                  <button
                    onClick={() => handleRejectLead(lead.id)}
                    disabled={processingLead === lead.id}
                    className="bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>

                  {lead.website && (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#50C878] hover:underline text-center"
                    >
                      Visit Site →
                    </a>
                  )}
                </div>
              </div>

              {!lead.email && (
                <div className="mt-3 flex items-center gap-2 text-yellow-500 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  No email address - Manual outreach required
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
