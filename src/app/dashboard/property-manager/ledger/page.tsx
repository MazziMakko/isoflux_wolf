/**
 * =====================================================
 * AUDITOR'S BRIEFCASE - ENHANCED LEDGER EXPORT
 * Enhanced ledger view with PDF/CSV export modal
 * Includes date range, property filtering, and PII controls
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';
import { FileText, Download, Shield, Calendar, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LedgerEntry {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string | null;
  transaction_type: string;
  amount: number;
  description: string;
  accounting_period: string;
  is_period_closed: boolean;
  cryptographic_hash: string;
  previous_hash: string | null;
  created_at: string;
  created_by: string;
}

interface Property {
  id: string;
  name: string;
  address: string;
  hud_property_id: string | null;
}

export default function LedgerPage() {
  const { organization, user } = useSystemState();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Export modal state
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf' as 'pdf' | 'csv',
    propertyId: '',
    startDate: '',
    endDate: '',
    includePII: false,
  });

  useEffect(() => {
    if (organization?.id) {
      fetchLedger();
      fetchProperties();
    }
  }, [organization]);

  useEffect(() => {
    filterEntries();
  }, [entries, startDate, endDate]);

  async function fetchLedger() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('hud_append_ledger')
      .select('*')
      .eq('organization_id', organization!.id)
      .order('created_at', { ascending: false });

    if (data) setEntries(data);
  }

  async function fetchProperties() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('properties')
      .select('id, name, address, hud_property_id')
      .eq('organization_id', organization!.id);

    if (data) setProperties(data);
  }

  function filterEntries() {
    let filtered = [...entries];

    if (startDate) {
      filtered = filtered.filter((e) => new Date(e.created_at) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((e) => new Date(e.created_at) <= new Date(endDate));
    }

    setFilteredEntries(filtered);
  }

  async function handleExport() {
    setExportLoading(true);

    try {
      const token = localStorage.getItem('wolf_shield_token');
      if (!token) {
        alert('Please log in to export ledger data');
        return;
      }

      const response = await fetch('/api/export/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: organization!.id,
          propertyId: exportConfig.propertyId || undefined,
          startDate: exportConfig.startDate,
          endDate: exportConfig.endDate,
          format: exportConfig.format,
          includePII: exportConfig.includePII,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }

      // Download file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wolf-shield-ledger-${Date.now()}.${exportConfig.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowExportModal(false);
      alert(`✓ Ledger exported successfully as ${exportConfig.format.toUpperCase()}`);
    } catch (error: any) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-emerald-400">📊 Immutable Ledger</h1>
            <p className="mt-2 text-slate-300">{entries.length} Total Entries</p>
          </div>
          <button
            onClick={() => {
              setExportConfig({
                ...exportConfig,
                startDate: startDate || '',
                endDate: endDate || new Date().toISOString().split('T')[0],
              });
              setShowExportModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
          >
            <FileText className="w-5 h-5" />
            Auditor's Briefcase
          </button>
        </div>

        {/* Date Filter */}
        <Card className="mb-6 border-emerald-500/20 bg-slate-800/50 p-6 backdrop-blur">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full rounded bg-slate-700 px-4 py-2 font-bold text-white transition hover:bg-slate-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-400">
            Showing {filteredEntries.length} of {entries.length} entries
          </div>
        </Card>

        {/* Ledger Table */}
        <Card className="border-emerald-500/20 bg-slate-800/50 backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="border-b-2 border-emerald-500 bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-slate-400">Timestamp</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-slate-400">Type</th>
                  <th className="px-4 py-3 text-right font-mono text-xs uppercase text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-slate-400">Description</th>
                  <th className="px-4 py-3 text-center font-mono text-xs uppercase text-slate-400">Period</th>
                  <th className="px-4 py-3 text-left font-mono text-xs uppercase text-slate-400">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-1 text-xs font-bold ${
                        entry.transaction_type === 'PAYMENT' || entry.transaction_type === 'CHARGE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : entry.transaction_type === 'ADJUSTMENT'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">
                      ${entry.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{entry.description.substring(0, 80)}{entry.description.length > 80 ? '...' : ''}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded px-2 py-1 text-xs ${
                        entry.is_period_closed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {entry.accounting_period}
                        {entry.is_period_closed && ' 🔒'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      0x{entry.cryptographic_hash.substring(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEntries.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                No ledger entries found for the selected date range
              </div>
            )}
          </div>
        </Card>

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl"
              >
                <Card className="border-emerald-500/20 bg-slate-800 p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <Shield className="w-8 h-8 text-emerald-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Auditor's Briefcase</h2>
                      <p className="text-sm text-slate-400">Generate HUD-compliant ledger export</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Format Selection */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-300">Export Format</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setExportConfig({ ...exportConfig, format: 'pdf' })}
                          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition ${
                            exportConfig.format === 'pdf'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-slate-600 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                          PDF Report
                        </button>
                        <button
                          onClick={() => setExportConfig({ ...exportConfig, format: 'csv' })}
                          className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition ${
                            exportConfig.format === 'csv'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                              : 'border-slate-600 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <Download className="w-5 h-5" />
                          CSV Data
                        </button>
                      </div>
                    </div>

                    {/* Property Filter */}
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-300">
                        Property (Optional)
                      </label>
                      <select
                        value={exportConfig.propertyId}
                        onChange={(e) => setExportConfig({ ...exportConfig, propertyId: e.target.value })}
                        className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value="">All Properties</option>
                        {properties.map((property) => (
                          <option key={property.id} value={property.id}>
                            {property.name} {property.hud_property_id ? `(HUD: ${property.hud_property_id})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-300">Start Date *</label>
                        <input
                          type="date"
                          required
                          value={exportConfig.startDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                          className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-300">End Date *</label>
                        <input
                          type="date"
                          required
                          value={exportConfig.endDate}
                          onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                          className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* PII Toggle (Super Admin only) */}
                    {user?.role === 'super_admin' && (
                      <div className="rounded-lg border-2 border-yellow-500/30 bg-yellow-500/10 p-4">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={exportConfig.includePII}
                            onChange={(e) => setExportConfig({ ...exportConfig, includePII: e.target.checked })}
                            className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-2 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="font-semibold text-yellow-400">Include PII Data</span>
                            <p className="text-xs text-slate-400">
                              Super Admin only - Includes tenant SSNs and sensitive information
                            </p>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Security Badge */}
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-1" />
                        <div className="text-sm">
                          <p className="font-semibold text-emerald-400">Cryptographically Verified</p>
                          <p className="text-slate-300">
                            All exports include SHA-256 hashes for mathematical proof of data integrity. Perfect for HUD audits.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleExport}
                        disabled={exportLoading || !exportConfig.startDate || !exportConfig.endDate}
                        className="flex-1 rounded-lg bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {exportLoading ? 'Generating...' : `Export as ${exportConfig.format.toUpperCase()}`}
                      </button>
                      <button
                        onClick={() => setShowExportModal(false)}
                        disabled={exportLoading}
                        className="flex-1 rounded-lg border-2 border-slate-600 px-6 py-3 font-bold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
