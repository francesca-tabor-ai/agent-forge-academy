import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/logs
 * 
 * Fetch request logs with filtering.
 * Requires admin role.
 * 
 * Query parameters:
 * - path: string (optional) - Filter by endpoint path (e.g., '/api/jobs')
 * - status: number (optional) - Filter by status code (e.g., 500)
 * - limit: number (optional, default: 100, max: 500) - Number of results
 * - offset: number (optional, default: 0) - Pagination offset
 * 
 * Returns:
 * - logs: Array of request log entries
 * - total: number - Total count (before pagination)
 * - offset: number - Current offset
 * - limit: number - Current limit
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const pathFilter = searchParams.get('path') || '';
    const statusFilter = searchParams.get('status');
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Build query
    let logsQuery = supabase
      .from('request_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (pathFilter) {
      logsQuery = logsQuery.eq('path', pathFilter);
    }

    if (statusFilter) {
      const statusCode = parseInt(statusFilter, 10);
      if (!isNaN(statusCode)) {
        logsQuery = logsQuery.eq('status', statusCode);
      }
    }

    // Get total count before pagination
    let countQuery = supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true });

    if (pathFilter) {
      countQuery = countQuery.eq('path', pathFilter);
    }

    if (statusFilter) {
      const statusCode = parseInt(statusFilter, 10);
      if (!isNaN(statusCode)) {
        countQuery = countQuery.eq('status', statusCode);
      }
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting logs:', countError);
    }

    // Apply pagination
    logsQuery = logsQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data: logs, error: logsError } = await logsQuery;

    if (logsError) {
      console.error('Error fetching logs:', logsError);
      return NextResponse.json(
        { error: 'Failed to fetch logs', details: logsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      offset,
      limit,
    });
  } catch (error) {
    console.error('Error in admin logs handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
