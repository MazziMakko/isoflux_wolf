/**
 * =====================================================
 * TENANT DASHBOARD
 * Restricted view showing lease info and payment history
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

interface TenantData {
  lease: {
    monthly_rent: number;
    start_date: string;
    end_date: string;
    recertification_status: string;
    next_recertification_due: string | null;
  } | null;
  unit: {
    unit_number: string;
    property_id: string;
  } | null;
  payments: Array<{
    id: string;
    amount: number;
    description: string;
    created_at: string;
    transaction_type: string;
  }>;
}

export default function TenantDashboard() {
  const { user, loading } = useSystemState();
  const [tenantData, setTenantData] = useState<TenantData>({
    lease: null,
    unit: null,
    payments: [],
  });

  useEffect(() => {
    if (user.id) {
      fetchTenantData();
    }
  }, [user]);

  async function fetchTenantData() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch tenant's active lease
    const { data: leaseData } = await supabase
      .from('leases')
      .select('*, units(unit_number, property_id)')
      .eq('tenant_id', user.id)
      .eq('status', 'ACTIVE')
      .single();

    if (leaseData) {
      setTenantData((prev) => ({
        ...prev,
        lease: leaseData,
        unit: leaseData.units,
      }));

      // Fetch payment history from ledger
      const { data: payments } = await supabase
        .from('hud_append_ledger')
        .select('*')
        .eq('tenant_id', user.id)
        .in('transaction_type', ['PAYMENT', 'CHARGE'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (payments) {
        setTenantData((prev) => ({ ...prev, payments }));
      }
    }
  }

  const getRecertStatusColor = (status: string) => {
    if (status === 'OVERDUE') return 'bg-red-500/20 text-red-400';
    if (status === 'DUE_30') return 'bg-red-500/20 text-red-400';
    if (status === 'DUE_60') return 'bg-yellow-500/20 text-yellow-400';
    if (status === 'DUE_90') return 'bg-blue-500/20 text-blue-400';
    return 'bg-emerald-500/20 text-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-xl text-emerald-400">Loading...</div>
      </div>
    );
  }

  if (!tenantData.lease) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-slate-700 bg-slate-800/50 p-12 text-center backdrop-blur">
            <h2 className="mb-4 text-2xl font-bold text-white">No Active Lease Found</h2>
            <p className="text-slate-400">Please contact your property manager.</p>
          </Card>
        </div>
      </div>
    );
  }

  const daysUntilLeaseEnd = Math.ceil(
    (new Date(tenantData.lease.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold text-blue-400">🏠 Tenant Portal</h1>

        {/* Recertification Alert */}
        {(tenantData.lease.recertification_status === 'OVERDUE' ||
          tenantData.lease.recertification_status === 'DUE_30') && (
          <Card className="mb-6 border-red-500/50 bg-red-900/20 p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Recertification Required</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Your annual income recertification is {tenantData.lease.recertification_status === 'OVERDUE' ? 'overdue' : 'due soon'}.
                  Please upload required documents to avoid service interruption.
                </p>
                <Link
                  href="/dashboard/tenant/documents"
                  className="mt-3 inline-block rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
                >
                  Upload Documents Now
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Monthly Rent</div>
            <div className="mt-2 text-3xl font-bold text-blue-400">
              ${tenantData.lease.monthly_rent.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-500">Due: 1st of each month</div>
          </Card>

          <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Unit Number</div>
            <div className="mt-2 text-3xl font-bold text-blue-400">
              {tenantData.unit?.unit_number}
            </div>
            <div className="mt-1 text-xs text-slate-500">Your unit</div>
          </Card>

          <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <div className="text-sm text-slate-400">Lease Expires</div>
            <div className="mt-2 text-2xl font-bold text-blue-400">
              {new Date(tenantData.lease.end_date).toLocaleDateString()}
            </div>
            <div className="mt-1 text-xs text-slate-500">{daysUntilLeaseEnd} days remaining</div>
          </Card>
        </div>

        {/* Quick Actions & Recertification */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-blue-400">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/tenant/documents"
                className="block w-full rounded bg-blue-500 px-4 py-3 text-center font-bold text-white transition hover:bg-blue-600"
              >
                📁 Document Vault
              </Link>
              <Link
                href="/dashboard/tenant/maintenance"
                className="block w-full rounded bg-emerald-500 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
              >
                🔧 Submit Maintenance Request
              </Link>
            </div>
          </Card>

          <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
            <h2 className="mb-4 text-xl font-bold text-blue-400">Recertification Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Status</span>
                <span className={`rounded px-3 py-1 text-xs font-bold ${getRecertStatusColor(tenantData.lease.recertification_status)}`}>
                  {tenantData.lease.recertification_status.replace('_', ' ')}
                </span>
              </div>
              {tenantData.lease.next_recertification_due && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Next Due Date</span>
                  <span className="text-sm font-bold text-slate-300">
                    {new Date(tenantData.lease.next_recertification_due).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment History */}
        <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-xl font-bold text-blue-400">💳 Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {tenantData.payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No payment history yet
                    </td>
                  </tr>
                ) : (
                  tenantData.payments.map((payment) => (
                    <tr key={payment.id} className="text-slate-300">
                      <td className="py-3">{new Date(payment.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`rounded px-2 py-1 text-xs font-bold ${
                          payment.transaction_type === 'PAYMENT'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {payment.transaction_type}
                        </span>
                      </td>
                      <td className="py-3">{payment.description}</td>
                      <td className="py-3 text-right font-mono text-emerald-400">
                        ${payment.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
