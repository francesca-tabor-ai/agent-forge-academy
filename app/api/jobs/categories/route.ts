import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/categories
 * Fetches active job categories for the "Best for" filter
 * Returns up to 15 categories ordered by display_order
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      );
    }

    // Fetch active job categories, limited to 15, ordered by display_order
    const { data: categories, error } = await supabase
      .from('job_categories')
      .select('id, name, slug, description, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(15);

    if (error) {
      console.error('Error fetching job categories:', error);
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Failed to fetch job categories'
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      categories: categories || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/jobs/categories:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
        },
      },
      { status: 500 }
    );
  }
}
