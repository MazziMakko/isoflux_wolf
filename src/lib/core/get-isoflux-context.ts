
// Resolve IsoFlux auth (session or API key). Isolated so security/cookies import does not break bundler.
import { NextRequest, NextResponse } from 'next/server';
import SecurityKernel from './security';
import type { IsoFluxContext } from './isoflux-auth';

export type IsoFluxAuthResult = { context: IsoFluxContext } | { error: NextResponse };

export async function getIsoFluxContext(
  req: NextRequest
): Promise<IsoFluxAuthResult> {
  const security = SecurityKernel.getInstance();
  const apiKey = req.headers.get('x-api-key');

  if (apiKey?.trim()) {
    const validation = await security.validateApiKey(apiKey.trim());
    if (!validation.valid || !validation.organizationId) {
      return {
        error: NextResponse.json(
          { error: 'Invalid or expired API key', code: 'INVALID_API_KEY' },
          { status: 401 }
        ),
      };
    }
    return {
      context: {
        userId: null,
        organizationId: validation.organizationId,
        authMethod: 'api_key',
        role: null,
      },
    };
  }

  const sessionContext = await security.getSecurityContext(req);
  if (!sessionContext.userId) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      ),
    };
  }
  if (!sessionContext.organizationId) {
    return {
      error: NextResponse.json(
        { error: 'No organization', code: 'NO_ORGANIZATION' },
        { status: 403 }
      ),
    };
  }

  const authCheck = await security.checkAuthorization(sessionContext);
  if (!authCheck.authorized) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS', reason: authCheck.reason },
        { status: 403 }
      ),
    };
  }
  return {
    context: {
      userId: sessionContext.userId,
      organizationId: sessionContext.organizationId,
      authMethod: 'session',
      role: sessionContext.role ?? null,
    },
  };
}
