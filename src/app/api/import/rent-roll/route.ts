// =====================================================
// WOLF SHIELD: RENT ROLL IMPORT ENGINE
// Batch processing with validation, unit creation, and ledger initialization
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const TenantRowSchema = z.object({
  tenant_name: z.string().min(1, 'Tenant name is required'),
  unit_number: z.string().min(1, 'Unit number is required'),
  move_in_date: z.string().optional().nullable(),
  monthly_rent: z.union([z.string(), z.number()]).optional().nullable(),
  annual_income: z.union([z.string(), z.number()]).optional().nullable(),
  recertification_date: z.string().optional().nullable(),
  subsidy_amount: z.union([z.string(), z.number()]).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
});

type TenantRow = z.infer<typeof TenantRowSchema>;

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;

  try {
    // Try MM/DD/YYYY
    const match1 = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (match1) {
      const [, month, day, year] = match1;
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD
    const match2 = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (match2) {
      const [, year, month, day] = match2;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try parsing as Date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  } catch {
    return null;
  }
}

function parseCurrency(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number') return value;

  // Remove $, commas, and parse
  const cleaned = value.replace(/[$,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

function parsePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Extract digits only
  const digits = phone.replace(/\D/g, '');
  
  // Validate 10-digit US phone
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return digits.length > 0 ? digits : null;
}

// =====================================================
// MAIN IMPORT HANDLER
// =====================================================

export async function POST(req: NextRequest) {
  try {
    const { fileName, propertyId, columnMapping } = await req.json();

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 1: DOWNLOAD FILE FROM STORAGE
    // =====================================================
    const fileKey = `imports/${fileName}`;
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('rent-roll-imports')
      .download(fileKey);

    if (downloadError) {
      console.error('Failed to download file:', downloadError);
      return NextResponse.json(
        { error: 'Failed to download file' },
        { status: 500 }
      );
    }

    // =====================================================
    // STEP 2: PARSE FILE (CSV OR EXCEL)
    // =====================================================
    const fileBuffer = await fileBlob.arrayBuffer();
    let rows: any[] = [];

    if (fileName.endsWith('.csv')) {
      const csvText = new TextDecoder().decode(fileBuffer);
      rows = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // =====================================================
    // STEP 3: MAP AND VALIDATE ROWS
    // =====================================================
    const mappedRows: TenantRow[] = [];
    const errors: ValidationError[] = [];

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const rowNumber = i + 2; // +2 because row 1 is header, and we're 0-indexed

      // Map columns
      const mappedRow: any = {};
      for (const [csvCol, dbField] of Object.entries(columnMapping)) {
        mappedRow[dbField] = rawRow[csvCol];
      }

      // Validate
      try {
        const validated = TenantRowSchema.parse(mappedRow);
        mappedRows.push(validated);
      } catch (err: any) {
        if (err instanceof z.ZodError) {
          for (const issue of err.issues) {
            errors.push({
              row: rowNumber,
              field: issue.path[0] as string,
              value: String(mappedRow[issue.path[0]] || ''),
              error: issue.message,
              severity: 'error',
            });
          }
        }
      }
    }

    // =====================================================
    // STEP 4: GET OR CREATE ORGANIZATION
    // =====================================================
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const organizationId = userProfile.organization_id;

    // =====================================================
    // STEP 5: GET OR CREATE PROPERTY
    // =====================================================
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('organization_id', organizationId)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // =====================================================
    // STEP 6: BATCH IMPORT TENANTS
    // =====================================================
    let successfulRows = 0;
    let failedRows = 0;
    let warningRows = 0;

    for (const row of mappedRows) {
      try {
        // =====================================================
        // 6.1: GET OR CREATE UNIT
        // =====================================================
        let unit;
        const { data: existingUnits } = await supabase
          .from('units')
          .select('*')
          .eq('property_id', propertyId)
          .ilike('unit_number', row.unit_number);

        if (existingUnits && existingUnits.length > 0) {
          unit = existingUnits[0];
        } else {
          // Create new unit
          const { data: newUnit, error: unitError } = await supabase
            .from('units')
            .insert({
              property_id: propertyId,
              organization_id: organizationId,
              unit_number: row.unit_number,
              status: 'occupied',
              bedrooms: 2, // Default
              bathrooms: 1, // Default
              square_footage: 800, // Default
            })
            .select()
            .single();

          if (unitError) {
            console.error('Failed to create unit:', unitError);
            errors.push({
              row: mappedRows.indexOf(row) + 2,
              field: 'unit_number',
              value: row.unit_number,
              error: 'Failed to create unit',
              severity: 'error',
            });
            failedRows++;
            continue;
          }

          unit = newUnit;
        }

        // =====================================================
        // 6.2: CREATE OR UPDATE TENANT
        // =====================================================
        const moveInDate = parseDate(row.move_in_date);
        const recertDate = parseDate(row.recertification_date);
        const monthlyRent = parseCurrency(row.monthly_rent);
        const annualIncome = parseCurrency(row.annual_income);
        const subsidyAmount = parseCurrency(row.subsidy_amount);
        const phone = parsePhone(row.phone);

        const { data: existingTenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('unit_id', unit.id)
          .eq('organization_id', organizationId)
          .single();

        if (existingTenant) {
          // Update existing tenant
          await supabase
            .from('tenants')
            .update({
              name: row.tenant_name,
              email: row.email || null,
              phone: phone,
              move_in_date: moveInDate,
              monthly_rent: monthlyRent,
              annual_income: annualIncome,
              recertification_date: recertDate,
              subsidy_amount: subsidyAmount,
            })
            .eq('id', existingTenant.id);
        } else {
          // Create new tenant
          await supabase
            .from('tenants')
            .insert({
              organization_id: organizationId,
              property_id: propertyId,
              unit_id: unit.id,
              name: row.tenant_name,
              email: row.email || null,
              phone: phone,
              move_in_date: moveInDate,
              lease_start_date: moveInDate,
              monthly_rent: monthlyRent,
              annual_income: annualIncome,
              recertification_date: recertDate,
              subsidy_amount: subsidyAmount,
              status: 'active',
            });
        }

        // =====================================================
        // 6.3: CREATE INITIAL LEDGER ENTRY
        // =====================================================
        if (monthlyRent) {
          const currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM

          await supabase
            .from('hud_append_ledger')
            .insert({
              organization_id: organizationId,
              property_id: propertyId,
              unit_id: unit.id,
              tenant_id: null, // Will be filled by trigger if we add tenant_id FK
              transaction_type: 'CHARGE',
              amount: monthlyRent,
              description: `Initial rent charge for ${row.tenant_name} - Imported from ${fileName}`,
              accounting_period: currentPeriod,
              is_period_closed: false,
              created_by: user.id,
              cryptographic_hash: '', // Will be filled by trigger
            });
        }

        successfulRows++;

        // Check for warnings
        if (!row.email || !row.phone || !moveInDate) {
          warningRows++;
          if (!row.email) {
            errors.push({
              row: mappedRows.indexOf(row) + 2,
              field: 'email',
              value: '',
              error: 'Email missing - tenant will not receive notifications',
              severity: 'warning',
            });
          }
        }
      } catch (error: any) {
        console.error('Failed to import row:', error);
        errors.push({
          row: mappedRows.indexOf(row) + 2,
          field: 'general',
          value: JSON.stringify(row),
          error: error.message || 'Unknown error',
          severity: 'error',
        });
        failedRows++;
      }
    }

    // =====================================================
    // STEP 7: CREATE IMPORT JOB RECORD
    // =====================================================
    const { data: importJob } = await supabase
      .from('import_jobs')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        property_id: propertyId,
        file_name: fileName,
        file_size: fileBlob.size,
        status: 'completed',
        total_rows: rows.length,
        successful_rows: successfulRows,
        failed_rows: failedRows,
        warning_rows: warningRows,
        column_mapping: columnMapping,
        validation_errors: errors,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    // =====================================================
    // STEP 8: CLEANUP - DELETE FILE FROM STORAGE
    // =====================================================
    await supabase.storage
      .from('rent-roll-imports')
      .remove([fileKey]);

    // =====================================================
    // STEP 9: RETURN SUMMARY
    // =====================================================
    return NextResponse.json({
      totalRows: rows.length,
      successfulRows,
      failedRows,
      warningRows,
      errors,
      importJobId: importJob?.id,
    });
  } catch (error: any) {
    console.error('Import API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
