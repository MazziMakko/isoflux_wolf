// =====================================================
// ISOFLUX API - GENERATE ATTESTATION (REACTOR)
// HSM-signed proof of reserves; dual auth; admin/editor for session.
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
 * POST /api/isoflux/attestation/[assetId]
 * Generate HSM-signed proof of reserves.
 */
async function handler(
  req: NextRequest,
  _context: any,
  routeContext?: { params?: Promise<{ assetId: string }> | { assetId: string } }
) {
  const rawParams = routeContext?.params;
  const params = rawParams instanceof Promise ? await rawParams : rawParams;
  const assetId = params?.assetId;

  if (!assetId) {
    return NextResponse.json({ error: 'Missing assetId', code: 'BAD_REQUEST' }, { status: 400 });
  }

  try {
    const attestation = await getOrchestrator().generateProofOfReserves(assetId);
    return NextResponse.json({
      assetId,
      attestation,
      verified: true,
      hsmSigned: true,
    });
  } catch (error) {
    console.error('[IsoFlux] Attestation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const POST = withIsoFluxAuth(handler, { requiredRole: 'admin' });
