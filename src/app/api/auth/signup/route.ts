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

    // 1. Create User in Supabase Auth with email verification required
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: false, // Require email confirmation - Supabase will send verification email
      user_metadata: {
        full_name: validated.fullName,
        organization_name: validated.organizationName || `${validated.fullName}'s Organization`,
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

    // 2. Sync to public.users (email_verified will be false until they confirm)
    const userProfile = await dataGateway.upsert(
      'users',
      {
        id: userId,
        email: validated.email,
        full_name: validated.fullName,
        role: 'property_manager', // Default role for signups
        password_hash: 'managed_by_supabase_auth',
        email_verified: false, // Will be updated when they confirm email
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

    // 5. Create Subscription (TRIALING status until email verified)
    await dataGateway.create('subscriptions', {
      organization_id: organization.id,
      tier: 'free',
      status: 'trialing', // Changed from 'active' - becomes ACTIVE after email verification
      metadata: { email_verification_pending: true },
    });

    // 6. Send audit log
    try {
      await auditLogger.logAuthEvent(userId, 'REGISTER', {
        email: validated.email,
        organizationId: organization.id,
        emailVerificationRequired: true,
      });
    } catch {
      /* non-fatal audit error */
    }

    // 7. Return success WITHOUT logging them in
    // They need to verify email first
    const response = NextResponse.json(
      {
        success: true,
        emailVerificationRequired: true,
        message: 'Account created! Please check your email to verify your account.',
        user: {
          id: userId,
          email: validated.email,
          fullName: validated.fullName,
          email_verified: false,
        },
        organization: { id: organization.id, name: organization.name, slug: organization.slug },
      },
      { status: 201 }
    );

    return response;
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('[Signup] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
