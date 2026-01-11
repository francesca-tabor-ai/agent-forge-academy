import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/diagnostics
 * 
 * Runs diagnostics on critical API endpoints.
 * Requires admin role.
 * 
 * Returns:
 * - diagnostics: Array of { endpoint, status, requestId, latency, error? }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    request.nextUrl.origin;

    const diagnostics: Array<{
      endpoint: string;
      status: 'pass' | 'fail';
      requestId?: string;
      latency: number;
      error?: string;
    }> = [];

    // Test /api/jobs
    try {
      const jobsStart = Date.now();
      const jobsResponse = await fetch(`${baseUrl}/api/jobs`, {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });
      const jobsLatency = Date.now() - jobsStart;
      const jobsData = await jobsResponse.json();

      diagnostics.push({
        endpoint: '/api/jobs',
        status: jobsResponse.ok ? 'pass' : 'fail',
        requestId: jobsData.requestId || undefined,
        latency: jobsLatency,
        error: jobsResponse.ok ? undefined : jobsData.error?.message || `HTTP ${jobsResponse.status}`,
      });
    } catch (error) {
      diagnostics.push({
        endpoint: '/api/jobs',
        status: 'fail',
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test /api/portfolio/profile
    try {
      const profileStart = Date.now();
      const profileResponse = await fetch(`${baseUrl}/api/portfolio/profile`, {
        method: 'GET',
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      });
      const profileLatency = Date.now() - profileStart;
      const profileData = await profileResponse.json().catch(() => ({}));

      diagnostics.push({
        endpoint: '/api/portfolio/profile',
        status: profileResponse.ok ? 'pass' : 'fail',
        requestId: profileData.requestId || undefined,
        latency: profileLatency,
        error: profileResponse.ok ? undefined : profileData.error?.message || `HTTP ${profileResponse.status}`,
      });
    } catch (error) {
      diagnostics.push({
        endpoint: '/api/portfolio/profile',
        status: 'fail',
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Test /api/ai-advisor/chat (with minimal payload)
    try {
      const advisorStart = Date.now();
      const advisorResponse = await fetch(`${baseUrl}/api/ai-advisor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          message: 'test',
          studentProfileId: null,
          conversationHistory: [],
        }),
      });
      const advisorLatency = Date.now() - advisorStart;
      const advisorData = await advisorResponse.json().catch(() => ({}));

      // Consider 401/403 as expected (unauthorized), but still log it
      const isExpectedError = advisorResponse.status === 401 || advisorResponse.status === 403;
      
      diagnostics.push({
        endpoint: '/api/ai-advisor/chat',
        status: advisorResponse.ok || isExpectedError ? 'pass' : 'fail',
        requestId: advisorData.requestId || advisorData.error?.requestId || undefined,
        latency: advisorLatency,
        error: advisorResponse.ok || isExpectedError 
          ? undefined 
          : advisorData.error?.message || `HTTP ${advisorResponse.status}`,
      });
    } catch (error) {
      diagnostics.push({
        endpoint: '/api/ai-advisor/chat',
        status: 'fail',
        latency: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allPassed = diagnostics.every(d => d.status === 'pass');

    return NextResponse.json({
      status: allPassed ? 'all_passed' : 'some_failed',
      diagnostics,
    });
  } catch (error) {
    console.error('Error in admin diagnostics handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
