// =====================================================
// ISOFLUX API - PROCESS TRANSACTION (REACTOR)
// Dual auth: session (dashboard) or X-API-Key (B2B).
// Idempotency-Key header supported to prevent double-processing.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withIsoFluxAuth } from '@/lib/core/with-isoflux-auth';
import type { IsoFluxContext } from '@/lib/core/isoflux-auth';
import { IsoFluxOrchestrator } from '@/lib/core/isoflux';
import { z } from 'zod';

// Global orchestrator instance (in production, use proper DI/service container)
let orchestrator: IsoFluxOrchestrator | null = null;

function getOrchestrator(): IsoFluxOrchestrator {
  if (!orchestrator) {
    orchestrator = new IsoFluxOrchestrator();
    orchestrator.initialize().catch(console.error);
  }
  return orchestrator;
}

// In-memory idempotency cache (key -> { status, body }); production: use Redis or Supabase idempotency_keys table
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const idempotencyStore = new Map<string, { status: number; body: unknown; createdAt: number }>();

function getCachedIdempotency(key: string): { status: number; body: unknown } | null {
  const entry = idempotencyStore.get(key);
  if (!entry || Date.now() - entry.createdAt > IDEMPOTENCY_TTL_MS) {
    if (entry) idempotencyStore.delete(key);
    return null;
  }
  return { status: entry.status, body: entry.body };
}

function setCachedIdempotency(key: string, status: number, body: unknown): void {
  idempotencyStore.set(key, { status, body, createdAt: Date.now() });
  if (idempotencyStore.size > 10_000) {
    const oldest = [...idempotencyStore.entries()].sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
    if (oldest) idempotencyStore.delete(oldest[0]);
  }
}

const ProcessRequestSchema = z.object({
  message: z.string().min(1),
  messageType: z.enum(['pacs.008', 'pacs.009', 'camt.053', 'camt.054', 'pain.001', 'pain.002']).default('pacs.008'),
  format: z.enum(['XML', 'JSON', 'MT']).default('XML'),
});

/**
 * POST /api/isoflux/process
 * Process ISO 20022 transaction through full pipeline (parse → compliance → entanglement).
 * Auth: Bearer session or X-API-Key. Optional: Idempotency-Key to avoid duplicate processing.
 */
async function handler(req: NextRequest, context: IsoFluxContext) {
  const idempotencyKey = req.headers.get('idempotency-key')?.trim();
  if (idempotencyKey) {
    const cached = getCachedIdempotency(`${context.organizationId}:${idempotencyKey}`);
    if (cached) {
      return NextResponse.json(cached.body, { status: cached.status });
    }
  }

  try {
    const body = await req.json();
    const validation = ProcessRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { message, messageType } = validation.data;

    const result = await getOrchestrator().processTransaction(
      message,
      messageType,
      context.userId ?? 'API_KEY',
      context.organizationId
    );

    if (!result.success) {
      const response = {
        success: false,
        violations: result.violations,
        riskScore: result.riskScore,
        processingTime: result.processingTime,
        stages: result.stages,
      };
      if (idempotencyKey) setCachedIdempotency(`${context.organizationId}:${idempotencyKey}`, 422, response);
      return NextResponse.json(response, { status: 422 });
    }

    const response = {
      success: true,
      transactionId: result.transactionId,
      message: result.message,
      riskScore: result.riskScore,
      processingTime: result.processingTime,
      stages: result.stages,
    };
    if (idempotencyKey) setCachedIdempotency(`${context.organizationId}:${idempotencyKey}`, 200, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('[IsoFlux] Process error:', error);
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
