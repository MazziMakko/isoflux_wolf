/**
 * =====================================================
 * REALTIME LEDGER MONITOR
 * Live updates when ledger entries are added
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { LedgerEntry, LedgerUpdateEvent } from '@/lib/wolf-shield/types';

interface RealtimeLedgerProps {
  organizationId: string;
  onUpdate?: (event: LedgerUpdateEvent) => void;
  children?: (data: {
    latestEntry: LedgerEntry | null;
    totalTransactions: number;
    isConnected: boolean;
  }) => React.ReactNode;
}

export function RealtimeLedgerMonitor({
  organizationId,
  onUpdate,
  children,
}: RealtimeLedgerProps) {
  const [latestEntry, setLatestEntry] = useState<LedgerEntry | null>(null);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    // Fetch initial transaction count
    async function fetchInitialCount() {
      const { count } = await supabase
        .from('hud_append_ledger')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      setTotalTransactions(count || 0);
    }

    fetchInitialCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`ledger:${organizationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'hud_append_ledger',
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('🔔 Ledger update received:', payload);

          const newEntry = payload.new as LedgerEntry;
          setLatestEntry(newEntry);
          setTotalTransactions((prev) => prev + 1);

          // Trigger callback if provided
          if (onUpdate) {
            const event: LedgerUpdateEvent = {
              type: 'INSERT',
              table: 'hud_append_ledger',
              record: newEntry,
              organizationId,
            };
            onUpdate(event);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, onUpdate]);

  if (children) {
    return <>{children({ latestEntry, totalTransactions, isConnected })}</>;
  }

  return null;
}

/**
 * =====================================================
 * LIVE TRANSACTION COUNTER
 * Real-time counter that updates when ledger grows
 * =====================================================
 */

interface LiveCounterProps {
  organizationId: string;
  className?: string;
}

export function LiveTransactionCounter({ organizationId, className }: LiveCounterProps) {
  return (
    <RealtimeLedgerMonitor organizationId={organizationId}>
      {({ totalTransactions, isConnected }) => (
        <div className={className}>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'animate-pulse bg-emerald-500' : 'bg-slate-500'
              }`}
            />
            <span className="text-sm text-slate-400">Live API Uptime</span>
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-400">
            {totalTransactions.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500">Total Transactions</div>
        </div>
      )}
    </RealtimeLedgerMonitor>
  );
}

/**
 * =====================================================
 * LIVE ACTIVITY FEED
 * Shows latest ledger entries in real-time
 * =====================================================
 */

interface LiveActivityFeedProps {
  organizationId: string;
  maxItems?: number;
  className?: string;
}

export function LiveActivityFeed({
  organizationId,
  maxItems = 5,
  className,
}: LiveActivityFeedProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

  // Fetch initial entries
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    async function fetchInitialEntries() {
      const { data } = await supabase
        .from('hud_append_ledger')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(maxItems);

      if (data) {
        setEntries(data as LedgerEntry[]);
      }
    }

    fetchInitialEntries();
  }, [organizationId, maxItems]);

  const handleUpdate = (event: LedgerUpdateEvent) => {
    // Add new entry to the top of the list
    setEntries((prev) => [event.record, ...prev.slice(0, maxItems - 1)]);
  };

  return (
    <div className={className}>
      <RealtimeLedgerMonitor organizationId={organizationId} onUpdate={handleUpdate} />

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded bg-slate-900/50 p-4 text-center text-sm text-slate-400">
            No transactions yet
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded border border-slate-700 bg-slate-900/50 p-3 transition-all hover:border-emerald-500/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">
                  {entry.transactionType} - {entry.description.substring(0, 30)}
                  {entry.description.length > 30 ? '...' : ''}
                </span>
                <span
                  className={`text-sm font-bold ${
                    entry.amount > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {entry.amount > 0 ? `$${entry.amount.toLocaleString()}` : '-'}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {new Date(entry.createdAt).toLocaleTimeString()}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  {entry.cryptographicHash.substring(0, 8)}...
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * =====================================================
 * COMPLIANCE HEALTH MONITOR
 * Live updates to compliance metrics
 * =====================================================
 */

interface ComplianceHealthMonitorProps {
  organizationId: string;
  className?: string;
}

export function ComplianceHealthMonitor({
  organizationId,
  className,
}: ComplianceHealthMonitorProps) {
  const [healthScore, setHealthScore] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleUpdate = async () => {
    // Recalculate compliance health when ledger updates
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );

    const { data } = await supabase
      .from('organizations')
      .select('compliance_health')
      .eq('id', organizationId)
      .single();

    if (data?.compliance_health) {
      setHealthScore(parseFloat(data.compliance_health));
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    handleUpdate();
  }, [organizationId]);

  return (
    <div className={className}>
      <RealtimeLedgerMonitor organizationId={organizationId} onUpdate={handleUpdate} />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-300">Compliance Health</span>
          <span className="text-sm font-bold text-emerald-400">{healthScore.toFixed(1)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${healthScore}%` }}
          />
        </div>
        {lastUpdated && (
          <p className="mt-2 text-xs text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
