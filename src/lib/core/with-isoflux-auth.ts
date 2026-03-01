// =====================================================
// ISOFLUX ROUTE WRAPPER - DUAL AUTH (SESSION OR API KEY)
// Separate file to avoid bundler module boundary issues.
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { getIsoFluxContext } from './get-isoflux-context';
import type { IsoFluxContext } from './isoflux-auth';
import { checkRateLimit, pruneRateLimitStore } from './rate-limit';

/**
 * Protects IsoFlux/Reactor routes with dual auth (session or API key).
 * Forwards Next.js route context (e.g. params) as third argument for dynamic routes.
 */
export function withIsoFluxAuth(
  handler: (
    req: NextRequest,
    context: IsoFluxContext,
    routeContext?: any
  ) => Promise<NextResponse>,
  options?: { requiredRole?: string }
) {
  const ROLE_HIERARCHY = ['super_admin', 'admin', 'editor', 'viewer', 'customer'];
  const hasRole = (context: IsoFluxContext, requiredRole: string): boolean => {
    if (context.authMethod === 'api_key') return true;
    const userIndex = ROLE_HIERARCHY.indexOf(context.role ?? '');
    const requiredIndex = ROLE_HIERARCHY.indexOf(requiredRole);
    return userIndex !== -1 && userIndex <= requiredIndex;
  };

  return async (
    req: NextRequest,
    routeContext: any
  ) => {
    const result = await getIsoFluxContext(req);
    if ('error' in result) return result.error;
    const context = result.context;

    if (options?.requiredRole && !hasRole(context, options.requiredRole)) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_ROLE', requiredRole: options.requiredRole },
        { status: 403 }
      );
    }

    const rl = checkRateLimit(context.organizationId);
    if (!rl.allowed) {
      const res = NextResponse.json(
        { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
      res.headers.set('Retry-After', String(Math.ceil((rl.resetAt - Date.now()) / 1000)));
      res.headers.set('X-RateLimit-Remaining', '0');
      return res;
    }
    if (Math.random() < 0.01) pruneRateLimitStore();

    const rawParams = routeContext?.params;
    const params = rawParams instanceof Promise ? await rawParams : rawParams;

    return handler(req, context, { params });
  };
}
