/**
 * =====================================================
 * WOLF SHIELD: LEDGER VERIFICATION API
 * Verify ledger integrity and compliance
 * =====================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWolfShieldLedger } from '@/lib/wolf-shield';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify user access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Verify ledger integrity
    const ledger = createWolfShieldLedger();
    const verification = await ledger.verifyLedgerIntegrity(organizationId);

    // Log verification attempt
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      organization_id: organizationId,
      action: 'LEDGER_VERIFICATION',
      resource_type: 'hud_append_ledger',
      metadata: {
        is_valid: verification.isValid,
        total_entries: verification.totalEntries,
        broken_chain_at: verification.brokenChainAt,
        invalid_hashes_count: verification.invalidHashes.length,
      },
    });

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error) {
    console.error('Error verifying ledger:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
