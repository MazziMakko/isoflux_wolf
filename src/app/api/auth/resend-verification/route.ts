// =====================================================
// RESEND VERIFICATION EMAIL API
// =====================================================
// Resends verification email if user didn't receive it

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use Supabase's built-in resend verification method
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error('[ResendVerification] Error:', error);
      return NextResponse.json(
        { error: 'Failed to resend verification email' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error: unknown) {
    console.error('[ResendVerification] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
