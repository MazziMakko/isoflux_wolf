// =====================================================
// WOLF SHIELD: CSV PARSER API
// Client-side file preview and column detection
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileSize } = await req.json();

    // Validate file
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large (max 10 MB)' },
        { status: 400 }
      );
    }

    // Generate signed URL for upload
    const fileKey = `imports/${Date.now()}-${fileName}`;
    const { data, error } = await supabase.storage
      .from('rent-roll-imports')
      .createSignedUploadUrl(fileKey);

    if (error) {
      console.error('Failed to create signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    // Auto-detect columns (mock for now, will be enhanced with actual CSV parsing)
    const columns = [
      {
        csvHeader: 'Tenant Name',
        dbField: 'tenant_name',
        sampleData: ['John Doe', 'Jane Smith', 'Bob Johnson'],
        isRequired: true,
        validationStatus: 'valid' as const,
      },
      {
        csvHeader: 'Unit',
        dbField: 'unit_number',
        sampleData: ['101', '102', '103'],
        isRequired: true,
        validationStatus: 'valid' as const,
      },
      {
        csvHeader: 'Move-In Date',
        dbField: 'move_in_date',
        sampleData: ['01/15/2023', '03/20/2023', '06/10/2023'],
        isRequired: false,
        validationStatus: 'valid' as const,
      },
      {
        csvHeader: 'Monthly Rent',
        dbField: 'monthly_rent',
        sampleData: ['$1,200', '$1,500', '$1,350'],
        isRequired: false,
        validationStatus: 'valid' as const,
      },
    ];

    return NextResponse.json({
      signedUrl: data.signedUrl,
      fileKey,
      columns,
    });
  } catch (error: any) {
    console.error('Parse API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
