// =====================================================
// ISOFLUX API - SOVEREIGN SWITCH (THE SWITCH)
// Legacy wire → Clarity + GENIUS → Truth Ledger hash
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withIsoFluxAuth } from '@/lib/core/with-isoflux-auth';
import type { IsoFluxContext } from '@/lib/core/isoflux-auth';
import {
  SovereignSettlementService,
  LegacyWireSchema,
  type SwitchResult,
} from '@/lib/core/isoflux';

let sovereignService: SovereignSettlementService | null = null;

function getSovereignService(): SovereignSettlementService {
  if (!sovereignService) {
    sovereignService = new SovereignSettlementService();
  }
  return sovereignService;
}

/**
 * POST /api/isoflux/sovereign-switch
 * Ingest legacy wire; output state-assured settlement hash.
 * 1. Clarity Act classification (asset → ISO 20022 tag)
 * 2. GENIUS Act reserve verification (1:1 stablecoin)
 * 3. Truth Ledger anchor (immutable hash)
 */
async function handler(req: NextRequest, context: IsoFluxContext) {
  try {
    const body = await req.json();
    const parsed = LegacyWireSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: parsed.error.errors,
        },
        { status: 400 }
      );
    }

    const wire = parsed.data;
    const result: SwitchResult = await getSovereignService().theSwitch(
      wire,
      context.organizationId
    );

    if (result.status === 'REJECTED') {
      return NextResponse.json(
        {
          success: false,
          status: result.status,
          reason: result.reason,
          timestamp: result.timestamp,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      iso_20022_tag: result.iso_20022_tag,
      truth_ledger_hash: result.truth_ledger_hash,
      transactionId: result.transactionId,
      timestamp: result.timestamp,
      sovereign_assurance: result.sovereign_assurance,
    });
  } catch (error) {
    console.error('[IsoFlux] Sovereign switch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = withIsoFluxAuth(handler, { requiredRole: 'editor' });
