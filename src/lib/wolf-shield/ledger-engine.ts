/**
 * =====================================================
 * THE WOLF SHIELD: LEDGER ENGINE
 * Cryptographic Append-Only Ledger with SHA-256 Chaining
 * =====================================================
 */

import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// TYPES
// =====================================================

export type TransactionType =
  | 'CHARGE'
  | 'PAYMENT'
  | 'ADJUSTMENT'
  | 'FEE'
  | 'RECERTIFICATION_LOG'
  | 'MAINTENANCE_REQUEST'
  | 'MAINTENANCE_APPROVAL';

export interface LedgerEntry {
  id?: string;
  organizationId: string;
  propertyId: string;
  unitId: string;
  tenantId?: string | null;
  transactionType: TransactionType;
  amount: number;
  description: string;
  accountingPeriod: string; // YYYY-MM
  isPeriodClosed?: boolean;
  cryptographicHash?: string;
  previousHash?: string | null;
  createdAt?: Date;
  createdBy: string;
}

export interface LedgerVerificationResult {
  isValid: boolean;
  totalEntries: number;
  brokenChainAt?: number;
  invalidHashes: string[];
  message: string;
}

// =====================================================
// WOLF SHIELD LEDGER ENGINE
// =====================================================

export class WolfShieldLedger {
  private supabase: ReturnType<typeof createClient>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Append a new entry to the ledger
   * The database trigger will automatically generate the cryptographic hash
   */
  async appendEntry(entry: LedgerEntry): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate accounting period format (YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(entry.accountingPeriod)) {
        return {
          success: false,
          error: 'Invalid accounting period format. Must be YYYY-MM',
        };
      }

      // Check if period is closed
      const { data: closedCheck } = await this.supabase
        .from('hud_append_ledger')
        .select('is_period_closed')
        .eq('organization_id', entry.organizationId)
        .eq('accounting_period', entry.accountingPeriod)
        .eq('is_period_closed', true)
        .limit(1);

      if (closedCheck && closedCheck.length > 0) {
        return {
          success: false,
          error: `Accounting period ${entry.accountingPeriod} is closed. Contact Super Admin to reopen.`,
        };
      }

      // Insert entry (triggers will handle hash generation)
      const { data, error } = await this.supabase
        .from('hud_append_ledger')
        .insert({
          organization_id: entry.organizationId,
          property_id: entry.propertyId,
          unit_id: entry.unitId,
          tenant_id: entry.tenantId || null,
          transaction_type: entry.transactionType,
          amount: entry.amount,
          description: entry.description,
          accounting_period: entry.accountingPeriod,
          created_by: entry.createdBy,
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify the integrity of the ledger chain
   * Ensures no tampering by validating all hashes
   */
  async verifyLedgerIntegrity(organizationId: string): Promise<LedgerVerificationResult> {
    try {
      // Fetch all ledger entries for organization, ordered by creation
      const { data: entries, error } = await this.supabase
        .from('hud_append_ledger')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });

      if (error) {
        return {
          isValid: false,
          totalEntries: 0,
          message: `Error fetching ledger: ${error.message}`,
          invalidHashes: [],
        };
      }

      if (!entries || entries.length === 0) {
        return {
          isValid: true,
          totalEntries: 0,
          message: 'No ledger entries found for this organization',
          invalidHashes: [],
        };
      }

      const invalidHashes: string[] = [];
      let brokenChainAt: number | undefined;

      // Verify each entry's hash
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const previousHash = i === 0 ? null : entries[i - 1].cryptographic_hash;

        // Reconstruct the hash
        const calculatedHash = this.calculateHash(entry, previousHash);

        if (calculatedHash !== entry.cryptographic_hash) {
          invalidHashes.push(entry.id);
          if (brokenChainAt === undefined) {
            brokenChainAt = i;
          }
        }

        // Verify chain continuity
        if (entry.previous_hash !== previousHash) {
          invalidHashes.push(entry.id);
          if (brokenChainAt === undefined) {
            brokenChainAt = i;
          }
        }
      }

      const isValid = invalidHashes.length === 0;

      return {
        isValid,
        totalEntries: entries.length,
        brokenChainAt,
        invalidHashes,
        message: isValid
          ? `Ledger integrity verified. ${entries.length} entries validated.`
          : `Ledger integrity compromised. ${invalidHashes.length} invalid hashes detected.`,
      };
    } catch (error) {
      return {
        isValid: false,
        totalEntries: 0,
        message: error instanceof Error ? error.message : 'Unknown error',
        invalidHashes: [],
      };
    }
  }

  /**
   * Calculate SHA-256 hash for a ledger entry
   * Hash input: previousHash + currentRowData
   */
  private calculateHash(entry: any, previousHash: string | null): string {
    const hashInput =
      (previousHash || 'GENESIS') +
      entry.organization_id +
      entry.property_id +
      entry.unit_id +
      (entry.tenant_id || '') +
      entry.transaction_type +
      entry.amount.toString() +
      entry.description +
      entry.accounting_period +
      entry.created_by +
      new Date(entry.created_at).getTime().toString();

    return createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Close an accounting period (prevents new entries)
   * Only Super Admins should be able to do this
   */
  async closePeriod(
    organizationId: string,
    accountingPeriod: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert a special "PERIOD_CLOSE" marker
      const { data, error } = await this.supabase
        .from('hud_append_ledger')
        .insert({
          organization_id: organizationId,
          property_id: '00000000-0000-0000-0000-000000000000', // Special marker
          unit_id: '00000000-0000-0000-0000-000000000000', // Special marker
          transaction_type: 'ADJUSTMENT',
          amount: 0,
          description: `PERIOD CLOSED: ${accountingPeriod}`,
          accounting_period: accountingPeriod,
          is_period_closed: true,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get ledger entries for a specific period
   */
  async getEntriesForPeriod(
    organizationId: string,
    accountingPeriod: string
  ): Promise<LedgerEntry[]> {
    const { data, error } = await this.supabase
      .from('hud_append_ledger')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('accounting_period', accountingPeriod)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching ledger entries: ${error.message}`);
    }

    return data as LedgerEntry[];
  }

  /**
   * Get compliance health for an organization
   * Returns percentage of closed vs open periods, recent activity, etc.
   */
  async getComplianceHealth(organizationId: string): Promise<{
    healthScore: number;
    totalEntries: number;
    closedPeriods: number;
    openPeriods: number;
    lastEntryDate?: Date;
  }> {
    try {
      // Get total entries
      const { count: totalEntries } = await this.supabase
        .from('hud_append_ledger')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // Get distinct periods
      const { data: periods } = await this.supabase
        .from('hud_append_ledger')
        .select('accounting_period, is_period_closed')
        .eq('organization_id', organizationId);

      if (!periods) {
        return {
          healthScore: 0,
          totalEntries: 0,
          closedPeriods: 0,
          openPeriods: 0,
        };
      }

      // Count unique periods
      const uniquePeriods = new Set(periods.map((p) => p.accounting_period));
      const closedPeriods = new Set(
        periods.filter((p) => p.is_period_closed).map((p) => p.accounting_period)
      );

      // Get last entry date
      const { data: lastEntry } = await this.supabase
        .from('hud_append_ledger')
        .select('created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(1);

      // Calculate health score (simple formula: can be enhanced)
      // 100% if all periods are properly closed, active entries exist
      const healthScore = Math.min(
        100,
        ((closedPeriods.size / Math.max(uniquePeriods.size - 1, 1)) * 70 +
          (totalEntries || 0 > 0 ? 30 : 0))
      );

      return {
        healthScore: Math.round(healthScore),
        totalEntries: totalEntries || 0,
        closedPeriods: closedPeriods.size,
        openPeriods: uniquePeriods.size - closedPeriods.size,
        lastEntryDate: lastEntry?.[0]?.created_at ? new Date(lastEntry[0].created_at) : undefined,
      };
    } catch (error) {
      console.error('Error calculating compliance health:', error);
      return {
        healthScore: 0,
        totalEntries: 0,
        closedPeriods: 0,
        openPeriods: 0,
      };
    }
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get current accounting period (YYYY-MM)
 */
export function getCurrentAccountingPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Validate accounting period format
 */
export function isValidAccountingPeriod(period: string): boolean {
  return /^\d{4}-\d{2}$/.test(period);
}

/**
 * Export default instance (requires env vars)
 */
export function createWolfShieldLedger(): WolfShieldLedger {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration for Wolf Shield Ledger');
  }

  return new WolfShieldLedger(supabaseUrl, supabaseKey);
}
