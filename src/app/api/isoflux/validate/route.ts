// =====================================================
// ISOFLUX API - VALIDATE MESSAGE (REACTOR)
// Standalone validation; dual auth (session or X-API-Key).
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withIsoFluxAuth } from '@/lib/core/with-isoflux-auth';
import type { IsoFluxContext } from '@/lib/core/isoflux-auth';
import { IsoFluxOrchestrator } from '@/lib/core/isoflux';
import { z } from 'zod';

let orchestrator: IsoFluxOrchestrator | null = null;

function getOrchestrator(): IsoFluxOrchestrator {
  if (!orchestrator) {
    orchestrator = new IsoFluxOrchestrator();
    orchestrator.initialize().catch(console.error);
  }
  return orchestrator;
}

// Strict input: string (XML/JSON/MT) or object (parsed message)
const ValidateRequestSchema = z.object({
  message: z.union([z.string().min(1), z.record(z.unknown())]),
});

/**
 * POST /api/isoflux/validate
 * Validate ISO 20022 message structure (no compliance or reserve checks).
 */
async function handler(req: NextRequest, _context: IsoFluxContext) {
  try {
    const body = await req.json();
    const validation = ValidateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { message } = validation.data;
    const result = await getOrchestrator().validateMessage(message);

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        violations: result.violations,
      });
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[IsoFlux] Validate error:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = withIsoFluxAuth(handler);
