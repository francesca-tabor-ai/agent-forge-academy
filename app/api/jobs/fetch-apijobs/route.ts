import { NextRequest, NextResponse } from 'next/server';
import { safeLogger } from '@/lib/utils/redactPII';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Test endpoint for APIJobs API integration
 * Fetches jobs from APIJobs external API
 * 
 * Query Parameters:
 * - q: Search query (default: 'software engineer')
 * - location: Location filter (optional)
 * - remote: Set to 'true' for remote jobs (optional)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  const requestId = `apijobs-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  try {
    const apiKey = process.env.APIJOBS_API_KEY;

    if (!apiKey) {
      safeLogger.error(`[${requestId}] APIJOBS_API_KEY not configured`);
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'CONFIG_ERROR',
            message: 'APIJOBS_API_KEY not configured. Please add it to environment variables.',
          },
          requestId,
        },
        { status: 500 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'software engineer';
    const location = searchParams.get('location') || '';
    const remote = searchParams.get('remote') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    safeLogger.info(`[${requestId}] APIJobs API request started`, {
      query,
      location,
      remote,
      page,
      limit,
    });

    // Build API request parameters
    // Note: Adjust the base URL and parameters based on actual APIJobs API documentation
    const apiParams = new URLSearchParams({
      query,
      page: page.toString(),
      limit: limit.toString(),
      ...(location && { location }),
      ...(remote && { remote: 'true' }),
    });

    // APIJobs API endpoint - adjust based on actual API documentation
    const apiUrl = `https://api.apijobs.dev/v1/jobs?${apiParams}`;

    safeLogger.info(`[${requestId}] Calling APIJobs API`, { url: apiUrl.replace(apiKey, '***') });

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Agent-Forge-Academy/1.0',
      },
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      safeLogger.error(`[${requestId}] APIJobs API error`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 500), // Limit error text length
        responseTime: `${responseTime}ms`,
      });

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'API_ERROR',
            message: `APIJobs API error: ${response.status} ${response.statusText}`,
            details: errorText.substring(0, 200),
          },
          requestId,
          responseTime: `${responseTime}ms`,
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const data = await response.json().catch((parseError) => {
      safeLogger.error(`[${requestId}] Failed to parse APIJobs response`, {
        error: parseError.message,
      });
      return null;
    });

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse APIJobs API response',
          },
          requestId,
          responseTime: `${responseTime}ms`,
        },
        { status: 502 }
      );
    }

    safeLogger.info(`[${requestId}] APIJobs API request completed`, {
      jobsCount: Array.isArray(data.jobs) ? data.jobs.length : data.data?.length || 0,
      total: data.total || data.count || 0,
      responseTime: `${responseTime}ms`,
    });

    // Normalize response format
    const jobs = Array.isArray(data.jobs) ? data.jobs : (Array.isArray(data.data) ? data.data : []);
    const total = data.total || data.count || jobs.length;

    return NextResponse.json({
      ok: true,
      jobs,
      total,
      page,
      limit,
      requestId,
      responseTime: `${responseTime}ms`,
      // Include raw response for debugging (remove in production if needed)
      ...(process.env.NODE_ENV === 'development' && { rawResponse: data }),
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Handle timeout errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      safeLogger.error(`[${requestId}] APIJobs API timeout`, {
        error: error.message,
        responseTime: `${responseTime}ms`,
      });

      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'TIMEOUT',
            message: 'APIJobs API request timed out',
          },
          requestId,
          responseTime: `${responseTime}ms`,
        },
        { status: 504 }
      );
    }

    safeLogger.error(`[${requestId}] APIJobs API unhandled error`, {
      error: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      responseTime: `${responseTime}ms`,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Internal server error',
        },
        requestId,
        responseTime: `${responseTime}ms`,
        // Only include error details in development
        ...(process.env.NODE_ENV === 'development' && {
          details: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}
