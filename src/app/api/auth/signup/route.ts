// =====================================================
// AUTHENTICATION API - SIGNUP (SUPABASE NATIVE)
// =====================================================
// Creates the user in Supabase Auth (source of truth), then syncs to public.users
// with a placeholder password_hash. Real auth is handled by Supabase.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { AuditLogger } from '@/lib/core/audit';
import DataGateway from '@/lib/core/data-gateway';
import { nanoid } from 'nanoid';

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

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  organizationName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auditLogger = new AuditLogger();
  const dataGateway = new DataGateway(true);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Server misconfiguration', code: 'MISSING_ENV' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    // 1. Create User in Supabase Auth (source of truth)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true, // Auto-confirm for smooth onboarding
      user_metadata: {
        full_name: validated.fullName,
      },
    });

    if (authError) {
      console.error('[Signup] Auth creation failed:', authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User creation returned no data' }, { status: 500 });
    }

    const userId = authData.user.id;

    // 2. Sync to public.users (placeholder password_hash; Auth holds the real secret)
    const userProfile = await dataGateway.upsert(
      'users',
      {
        id: userId,
        email: validated.email,
        full_name: validated.fullName,
        role: 'PROPERTY_MANAGER', // Use uppercase enum value
        password_hash: 'managed_by_supabase_auth',
        email_verified: true,
      },
      { onConflict: 'id' }
    );

    if (!userProfile) {
      console.error('[Signup] Profile sync failed - this is critical');
      return NextResponse.json(
        { error: 'Failed to create user profile. Please try again.' },
        { status: 500 }
      );
    }

    // 3. Create Organization
    const orgName = validated.organizationName ?? `${validated.fullName}'s Organization`;
    const orgSlug = `${validated.fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${nanoid(6)}`;

    const organization = await dataGateway.createOrganization({
      owner_id: userId,
      name: orgName,
      slug: orgSlug,
      settings: {},
      metadata: {},
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Failed to create organization.' },
        { status: 500 }
      );
    }

    // 4. Add Member
    await dataGateway.create('organization_members', {
      organization_id: organization.id,
      user_id: userId,
      role: 'admin',
      permissions: [],
    });

    // 5. Create Subscription (TRIALING status for 30 days)
    await dataGateway.create('subscriptions', {
      organization_id: organization.id,
      tier: 'free',
      status: 'TRIALING',
      metadata: {},
    });

    // 6. Sign in to get session token for immediate use
    const { data: signInData } = await supabaseAdmin.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    try {
      await auditLogger.logAuthEvent(userId, 'REGISTER', {
        email: validated.email,
        organizationId: organization.id,
      });
    } catch {
      /* non-fatal audit error */
    }

    const session = signInData.session;
    const token = session?.access_token ?? null;
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: userId,
          email: validated.email,
          fullName: validated.fullName,
          full_name: validated.fullName,
        },
        organization: { id: organization.id, name: organization.name, slug: organization.slug },
        token,
        refresh_token: session?.refresh_token ?? undefined,
      },
      { status: 201 }
    );

    if (token) {
      response.cookies.set('wolf_shield_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[Signup] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
