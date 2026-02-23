/**
 * =====================================================
 * WOLF SHIELD: API ROUTE - APPEND LEDGER ENTRY
 * Secure endpoint for adding ledger entries
 * =====================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createWolfShieldLedger, getCurrentAccountingPeriod } from '@/lib/wolf-shield';
import { createServerClient } from '@supabase/ssr';
import { z } from 'zod';

// Validation schema
const LedgerEntrySchema = z.object({
  organizationId: z.string().uuid(),
  propertyId: z.string().uuid(),
  unitId: z.string().uuid(),
  tenantId: z.string().uuid().optional().nullable(),
  transactionType: z.enum([
    'CHARGE',
    'PAYMENT',
    'ADJUSTMENT',
    'FEE',
    'RECERTIFICATION_LOG',
    'MAINTENANCE_REQUEST',
    'MAINTENANCE_APPROVAL',
  ]),
  amount: z.number().min(0),
  description: z.string().min(1).max(500),
  accountingPeriod: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client for auth
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = LedgerEntrySchema.parse(body);

    // Verify user has access to organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', validatedData.organizationId)
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    // Create ledger entry
    const ledger = createWolfShieldLedger();
    const result = await ledger.appendEntry({
      ...validatedData,
      createdBy: user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Log audit event
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      organization_id: validatedData.organizationId,
      action: 'LEDGER_ENTRY_CREATED',
      resource_type: 'hud_append_ledger',
      resource_id: result.data.id,
      metadata: {
        transaction_type: validatedData.transactionType,
        amount: validatedData.amount,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Ledger entry created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ledger entry:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch ledger entries for a period
 */
export async function GET(request: NextRequest) {
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const accountingPeriod = searchParams.get('accountingPeriod') || getCurrentAccountingPeriod();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId is required' },
        { status: 400 }
      );
    }

    // Verify access
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

    // Fetch entries
    const ledger = createWolfShieldLedger();
    const entries = await ledger.getEntriesForPeriod(organizationId, accountingPeriod);

    return NextResponse.json({
      success: true,
      data: entries,
      accountingPeriod,
      count: entries.length,
    });
  } catch (error) {
    console.error('Error fetching ledger entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
