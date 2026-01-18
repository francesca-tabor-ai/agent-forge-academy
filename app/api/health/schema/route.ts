import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health/schema
 * 
 * Health check endpoint that validates required database columns exist.
 * This helps catch schema mismatches early.
 * 
 * Returns:
 * - 200: All required columns exist
 * - 500: Schema validation failed
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();

    // Required columns for student_profiles table
    const requiredColumns = [
      'id',
      'profile_id',
      'visibility',
      'full_name',
      'headline',
      'bio',
      'skills',
      'location',
      'city',        // Critical for location parsing
      'country',     // Critical for location parsing
      'linkedin_url',
      'github_url',
      'website_url',
      'headshot_image_url',
    ];

    // Test query to verify columns exist
    // Using a SELECT with all required columns will fail if any are missing
    const { error } = await supabase
      .from('student_profiles')
      .select(requiredColumns.join(', '))
      .limit(0); // Don't fetch any rows, just validate the query

    if (error) {
      const errorMessage = error.message.toLowerCase();
      
      // Check if error is about missing columns
      const isColumnError = 
        errorMessage.includes('could not find') ||
        errorMessage.includes('does not exist') ||
        errorMessage.includes('column');

      if (isColumnError) {
        return NextResponse.json(
          {
            ok: false,
            status: 'schema_validation_failed',
            error: 'Required columns missing from student_profiles table',
            details: error.message,
            requiredColumns,
            suggestion: 'Run migrations and refresh schema cache',
          },
          { status: 500 }
        );
      }

      // Other database errors (connection, permissions, etc.)
      return NextResponse.json(
        {
          ok: false,
          status: 'database_error',
          error: error.message,
        },
        { status: 500 }
      );
    }

    // All columns exist
    return NextResponse.json(
      {
        ok: true,
        status: 'schema_valid',
        message: 'All required columns exist',
        validatedTable: 'student_profiles',
        validatedColumns: requiredColumns.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
