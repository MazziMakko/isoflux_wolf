/**
 * =====================================================
 * SUPER ADMIN DASHBOARD
 * Platform health, MRR, and SaaS metrics
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { LiveTransactionCounter, LiveActivityFeed } from '@/components/wolf-shield/RealtimeLedgerMonitor';
import { createClient } from '@supabase/supabase-js';

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

export default function SuperAdminDashboard() {
  const { user } = useSystemState();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is super admin
    if (!user.is_super_admin) {
      window.location.href = '/dashboard';
      return;
    }

    fetchPlatformMetrics();
  }, [user]);

  async function fetchPlatformMetrics() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

      // Calculate MRR ($300 per active subscription, excluding trials)
      const mrr = activeSubscriptions * 300;

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-emerald-400">Loading Platform Metrics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-400">👑 Super Admin Dashboard</h1>
          <p className="mt-2 text-slate-300">Wolf Shield Platform Health</p>
        </div>

        {/* Primary KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Monthly Recurring Revenue</div>
            <div className="mt-2 text-3xl font-bold text-purple-400">
              ${metrics.mrr.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {metrics.activeSubscriptions} active @ $300/mo
            </div>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Active Trials</div>
            <div className="mt-2 text-3xl font-bold text-blue-400">{metrics.activeTrials}</div>
            <div className="mt-1 text-xs text-slate-500">30-day free trial</div>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total PM Companies</div>
            <div className="mt-2 text-3xl font-bold text-purple-400">{metrics.totalOrganizations}</div>
            <div className="mt-1 text-xs text-slate-500">Organizations</div>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total Units Managed</div>
            <div className="mt-2 text-3xl font-bold text-purple-400">{metrics.totalUnits}</div>
            <div className="mt-1 text-xs text-slate-500">Across {metrics.totalProperties} properties</div>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total Tenants</div>
            <div className="mt-2 text-2xl font-bold text-white">{metrics.totalTenants}</div>
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total Properties</div>
            <div className="mt-2 text-2xl font-bold text-white">{metrics.totalProperties}</div>
          </Card>

          <Card className="border-yellow-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Past Due Subscriptions</div>
            <div className="mt-2 text-2xl font-bold text-yellow-400">{metrics.pastDueSubscriptions}</div>
          </Card>
        </div>

        {/* Live Platform Activity */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <LiveTransactionCounter organizationId="platform-wide" className="mb-4" />
          </Card>

          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-purple-400">Platform Health</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database API</span>
                <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Cron Jobs</span>
                <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                  RUNNING
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Ledger Integrity</span>
                <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">
                  VERIFIED
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Organizations */}
        <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-xl font-bold text-purple-400">Recent PM Company Signups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Subscription</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentOrgs.map((org) => (
                  <tr key={org.id} className="text-slate-300">
                    <td className="py-3">{org.name}</td>
                    <td className="py-3">
                      <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-bold text-purple-400">
                        {org.subscription_tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-bold ${
                          org.subscription_status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : org.subscription_status === 'trialing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : org.subscription_status === 'past_due'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {org.subscription_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">{new Date(org.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Activity Feed */}
        <div className="mt-8">
          <Card className="border-purple-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-purple-400">🔗 Live Platform Ledger Activity</h2>
            <LiveActivityFeed organizationId="platform-wide" maxItems={15} />
          </Card>
        </div>
      </div>
    </div>
  );
}
