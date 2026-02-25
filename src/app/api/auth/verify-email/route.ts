// =====================================================
// EMAIL VERIFICATION API - Complete Verification
// =====================================================
// Called after user clicks verification link in email
// Updates user profile, subscription, and returns session

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';

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

  try {
    const { accessToken, refreshToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // 1. Get user from access token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    const userId = userData.user.id;
    const email = userData.user.email!;

    // 2. Update user profile to mark email as verified
    await dataGateway.update('users', userId, {
      email_verified: true,
      updated_at: new Date().toISOString(),
    });

    // 3. Get organization
    const userOrgs = await dataGateway.getUserOrganizations(userId);
    const organization = userOrgs[0]?.organizations;

    if (!organization) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    // 4. Update subscription status from TRIALING to ACTIVE
    const subscription = await dataGateway.getActiveSubscription(organization.id);
    if (subscription && subscription.status === 'TRIALING') {
      await dataGateway.update('subscriptions', subscription.id, {
        status: 'ACTIVE',
        metadata: { email_verified: true, verified_at: new Date().toISOString() },
        updated_at: new Date().toISOString(),
      });
    }

    // 5. Get updated user profile
    const user = await dataGateway.findById('users', userId);

    // 6. Log verification event
    try {
      await auditLogger.logAuthEvent(userId, 'EMAIL_VERIFIED', {
        email,
        organizationId: organization.id,
      });
    } catch {
      /* non-fatal */
    }

    // 7. Return session data
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        fullName: user?.full_name,
        role: user?.role,
        email_verified: true,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      token: accessToken,
      refresh_token: refreshToken,
    });

    // Set cookie for server-side auth
    response.cookies.set('wolf_shield_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('[VerifyEmail] Error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
