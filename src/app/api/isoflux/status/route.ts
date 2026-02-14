// =====================================================
// ISOFLUX API - SYSTEM STATUS (REACTOR)
// Health check; dual auth (session or X-API-Key).
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
 * GET /api/isoflux/status
 * Get system status and health.
 */
async function handler(req: NextRequest) {
  try {
    const status = await getOrchestrator().getSystemStatus();
    return NextResponse.json({
      ...status,
      uptime: process.uptime(),
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[IsoFlux] Status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export const GET = withIsoFluxAuth(handler, { requiredRole: 'viewer' });
