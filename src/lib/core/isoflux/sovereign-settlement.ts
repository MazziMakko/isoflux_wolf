// =====================================================
// SOVEREIGN SETTLEMENT — THE SWITCH
// Rulial logic: Legacy → State-Assured Settlement Hash
// Clarity Act (classification) + GENIUS Act (reserve) → Truth Ledger
//
// Settlement Velocity V_s: single Truth Ledger (V_h = 1), minimal L_c.
// Zero-knowledge: unstructured_data never in hash; only structural + regulatory result.
// Regulatory buffer: update clarityRegistry when Clarity Act changes; no redeploy.
// GENIUS guardrail: reject before fiat moves if PoR fails (1:1 reserves).
// =====================================================

import { z } from 'zod';
import * as crypto from 'crypto';
import { TruthLedgerService } from '../truth-ledger';

// ----- 9-Ether Data Model (strict type safety) -----

export const LegacyWireSchema = z.object({
  sender_account: z.string().min(1),
  receiver_address: z.string().min(1),
  asset_ticker: z.string().min(1),
  amount: z.number().positive(),
  unstructured_data: z.string(), // Never hashed — zero-knowledge
});

export type LegacyWire = z.infer<typeof LegacyWireSchema>;

/** ISO 20022 regulatory codes (Clarity Act). */
export type ClarityTag =
  | 'DIGI-COM'   // Commodity / BTC, ETH
  | 'DIGI-PAY'   // Payment stablecoin / USDC
  | 'DIGI-UTL'   // Utility / XRP
  | 'UNCLASSIFIED-ASSET';

export interface SwitchResultSettled {
  status: 'SETTLED';
  iso_20022_tag: ClarityTag;
  truth_ledger_hash: string;
  timestamp: number;
  sovereign_assurance: 'VERIFIED';
  transactionId: string;
}

export interface SwitchResultRejected {
  status: 'REJECTED';
  reason: 'GENIUS_SOLVENCY_FAILURE' | 'UNCLASSIFIED_ASSET';
  timestamp: number;
}

export type SwitchResult = SwitchResultSettled | SwitchResultRejected;

// ----- Default Clarity registry (production: config or Clarity Act DB) -----

const DEFAULT_CLARITY_REGISTRY: Record<string, ClarityTag> = {
  BTC: 'DIGI-COM',
  ETH: 'DIGI-COM',
  USDC: 'DIGI-PAY',
  USDT: 'DIGI-PAY',
  DAI: 'DIGI-PAY',
  XRP: 'DIGI-UTL',
};

/** Minimal delay to simulate oracle latency (ms); in production replace with real PoR (Chainlink etc.). */
const GENIUS_ORACLE_DELAY_MS = 1;

export class SovereignSettlementService {
  private clarityRegistry: Record<string, ClarityTag>;
  private truthLedger: TruthLedgerService;

  constructor(options?: {
    clarityRegistry?: Record<string, ClarityTag>;
  }) {
    this.clarityRegistry = options?.clarityRegistry ?? { ...DEFAULT_CLARITY_REGISTRY };
    this.truthLedger = new TruthLedgerService();
  }

  /**
   * The GENIUS Oracle: 1:1 reserve check.
   * In production: Chainlink PoR or similar. Simulated here for sub-ms path.
   */
  async verifyGeniusCompliance(ticker: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, GENIUS_ORACLE_DELAY_MS));
    // TODO: query Chainlink PoR or internal reserve feed; return false if reserves < 100%
    return true;
  }

  /**
   * The Clarity Tagger: assigns ISO 20022 regulatory code.
   * Regulatory buffer: update registry when Clarity Act changes; no smart contract redeploy.
   */
  classifyAsset(ticker: string): ClarityTag {
    const tag = this.clarityRegistry[ticker.toUpperCase()];
    return tag ?? 'UNCLASSIFIED-ASSET';
  }

  /**
   * Immutable Truth Ledger hash. Only structural + regulatory result — no unstructured_data (zero-knowledge).
   */
  generateSettlementHash(
    wire: LegacyWire,
    regulatoryTag: ClarityTag,
    timestamp: number
  ): string {
    const payload = [
      wire.sender_account,
      wire.receiver_address,
      regulatoryTag,
      wire.asset_ticker,
      String(wire.amount),
      timestamp,
    ].join('|');
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  /**
   * The Switch: Legacy → Ledger.
   * 1. Clarity classification
   * 2. GENIUS reserve verification
   * 3. Settlement hash (then anchor to Truth Ledger)
   */
  async theSwitch(
    wire: LegacyWire,
    organizationId: string
  ): Promise<SwitchResult> {
    const timestamp = Date.now() / 1000;

    // Step 1: Clarity Act classification
    const regTag = this.classifyAsset(wire.asset_ticker);
    if (regTag === 'UNCLASSIFIED-ASSET') {
      return {
        status: 'REJECTED',
        reason: 'UNCLASSIFIED_ASSET',
        timestamp,
      };
    }

    // Step 2: GENIUS Act reserve verification
    const isSolvent = await this.verifyGeniusCompliance(wire.asset_ticker);
    if (!isSolvent) {
      return {
        status: 'REJECTED',
        reason: 'GENIUS_SOLVENCY_FAILURE',
        timestamp,
      };
    }

    // Step 3: Settlement hash (deterministic, no PII/unstructured in hash)
    const truthLedgerHash = this.generateSettlementHash(wire, regTag, timestamp);
    const transactionId = `SW-${truthLedgerHash.slice(0, 16)}`;

    const result: SwitchResultSettled = {
      status: 'SETTLED',
      iso_20022_tag: regTag,
      truth_ledger_hash: truthLedgerHash,
      timestamp,
      sovereign_assurance: 'VERIFIED',
      transactionId,
    };

    // Anchor to Truth Ledger (fire-and-forget; same Rulial discipline as orchestrator)
    this.truthLedger
      .append({
        organizationId,
        transactionId,
        messageType: regTag,
        payloadDigest: truthLedgerHash,
      })
      .catch(() => {});

    return result;
  }
}
