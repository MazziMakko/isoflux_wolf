// =====================================================
// SECURITY KERNEL - ZERO TRUST ARCHITECTURE
// =====================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database.types';
import { verifyJWT, hashPassword, comparePassword } from './crypto';
import { AuditLogger } from './audit';
import DataGateway from './data-gateway';

export interface SecurityContext {
  userId: string | null;
  organizationId: string | null;
  role: string | null;
  permissions: string[];
  sessionId: string | null;
}

export class SecurityKernel {
  private static instance: SecurityKernel;
  private auditLogger: AuditLogger;

  private constructor() {
    this.auditLogger = new AuditLogger();
  }

  public static getInstance(): SecurityKernel {
    if (!SecurityKernel.instance) {
      SecurityKernel.instance = new SecurityKernel();
    }
    return SecurityKernel.instance;
  }

  /**
   * Create Supabase server client with security context
   */
  async createSecureClient() {
    const cookieStore = await cookies();
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle cookie setting errors
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Handle cookie removal errors
            }
          },
        },
      }
    );
  }

  /**
   * Extract and validate security context from request.
   * 1) Tries Supabase session from cookies (set by setSupabaseSession after login).
   * 2) Fallback: Bearer token or fluxforge_token cookie (so dashboard/API work even if Supabase cookies aren't in sync).
   */
  async getSecurityContext(req: NextRequest): Promise<SecurityContext> {
    const supabase = await this.createSecureClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    let userId: string | null = null;
    let sessionId: string | null = null;
    let fromTokenFallback = false;

    if (!error && session?.user) {
      userId = session.user.id;
      sessionId = session.access_token;
    }

    // Fallback: token from cookie or Authorization header (login/signup set fluxforge_token; dashboard sends Bearer)
    if (!userId) {
      const token =
        req.cookies.get('fluxforge_token')?.value ??
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')?.trim();
      if (token) {
        const user = await this.validateSupabaseAccessToken(token);
        if (user) {
          userId = user.id;
          sessionId = token;
          fromTokenFallback = true;
        }
      }
    }

    if (!userId) {
      return {
        userId: null,
        organizationId: null,
        role: null,
        permissions: [],
        sessionId: null,
      };
    }

    // Fetch user's first organization and role (use limit(1) so multiple orgs don't break .single())
    let memberData: { organization_id: string; role: string | null; permissions: string[] } | null = null;

    const { data: members } = await supabase
      .from('organization_members')
      .select('organization_id, role, permissions')
      .eq('user_id', userId)
      .limit(1);

    if (Array.isArray(members) && members.length > 0) {
      memberData = members[0] as { organization_id: string; role: string | null; permissions: string[] };
    }

    // When auth was via token fallback, cookie client has no session so RLS may return no rows; use service role
    if (fromTokenFallback && !memberData) {
      const dataGateway = new DataGateway(true);
      const userOrgs = await dataGateway.getUserOrganizations(userId);
      const first = userOrgs[0];
      if (first) {
        memberData = {
          organization_id: first.organization_id,
          role: first.role,
          permissions: (first.permissions as string[]) ?? [],
        };
      }
    }

    return {
      userId,
      organizationId: memberData?.organization_id ?? null,
      role: memberData?.role ?? null,
      permissions: (memberData?.permissions as string[]) ?? [],
      sessionId,
    };
  }

  /**
   * Validate Supabase access token (JWT) via Auth API so API routes work with Bearer/wolf_shield_token.
   */
  private async validateSupabaseAccessToken(accessToken: string): Promise<{ id: string } | null> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    try {
      const res = await fetch(`${url}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: anonKey,
        },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.id ? { id: data.id } : null;
    } catch {
      return null;
    }
  }

  /**
   * Authority Violation Check - Ensures user has required permissions
   */
  async checkAuthorization(
    context: SecurityContext,
    requiredRole?: string,
    requiredPermissions?: string[]
  ): Promise<{ authorized: boolean; reason?: string }> {
    if (!context.userId) {
      return { authorized: false, reason: 'Not authenticated' };
    }

    // Check role hierarchy
    const roleHierarchy = ['super_admin', 'admin', 'editor', 'viewer', 'customer'];
    
    if (requiredRole) {
      const userRoleIndex = roleHierarchy.indexOf(context.role || '');
      const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
      
      if (userRoleIndex === -1 || userRoleIndex > requiredRoleIndex) {
        await this.auditLogger.logSecurityEvent({
          userId: context.userId,
          action: 'AUTHORIZATION_FAILED',
          reason: `Insufficient role: ${context.role} < ${requiredRole}`,
          metadata: { requiredRole, userRole: context.role },
        });
        return { authorized: false, reason: 'Insufficient role' };
      }
    }

    // Check permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(perm =>
        context.permissions.includes(perm)
      );

      if (!hasAllPermissions) {
        await this.auditLogger.logSecurityEvent({
          userId: context.userId,
          action: 'AUTHORIZATION_FAILED',
          reason: 'Missing required permissions',
          metadata: { requiredPermissions, userPermissions: context.permissions },
        });
        return { authorized: false, reason: 'Missing permissions' };
      }
    }

    return { authorized: true };
  }

  /**
   * PII Sanitizer - Remove sensitive information before sending to LLM
   */
  sanitizePII(data: any): any {
    const piiPatterns = [
      { name: 'email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL_REDACTED]' },
      { name: 'phone', regex: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE_REDACTED]' },
      { name: 'ssn', regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
      { name: 'credit_card', regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, replacement: '[CARD_REDACTED]' },
      { name: 'api_key', regex: /\b(sk_live_|pk_live_|sk_test_|pk_test_)[a-zA-Z0-9]{24,}\b/g, replacement: '[API_KEY_REDACTED]' },
    ];

    if (typeof data === 'string') {
      let sanitized = data;
      piiPatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern.regex, pattern.replacement);
      });
      return sanitized;
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizePII(item));
      }
      
      const sanitized: any = {};
      for (const key in data) {
        // Skip sensitive keys entirely
        if (['password', 'password_hash', 'secret', 'token', 'api_key'].includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizePII(data[key]);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Validate API Key
   */
  async validateApiKey(apiKey: string): Promise<{ valid: boolean; organizationId?: string }> {
    const validPrefixes = ['ffx_', 'iso_'];
    if (!apiKey || !validPrefixes.some((p) => apiKey.startsWith(p))) {
      return { valid: false };
    }

    const supabase = await this.createSecureClient();
    const keyHash = await hashPassword(apiKey);

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, organization_id, expires_at, revoked_at')
      .eq('key_hash', keyHash)
      .single();

    if (error || !data) {
      return { valid: false };
    }

    // Check if expired or revoked
    if (data.revoked_at || (data.expires_at && new Date(data.expires_at) < new Date())) {
      return { valid: false };
    }

    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);

    return { valid: true, organizationId: data.organization_id };
  }

  /**
   * Rate Limiting Check
   */
  async checkRateLimit(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 900000 // 15 minutes
  ): Promise<{ allowed: boolean; remaining: number }> {
    // Implementation using Redis or in-memory store
    // For now, simple implementation
    return { allowed: true, remaining: maxRequests };
  }

  /**
   * Secure password hashing
   */
  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  /**
   * Verify password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return comparePassword(password, hash);
  }
}

/**
 * Middleware wrapper for route protection
 */
export function withAuth(
  handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options?: {
    requiredRole?: string;
    requiredPermissions?: string[];
  }
) {
  return async (req: NextRequest) => {
    const security = SecurityKernel.getInstance();
    const context = await security.getSecurityContext(req);

    if (!context.userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const authCheck = await security.checkAuthorization(
      context,
      options?.requiredRole,
      options?.requiredPermissions
    );

    if (!authCheck.authorized) {
      return NextResponse.json(
        { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS', reason: authCheck.reason },
        { status: 403 }
      );
    }

    return handler(req, context);
  };
}

/**
 * API Key Authentication Middleware
 */
export function withApiKey(
  handler: (req: NextRequest, organizationId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const security = SecurityKernel.getInstance();
    const apiKey = req.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required', code: 'API_KEY_REQUIRED' },
        { status: 401 }
      );
    }

    const validation = await security.validateApiKey(apiKey);

    if (!validation.valid || !validation.organizationId) {
      return NextResponse.json(
        { error: 'Invalid API key', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    return handler(req, validation.organizationId);
  };
}

export default SecurityKernel;
