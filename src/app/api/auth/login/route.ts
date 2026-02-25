// =====================================================
// AUTHENTICATION API - LOGIN (SUPABASE NATIVE)
// =====================================================
// Verifies password via Supabase Auth (signInWithPassword). No password_hash lookup.
// Returns Supabase session token so server getSession() and dashboard auth work.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration', code: 'MISSING_ENV' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const validated = loginSchema.parse(body);

    // 1. Verify credentials with Supabase Auth (source of truth)
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (!authData.session?.user) {
      return NextResponse.json(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const userId = authData.session.user.id;

    // 2. Load profile and org from public tables (same id as Auth)
    const user = await dataGateway.findById('users', userId);
    if (!user) {
      console.error('[Login] No profile found for user:', userId, 'email:', validated.email);
      
      // CRITICAL: Profile should exist from signup. If it doesn't, this is a bug.
      // Option 1: Return error telling them to contact support
      // Option 2: Auto-create profile here (fallback for broken signups)
      
      // Let's auto-create as fallback:
      const newProfile = await dataGateway.upsert(
        'users',
        {
          id: userId,
          email: validated.email,
          full_name: authData.session.user.user_metadata?.full_name || validated.email.split('@')[0],
          role: 'property_manager',
          password_hash: 'managed_by_supabase_auth',
          email_verified: true,
        },
        { onConflict: 'id' }
      );

      if (!newProfile) {
        return NextResponse.json(
          { 
            error: 'Profile creation failed. Please contact support at thenationofmazzi@gmail.com or call (856) 274-8668',
            code: 'NO_PROFILE' 
          },
          { status: 400 }
        );
      }

      // Continue with the newly created profile
      return await completeLogin(newProfile, authData, req, auditLogger, dataGateway, validated);
    }

    return await completeLogin(user, authData, req, auditLogger, dataGateway, validated);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[Login] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function completeLogin(
  user: any,
  authData: any,
  req: NextRequest,
  auditLogger: any,
  dataGateway: any,
  validated: { email: string; password: string }
) {
  const userId = user.id;

  const userOrgs = await dataGateway.getUserOrganizations(userId);
  let defaultOrg = userOrgs[0]?.organizations;
  
  if (!defaultOrg) {
    console.error('[Login] No organization found for user:', userId);
    
    // Auto-create organization as fallback
    const orgName = `${user.full_name || validated.email.split('@')[0]}'s Organization`;
    const orgSlug = `${(user.full_name || validated.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
    
    const organization = await dataGateway.createOrganization({
      owner_id: userId,
      name: orgName,
      slug: orgSlug,
      settings: {},
      metadata: {},
    });

    if (!organization) {
      return NextResponse.json(
        { 
          error: 'Organization creation failed. Please contact support at thenationofmazzi@gmail.com or call (856) 274-8668',
          code: 'NO_ORGANIZATION' 
        },
        { status: 400 }
      );
    }

    // Add member
    await dataGateway.create('organization_members', {
      organization_id: organization.id,
      user_id: userId,
      role: 'admin',
      permissions: [],
    });

    // Create subscription
    await dataGateway.create('subscriptions', {
      organization_id: organization.id,
      tier: 'free',
      status: 'trialing',
      metadata: {},
    });

    defaultOrg = organization;
  }

  const subscription = await dataGateway.getActiveSubscription(defaultOrg.id);

  // 3. Update last login
  await dataGateway.update('users', userId, {
    last_login_at: new Date().toISOString(),
  });

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  try {
    await auditLogger.logAuthEvent(userId, 'LOGIN', {
      email: user.email,
      organizationId: defaultOrg.id,
      ip: clientIp,
    });
  } catch {
    /* non-fatal */
  }

  // 4. Return Supabase session tokens; set cookie so middleware allows /dashboard
  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
    },
    organization: {
      id: defaultOrg.id,
      name: defaultOrg.name,
      slug: defaultOrg.slug,
    },
    subscription: subscription
      ? { tier: subscription.tier, status: subscription.status }
      : null,
    token: authData.session.access_token,
    refresh_token: authData.session.refresh_token ?? undefined,
  });

  response.cookies.set('wolf_shield_token', authData.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
