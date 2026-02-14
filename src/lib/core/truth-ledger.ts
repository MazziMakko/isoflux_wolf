// =====================================================
// TRUTH LEDGER - Append-only, digest-chained records
// Disclosed in ToS: processed messages may be recorded
// for regulatory and dispute resolution.
// =====================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import * as crypto from 'crypto';

type TruthLedgerRow = Database['public']['Tables']['truth_ledger']['Insert'];

export class TruthLedgerService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  /**
   * Append a record to the Truth Ledger (hash chain).
   * Call after successful process; do not block main response.
   */
  async append(params: {
    organizationId: string;
    transactionId: string;
    messageType: string;
    payloadDigest: string;
  }): Promise<void> {
    try {
      const prevHash = await this.getLastLedgerHash(params.organizationId);
      const content = [
        prevHash ?? 'genesis',
        params.transactionId,
        params.messageType,
        params.payloadDigest,
        new Date().toISOString(),
      ].join('|');
      const ledgerHash = crypto.createHash('sha256').update(content).digest('hex');

      const row: TruthLedgerRow = {
        organization_id: params.organizationId,
        transaction_id: params.transactionId,
        message_type: params.messageType,
        payload_digest: params.payloadDigest,
        prev_ledger_hash: prevHash,
        ledger_hash: ledgerHash,
        signed_at: new Date().toISOString(),
        signature: null, // Optional: HSM sign ledger_hash for non-repudiation
      };

      const { error } = await this.supabase.from('truth_ledger').insert(row);
      if (error) console.error('[TruthLedger] append error:', error.message);
    } catch (e) {
      console.error('[TruthLedger] append failed:', e);
    }
  }

  private async getLastLedgerHash(organizationId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('truth_ledger')
      .select('ledger_hash')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data?.ledger_hash ?? null;
  }

  /**
   * Compute payload digest for a message (deterministic, no PII in digest).
   */
  static digestPayload(message: unknown): string {
    const normalized =
      typeof message === 'string' ? message : JSON.stringify(message, Object.keys((message as object) ?? {}).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex');
  }
}
