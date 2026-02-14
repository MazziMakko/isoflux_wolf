// =====================================================
// ISOFLUX API - VERIFY RESERVES (REACTOR)
// Check asset-reserve entanglement ratio; dual auth.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withIsoFluxAuth } from '@/lib/core/with-isoflux-auth';
import { IsoFluxOrchestrator } from '@/lib/core/isoflux';

let orchestrator: IsoFluxOrchestrator | null = null;

function getOrchestrator(): IsoFluxOrchestrator {
  if (!orchestrator) {
    orchestrator = new IsoFluxOrchestrator();
    orchestrator.initialize().catch(console.error);
  }
  return orchestrator;
}

/**
 * GET /api/isoflux/reserves/[assetId]
 * Verify reserve ratio for asset.
 */
async function handler(
  req: NextRequest,
  _context: any,
  routeContext?: { params?: Promise<{ assetId: string }> | { assetId: string } }
) {
  const params = routeContext?.params
    ? await (typeof (routeContext.params as Promise<{ assetId: string }>)?.then === 'function'
        ? (routeContext.params as Promise<{ assetId: string }>)
        : Promise.resolve(routeContext.params as { assetId: string }))
    : { assetId: '' };
  const assetId = params?.assetId;

  if (!assetId) {
    return NextResponse.json({ error: 'Missing assetId', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    const result = await getOrchestrator().verifyReserveRatio(assetId);
    return NextResponse.json({
      assetId,
      valid: result.valid,
      ratio: result.ratio,
      locked: result.locked,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[IsoFlux] Reserve verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const GET = withIsoFluxAuth(handler);
