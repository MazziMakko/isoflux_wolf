/**
 * =====================================================
 * SUPER ADMIN DASHBOARD - THE WATCHTOWER
 * Platform-wide oversight with HUD ledger hash feed
 * Total Active Subscriptions | Total Organizations | Ledger Integrity
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, TrendingUp, Building2, DollarSign, Activity, AlertTriangle, Hash, Target } from 'lucide-react';
import WolfHunterTab from '@/components/wolf-hunter/WolfHunterTab';

interface PlatformMetrics {
  mrr: number;
  activeTrials: number;
  totalOrganizations: number;
  totalProperties: number;
  totalUnits: number;
  totalTenants: number;
  activeSubscriptions: number;
  pastDueSubscriptions: number;
}

interface RecentOrganization {
  id: string;
  name: string;
  created_at: string;
  subscription_status: string;
  subscription_tier: string;
}

interface LedgerEntry {
  id: string;
  organization_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  cryptographic_hash: string;
  created_at: string;
  created_by: string;
}

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'hunter'>('overview');
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    mrr: 0,
    activeTrials: 0,
    totalOrganizations: 0,
    totalProperties: 0,
    totalUnits: 0,
    totalTenants: 0,
    activeSubscriptions: 0,
    pastDueSubscriptions: 0,
  });
  const [recentOrgs, setRecentOrgs] = useState<RecentOrganization[]>([]);
  const [recentLedger, setRecentLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user role from localStorage
    const userData = localStorage.getItem('wolf_shield_user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Redirect if not super admin (lowercase check)
        if (parsedUser.role !== 'super_admin' && parsedUser.role !== 'SUPER_ADMIN') {
          window.location.href = '/dashboard';
          return;
        }
      } catch {
        window.location.href = '/dashboard';
        return;
      }
    }

    fetchPlatformMetrics();
    fetchRecentLedgerEntries();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchPlatformMetrics();
      fetchRecentLedgerEntries();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchPlatformMetrics() {
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
      // Fetch organizations count
      const { count: orgCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      // Fetch properties count
      const { count: propCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch units count
      const { count: unitsCount } = await supabase
        .from('units')
        .select('*', { count: 'exact', head: true });

      // Fetch tenants count
      const { count: tenantsCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true });

      // Fetch subscriptions
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, tier');

      let activeSubscriptions = 0;
      let activeTrials = 0;
      let pastDueSubscriptions = 0;

      subscriptions?.forEach((sub) => {
        if (sub.status === 'active') activeSubscriptions++;
        if (sub.status === 'trialing') activeTrials++;
        if (sub.status === 'past_due') pastDueSubscriptions++;
      });

      // Calculate MRR ($299 per active subscription, excluding trials)
      const mrr = activeSubscriptions * 299;

      setMetrics({
        mrr,
        activeTrials,
        totalOrganizations: orgCount || 0,
        totalProperties: propCount || 0,
        totalUnits: unitsCount || 0,
        totalTenants: tenantsCount || 0,
        activeSubscriptions,
        pastDueSubscriptions,
      });

      // Fetch recent organizations
      const { data: orgs } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          created_at,
          subscriptions(status, tier)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (orgs) {
        setRecentOrgs(
          orgs.map((org: any) => ({
            id: org.id,
            name: org.name,
            created_at: org.created_at,
            subscription_status: org.subscriptions?.[0]?.status || 'none',
            subscription_tier: org.subscriptions?.[0]?.tier || 'none',
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  }

  async function fetchRecentLedgerEntries() {
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
      const { data: ledger } = await supabase
        .from('hud_append_ledger')
        .select('id, organization_id, transaction_type, amount, description, cryptographic_hash, created_at, created_by')
        .order('created_at', { ascending: false })
        .limit(20);

      if (ledger) {
        setRecentLedger(ledger as LedgerEntry[]);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="text-xl text-[#50C878] animate-pulse">⚡ Loading Super Admin Vault...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#50C878] flex items-center gap-3">
              <Shield className="h-10 w-10" />
              The Watchtower
            </h1>
            <p className="mt-2 text-gray-400">Super Admin - Platform-Wide Oversight</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Logged in as</div>
            <div className="text-lg font-bold text-[#50C878]">{user?.fullName || user?.email}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'overview'
                ? 'text-[#50C878] border-b-2 border-[#50C878]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Platform Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('hunter')}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'hunter'
                ? 'text-[#50C878] border-b-2 border-[#50C878]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Wolf Hunter
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>

        {/* Primary KPI Cards - Afrofuturist Style */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg backdrop-blur-sm hover:border-[#50C878]/60 transition-all">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-[#50C878]" />
              <div className="text-xs text-[#50C878] bg-[#50C878]/10 px-2 py-1 rounded">LIVE</div>
            </div>
            <div className="text-sm text-gray-400">Monthly Recurring Revenue</div>
            <div className="mt-2 text-3xl font-bold text-[#50C878]">
              ${metrics.mrr.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {metrics.activeSubscriptions} active @ $299/mo
            </div>
          </div>

          <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg backdrop-blur-sm hover:border-[#50C878]/60 transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">TRIAL</div>
            </div>
            <div className="text-sm text-gray-400">Active Trials</div>
            <div className="mt-2 text-3xl font-bold text-white">{metrics.activeTrials}</div>
            <div className="mt-1 text-xs text-gray-500">30-day free trial</div>
          </div>

          <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg backdrop-blur-sm hover:border-[#50C878]/60 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-[#50C878]" />
              <div className="text-xs text-[#50C878] bg-[#50C878]/10 px-2 py-1 rounded">ORGS</div>
            </div>
            <div className="text-sm text-gray-400">Total Organizations</div>
            <div className="mt-2 text-3xl font-bold text-white">{metrics.totalOrganizations}</div>
            <div className="mt-1 text-xs text-gray-500">Property Management Companies</div>
          </div>

          <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg backdrop-blur-sm hover:border-[#50C878]/60 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-[#50C878]" />
              <div className="text-xs text-[#50C878] bg-[#50C878]/10 px-2 py-1 rounded">UNITS</div>
            </div>
            <div className="text-sm text-gray-400">Total Units Managed</div>
            <div className="mt-2 text-3xl font-bold text-white">{metrics.totalUnits}</div>
            <div className="mt-1 text-xs text-gray-500">Across {metrics.totalProperties} properties</div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border border-[#50C878]/20 bg-[#0A0A0A] p-6 rounded-lg">
            <div className="text-sm text-gray-400">Total Tenants</div>
            <div className="mt-2 text-2xl font-bold text-white">{metrics.totalTenants}</div>
          </div>

          <div className="border border-[#50C878]/20 bg-[#0A0A0A] p-6 rounded-lg">
            <div className="text-sm text-gray-400">Total Properties</div>
            <div className="mt-2 text-2xl font-bold text-white">{metrics.totalProperties}</div>
          </div>

          <div className="border border-yellow-500/30 bg-[#0A0A0A] p-6 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              Past Due Subscriptions
            </div>
            <div className="mt-2 text-2xl font-bold text-yellow-400">{metrics.pastDueSubscriptions}</div>
          </div>
        </div>

        {/* Recent Organizations */}
        <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg mb-8">
          <h2 className="mb-4 text-xl font-bold text-[#50C878] flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Recent PM Company Signups
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-xs uppercase text-gray-500">
                <tr>
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Subscription</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentOrgs.map((org) => (
                  <tr key={org.id} className="text-gray-300 hover:bg-[#0F0F0F] transition-colors">
                    <td className="py-3">{org.name}</td>
                    <td className="py-3">
                      <span className="rounded bg-[#50C878]/20 px-2 py-1 text-xs font-bold text-[#50C878]">
                        {org.subscription_tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          org.subscription_status === 'active'
                            ? 'bg-[#50C878]/20 text-[#50C878]'
                            : org.subscription_status === 'trialing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : org.subscription_status === 'past_due'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {org.subscription_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(org.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HUD Append Ledger - Cryptographic Hash Feed */}
        <div className="border border-[#50C878]/30 bg-[#0A0A0A] p-6 rounded-lg">
          <h2 className="mb-4 text-xl font-bold text-[#50C878] flex items-center gap-2">
            <Hash className="h-6 w-6" />
            HUD Append Ledger - Recent Cryptographic Hashes
            <span className="ml-auto text-xs text-gray-500">Last 20 Entries</span>
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {recentLedger.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-800 bg-[#050505] p-4 rounded-lg hover:border-[#50C878]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-1 text-xs font-bold ${
                        entry.transaction_type === 'CHARGE'
                          ? 'bg-blue-500/20 text-blue-400'
                          : entry.transaction_type === 'PAYMENT'
                          ? 'bg-[#50C878]/20 text-[#50C878]'
                          : entry.transaction_type === 'ADJUSTMENT'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {entry.transaction_type}
                    </span>
                    <span className="text-lg font-bold text-white">
                      ${Math.abs(entry.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-400 mb-3">{entry.description}</div>
                <div className="border-t border-gray-800 pt-3">
                  <div className="text-xs text-gray-600 mb-1">Cryptographic Hash (SHA-256):</div>
                  <div className="font-mono text-xs text-[#50C878] break-all bg-[#0A0A0A] p-2 rounded border border-[#50C878]/20">
                    {entry.cryptographic_hash || 'PENDING_HASH_GENERATION'}
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Org ID: <span className="text-gray-500">{entry.organization_id}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentLedger.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No ledger entries found. Entries will appear as transactions occur.
              </div>
            )}
          </div>
        </div>
      </div>
        )}

        {/* Wolf Hunter Tab */}
        {activeTab === 'hunter' && (
          <WolfHunterTab />
        )}
      </div>
    </div>
  );
}
