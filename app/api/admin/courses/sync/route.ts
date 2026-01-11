/**
 * API endpoint to sync course metadata from MD files to Supabase
 * Admin-only endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { syncCoursesToDatabase } from '@/lib/course-sync/sync-to-db';
import { extractAllCourseMetadata, validateAllCourseMetadata } from '@/lib/course-sync/extract-metadata';
import type { SyncOptions } from '@/lib/course-sync/types';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const userResult = await requireAdmin();
    if (userResult instanceof NextResponse) {
      return userResult; // Error response
    }

    // Parse request body for options
    const body = await request.json().catch(() => ({}));
    const options: SyncOptions = {
      dryRun: body.dryRun === true,
      deleteMissing: body.deleteMissing === true,
      skipValidation: body.skipValidation === true,
    };

    // Extract metadata
    const metadataSources = extractAllCourseMetadata();

    // Validate if not skipped
    if (!options.skipValidation) {
      const validations = validateAllCourseMetadata(metadataSources);
      const invalid = validations.filter((v) => !v.validation.valid);

      if (invalid.length > 0 && !options.dryRun) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            validationErrors: invalid.map(({ source, validation }) => ({
              course: source.courseSlug,
              errors: validation.errors,
              warnings: validation.warnings,
            })),
          },
          { status: 400 }
        );
      }
    }

    // Sync to database
    const supabase = createServerSupabaseClient();
    const result = await syncCoursesToDatabase(supabase, options);

    return NextResponse.json({
      success: true,
      result,
      options: {
        dryRun: options.dryRun,
        deleteMissing: options.deleteMissing,
      },
    });
  } catch (error) {
    console.error('Error syncing courses:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync courses',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to preview what would be synced (dry run)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const userResult = await requireAdmin();
    if (userResult instanceof NextResponse) {
      return userResult; // Error response
    }

    // Extract metadata
    const metadataSources = extractAllCourseMetadata();

    // Validate
    const validations = validateAllCourseMetadata(metadataSources);

    // Get database courses for comparison
    const supabase = createServerSupabaseClient();
    const { data: dbCourses } = await supabase
      .from('courses')
      .select('slug, title, description, thumbnail_url, duration_weeks, difficulty_level, is_published')
      .order('slug');

    // Compare
    const fileSlugs = new Set(metadataSources.map((s) => s.courseSlug));
    const dbSlugs = new Set((dbCourses || []).map((c: { slug: string }) => c.slug));

    const wouldCreate = metadataSources.filter((s) => !dbSlugs.has(s.courseSlug));
    const wouldUpdate = metadataSources.filter((s) => dbSlugs.has(s.courseSlug));
    const wouldDelete = (dbCourses || []).filter(
      (c: { slug: string }) => !fileSlugs.has(c.slug)
    );

    return NextResponse.json({
      preview: true,
      summary: {
        totalInFiles: metadataSources.length,
        totalInDatabase: dbCourses?.length || 0,
        wouldCreate: wouldCreate.length,
        wouldUpdate: wouldUpdate.length,
        wouldDelete: wouldDelete.length,
      },
      wouldCreate: wouldCreate.map((s) => ({
        slug: s.courseSlug,
        title: s.metadata.title,
        sourceFile: s.sourceFile,
      })),
      wouldUpdate: wouldUpdate.map((s) => ({
        slug: s.courseSlug,
        title: s.metadata.title,
        sourceFile: s.sourceFile,
      })),
      wouldDelete: wouldDelete.map((c: { slug: string; title: string }) => ({
        slug: c.slug,
        title: c.title,
      })),
      validations: validations.map(({ source, validation }) => ({
        course: source.courseSlug,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      })),
    });
  } catch (error) {
    console.error('Error previewing course sync:', error);
    return NextResponse.json(
      {
        error: 'Failed to preview course sync',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
