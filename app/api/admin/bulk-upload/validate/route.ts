import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import { parseCSV, parseJSON } from '@/lib/utils/bulk-upload-parser';
import { validateEntityData } from '@/lib/utils/bulk-upload-validator';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/bulk-upload/validate
 * 
 * Validates a bulk upload file (dry-run).
 * Requires admin role.
 * 
 * Form data:
 * - file: File (CSV or JSON)
 * - entityType: 'courses' | 'subscriptions' | 'entitlements'
 * - fileType: 'csv' | 'json'
 * 
 * Returns:
 * - valid: boolean
 * - totalRows: number
 * - validRows: number
 * - errors: Array of { row, field?, message }
 * - preview: Array of first 5 valid rows
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!entityType || !['courses', 'subscriptions', 'entitlements'].includes(entityType)) {
      return NextResponse.json(
        { error: 'Invalid entity type' },
        { status: 400 }
      );
    }

    if (!fileType || !['csv', 'json'].includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Parse file
    let rows: any[];
    try {
      const fileContent = await file.text();
      if (fileType === 'csv') {
        rows = parseCSV(fileContent);
      } else {
        rows = parseJSON(fileContent);
      }
    } catch (parseError) {
      return NextResponse.json(
        { 
          error: 'Failed to parse file',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // Validate each row
    const errors: Array<{ row: number; field?: string; message: string }> = [];
    const validRows: any[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 1; // 1-based row numbers
      const validation = validateEntityData(row, entityType as 'courses' | 'subscriptions' | 'entitlements', rowNumber);
      
      if (validation.valid) {
        validRows.push(row);
      } else {
        errors.push(...validation.errors);
      }
    });

    return NextResponse.json({
      valid: errors.length === 0,
      totalRows: rows.length,
      validRows: validRows.length,
      errors,
      preview: validRows.slice(0, 5), // First 5 valid rows for preview
    });
  } catch (error) {
    console.error('Error in bulk-upload validate handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
