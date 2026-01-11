import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { parseCSV, parseJSON } from '@/lib/utils/bulk-upload-parser';
import { validateEntityData } from '@/lib/utils/bulk-upload-validator';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/bulk-upload/apply
 * 
 * Applies bulk upload changes (batch upserts).
 * Requires admin role.
 * 
 * Form data:
 * - file: File (CSV or JSON)
 * - entityType: 'courses' | 'subscriptions' | 'entitlements'
 * - fileType: 'csv' | 'json'
 * 
 * Returns:
 * - success: boolean
 * - inserted: number
 * - updated: number
 * - failed: number
 * - errors: Array of { row, field?, message }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const adminUser = adminResult;

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

    // Validate and process rows
    const supabase = createServerSupabaseClient();
    const errors: Array<{ row: number; field?: string; message: string }> = [];
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    // Process in batches of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      
      for (const row of batch) {
        const rowNumber = i + batch.indexOf(row) + 1;
        
        // Validate row
        const validation = validateEntityData(row, entityType as 'courses' | 'subscriptions' | 'entitlements', rowNumber);
        if (!validation.valid) {
          errors.push(...validation.errors);
          failed++;
          continue;
        }

        try {
          // Apply based on entity type
          switch (entityType) {
            case 'courses':
              await applyCourse(supabase, row);
              inserted++;
              break;
            case 'subscriptions':
              const result = await applySubscription(supabase, row);
              if (result.inserted) inserted++;
              if (result.updated) updated++;
              break;
            case 'entitlements':
              await applyEntitlement(supabase, row);
              inserted++;
              break;
          }
        } catch (error) {
          failed++;
          errors.push({
            row: rowNumber,
            message: error instanceof Error ? error.message : 'Unknown error during upsert',
          });
        }
      }
    }

    // Log bulk upload action
    try {
      const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       request.headers.get('x-real-ip') ||
                       null;
      const userAgent = request.headers.get('user-agent') || null;

      await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: adminUser.id,
          action_type: 'bulk_upload',
          resource_type: entityType,
          metadata: {
            file_name: file.name,
            file_type: fileType,
            total_rows: rows.length,
            inserted,
            updated,
            failed,
            errors_count: errors.length,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        });
    } catch (auditError) {
      // Log error but don't fail the request
      console.error('Failed to log bulk upload audit:', auditError);
    }

    return NextResponse.json({
      success: failed === 0,
      inserted,
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in bulk-upload apply handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function applyCourse(supabase: any, row: any) {
  const courseData: any = {
    slug: row.slug.trim(),
    title: row.title.trim(),
    description: row.description?.trim() || null,
    thumbnail_url: row.thumbnail_url?.trim() || null,
    duration_weeks: row.duration_weeks ? parseInt(String(row.duration_weeks), 10) : null,
    difficulty_level: row.difficulty_level?.toLowerCase() || null,
    is_published: String(row.is_published || 'false').toLowerCase() === 'true',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('courses')
    .upsert(courseData, {
      onConflict: 'slug',
    });

  if (error) {
    throw new Error(`Failed to upsert course: ${error.message}`);
  }
}

async function applySubscription(supabase: any, row: any): Promise<{ inserted: boolean; updated: boolean }> {
  // Check if subscription exists by user_id (there should be one active subscription per user)
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', row.user_id)
    .maybeSingle();

  const subscriptionData: any = {
    user_id: row.user_id,
    stripe_price_id: row.stripe_price_id,
    status: row.status.toLowerCase(),
    updated_at: new Date().toISOString(),
  };

  // Handle current_period_end
  if (row.current_period_end) {
    const periodEnd = new Date(row.current_period_end);
    if (!isNaN(periodEnd.getTime())) {
      subscriptionData.current_period_end = periodEnd.toISOString();
    }
  }

  // Handle current_period_start
  if (row.current_period_start) {
    const periodStart = new Date(row.current_period_start);
    if (!isNaN(periodStart.getTime())) {
      subscriptionData.current_period_start = periodStart.toISOString();
    }
  }

  // If we have stripe_customer_id, include it
  if (row.stripe_customer_id) {
    subscriptionData.stripe_customer_id = row.stripe_customer_id;
  } else {
    // Try to get from stripe_customers table
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', row.user_id)
      .maybeSingle();
    
    if (customer) {
      subscriptionData.stripe_customer_id = customer.stripe_customer_id;
    } else {
      // If no customer found, we still need one - this might fail, but let the DB handle it
      throw new Error(`No stripe_customer_id found for user_id: ${row.user_id}`);
    }
  }

  // If subscription ID is provided, use it; otherwise use existing or generate
  if (row.id) {
    subscriptionData.id = row.id;
  } else if (existing) {
    subscriptionData.id = existing.id;
  }

  // Determine conflict resolution
  const conflictColumn = subscriptionData.id ? 'id' : 'user_id';

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, {
      onConflict: conflictColumn,
    });

  if (error) {
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }

  return {
    inserted: !existing,
    updated: !!existing,
  };
}

async function applyEntitlement(supabase: any, row: any) {
  // Get user's profile_id from user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', row.user_id)
    .maybeSingle();

  if (!profile) {
    throw new Error(`Profile not found for user_id: ${row.user_id}`);
  }

  // Get student_profile_id from profile_id
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .maybeSingle();

  if (!studentProfile) {
    throw new Error(`Student profile not found for user_id: ${row.user_id}`);
  }

  // Resolve course_id
  let courseId: string;
  if (row.course_id) {
    courseId = row.course_id;
  } else if (row.course_slug) {
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', row.course_slug)
      .maybeSingle();

    if (!course) {
      throw new Error(`Course not found for slug: ${row.course_slug}`);
    }
    courseId = course.id;
  } else {
    throw new Error('Either course_id or course_slug is required');
  }

  // Upsert enrollment
  const { error } = await supabase
    .from('course_enrollments')
    .upsert({
      course_id: courseId,
      student_profile_id: studentProfile.id,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'course_id,student_profile_id',
    });

  if (error) {
    throw new Error(`Failed to upsert enrollment: ${error.message}`);
  }
}
