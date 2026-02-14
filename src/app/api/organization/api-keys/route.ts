// =====================================================
// ORGANIZATION API KEYS - Behind-the-scenes setup
// Create/list keys for Reactor (IsoFlux) API access.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/core/security';
import { DataGateway } from '@/lib/core/data-gateway';
import { generateApiKey, hashPassword } from '@/lib/core/crypto';
import { z } from 'zod';
import type { SecurityContext } from '@/lib/core/security';

const CreateKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresInDays: z.number().int().min(0).max(365).optional(), // 0 = no expiry
});

/**
 * GET /api/organization/api-keys
 * List API keys for the authenticated user's organization (admin/super_admin only).
 */
async function listHandler(req: NextRequest, context: SecurityContext) {
  const security = (await import('@/lib/core/security')).default.getInstance();
  const authCheck = await security.checkAuthorization(context, 'admin');
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 }
    );
  }

  if (!context.organizationId) {
    return NextResponse.json(
      { error: 'No organization', code: 'NO_ORGANIZATION' },
      { status: 403 }
    );
  }

  const gateway = new DataGateway(true);
  const keys = await gateway.getOrganizationApiKeys(context.organizationId);

  return NextResponse.json({
    success: true,
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.key_prefix,
      lastUsedAt: k.last_used_at,
      expiresAt: k.expires_at,
      createdAt: k.created_at,
      revoked: !!k.revoked_at,
    })),
  });
}

/**
 * POST /api/organization/api-keys
 * Create a new API key. Raw key returned only once.
 */
async function createHandler(req: NextRequest, context: SecurityContext) {
  const security = (await import('@/lib/core/security')).default.getInstance();
  const authCheck = await security.checkAuthorization(context, 'admin');
  if (!authCheck.authorized) {
    return NextResponse.json(
      { error: 'Forbidden', code: 'INSUFFICIENT_ROLE' },
      { status: 403 }
    );
  }

  if (!context.organizationId) {
    return NextResponse.json(
      { error: 'No organization', code: 'NO_ORGANIZATION' },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CreateKeySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation error', details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { name, expiresInDays } = parsed.data;
  const rawKey = generateApiKey('iso'); // iso_... for Reactor; use 'ffx' for legacy
  const keyHash = await hashPassword(rawKey);
  const keyPrefix = rawKey.slice(0, 8);

  const gateway = new DataGateway(true);
  const expiresAt =
    expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  const created = await gateway.createApiKey({
    organization_id: context.organizationId,
    name,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    expires_at: expiresAt,
    created_by: context.userId ?? undefined,
  });

  if (!created || !('id' in created) || !('created_at' in created)) {
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    key: {
      id: created.id,
      name,
      keyPrefix,
      expiresAt,
      createdAt: created.created_at,
    },
    /** Raw key shown only once; store securely. */
    rawKey,
  });
}

export const GET = withAuth(listHandler);
export const POST = withAuth(createHandler);
