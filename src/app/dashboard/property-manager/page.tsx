/**
 * =====================================================
 * PM DASHBOARD: MAIN OVERVIEW
 * High-level metrics with RecertificationWidget
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { RecertificationWidget } from '@/components/pm/RecertificationWidget';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  complianceHealth: number;
  pendingMaintenance: number;
  overdueRecertifications: number;
}

export default function PropertyManagerDashboard() {
  const { user, organization, complianceHealth, loading } = useSystemState();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    occupancyRate: 0,
    complianceHealth: 0,
    pendingMaintenance: 0,
    overdueRecertifications: 0,
  });

  useEffect(() => {
    if (!organization?.id) return;

    async function fetchMetrics() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization!.id);

      // Units count and occupancy
      const { data: units } = await supabase
        .from('units')
        .select('status')
        .in('property_id', `(SELECT id FROM properties WHERE organization_id = '${organization!.id}')`);

      const totalUnits = units?.length || 0;
      const occupiedUnits = units?.filter((u) => u.status === 'OCCUPIED').length || 0;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

      // Pending maintenance
      const { count: maintenanceCount } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization!.id)
        .in('status', ['OPEN', 'ASSIGNED', 'IN_PROGRESS']);

      // Overdue recertifications
      const { count: overdueCount } = await supabase
        .from('compliance_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organization!.id)
        .eq('alert_type', 'OVERDUE')
        .eq('is_resolved', false);

      setMetrics({
        totalProperties: propertiesCount || 0,
        totalUnits,
        occupiedUnits,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
        complianceHealth: complianceHealth,
        pendingMaintenance: maintenanceCount || 0,
        overdueRecertifications: overdueCount || 0,
      });
    }

    fetchMetrics();
  }, [organization, complianceHealth]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-emerald-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-400">🏘️ Property Manager Dashboard</h1>
          <p className="mt-2 text-slate-300">
            {organization?.name} | {user.fullName || user.email}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total Properties</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">{metrics.totalProperties}</div>
            <div className="mt-1 text-xs text-slate-500">Active portfolio</div>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Total Units</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">{metrics.totalUnits}</div>
            <div className="mt-1 text-xs text-slate-500">{metrics.occupiedUnits} occupied</div>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Occupancy Rate</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">{metrics.occupancyRate}%</div>
            <div className="mt-1 text-xs text-slate-500">Portfolio average</div>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Compliance Health</div>
            <div className="mt-2 text-3xl font-bold text-emerald-400">{metrics.complianceHealth}%</div>
            <div className="mt-1 text-xs text-slate-500">HUD Audit Ready</div>
          </Card>
        </div>

        {/* Action Items & Recertification */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-emerald-400">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/property-manager/portfolio"
                className="block w-full rounded bg-emerald-500 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
              >
                📁 Manage Portfolio
              </Link>
              <Link
                href="/dashboard/property-manager/maintenance"
                className="block w-full rounded bg-blue-500 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-600"
              >
                🔧 Maintenance Board
              </Link>
              <Link
                href="/dashboard/property-manager/ledger"
                className="block w-full rounded bg-purple-500 px-4 py-3 text-center font-bold text-white transition hover:bg-purple-600"
              >
                📊 View Immutable Ledger
              </Link>
            </div>
          </Card>

          {/* Recertification Widget */}
          {organization?.id && <RecertificationWidget organizationId={organization.id} />}
        </div>

        {/* Alerts Summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-yellow-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="mb-2 text-3xl">⚠️</div>
            <div className="text-sm text-slate-400">Pending Maintenance</div>
            <div className="mt-2 text-2xl font-bold text-yellow-400">{metrics.pendingMaintenance}</div>
            <Link
              href="/dashboard/property-manager/maintenance"
              className="mt-3 inline-block text-sm text-yellow-400 hover:underline"
            >
              View All →
            </Link>
          </Card>

          <Card className="border-red-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="mb-2 text-3xl">🚨</div>
            <div className="text-sm text-slate-400">Overdue Recertifications</div>
            <div className="mt-2 text-2xl font-bold text-red-400">{metrics.overdueRecertifications}</div>
            <div className="mt-3 text-sm text-red-400">Action Required</div>
          </Card>

          <Card className="border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="mb-2 text-3xl">✓</div>
            <div className="text-sm text-slate-400">Ledger Status</div>
            <div className="mt-2 text-2xl font-bold text-emerald-400">Protected</div>
            <div className="mt-3 text-sm text-slate-400">Cryptographically Sealed</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
