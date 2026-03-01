'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/AnimatedCard';

interface AuditorBriefcaseModalProps {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
}

export function AuditorBriefcaseModal({ propertyId, propertyName, onClose }: AuditorBriefcaseModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams({
        propertyId,
        startDate,
        endDate,
        format,
      });

      // Trigger download
      const response = await fetch(`/api/reports/auditor-briefcase?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate report');
      }

      // Convert response to blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Auditor_Briefcase_${propertyName.replace(/\s+/g, '_')}_${startDate}_${endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose(); // Close modal on success
    } catch (error) {
      console.error('Export error:', error);
      alert('Error generating report: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-2 border-emerald-500/50 bg-slate-900 p-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-400">The Auditor's Briefcase</h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-emerald-600">HUD Compliance & Cryptographic Ledger</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <p className="mb-6 text-sm text-slate-300">
          Generate a mathematically verifiable ledger export for <strong>{propertyName}</strong>.
          This report includes SHA-256 transaction hashes for every entry.
        </p>

        <form onSubmit={handleExport} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Export Format</label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 bg-slate-800 px-4 py-3 text-white transition hover:border-emerald-500">
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={() => setFormat('pdf')}
                  className="accent-emerald-500"
                />
                PDF (Official)
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-700 bg-slate-800 px-4 py-3 text-white transition hover:border-emerald-500">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="accent-emerald-500"
                />
                CSV (Raw Data)
              </label>
            </div>
          </div>

          <div className="border-l-2 border-yellow-500/50 bg-yellow-500/10 p-4 text-xs text-yellow-200">
            <strong>Security Note:</strong> Tenant PII (Names, Emails) will be redacted unless you are a Super Admin.
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {isLoading ? 'Encrypting & Compiling...' : 'Generate Secure Report'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-4 font-bold text-slate-300 transition hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
