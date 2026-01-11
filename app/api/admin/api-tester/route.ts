import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/api-tester
 * 
 * Proxies an internal API request for testing purposes.
 * Requires admin role.
 * 
 * Body:
 * {
 *   method: string (GET, POST, PUT, DELETE, etc.)
 *   path: string (must start with /api/)
 *   body?: string (JSON string for request body)
 * }
 * 
 * Returns:
 * {
 *   status: number
 *   body: any
 *   latency: number (milliseconds)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin role
    const adminResult = await requireAdmin();
    if (adminResult instanceof NextResponse) {
      return adminResult; // Returns 401 or 403
    }

    // Parse request body
    const body = await request.json();
    const { method, path, body: requestBody } = body;

    // Validate method
    if (!method || typeof method !== 'string') {
      return NextResponse.json(
        { error: 'Method is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate path
    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Path is required and must be a string' },
        { status: 400 }
      );
    }

    // Restrict paths to /api/* only
    if (!path.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Path must start with /api/' },
        { status: 400 }
      );
    }

    // Prevent testing the api-tester endpoint itself (infinite loop protection)
    if (path.startsWith('/api/admin/api-tester')) {
      return NextResponse.json(
        { error: 'Cannot test the api-tester endpoint itself' },
        { status: 400 }
      );
    }

    // Get base URL for internal request
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    request.nextUrl.origin;

    const targetUrl = `${baseUrl}${path}`;

    // Parse request body if provided
    let parsedBody: string | undefined;
    if (requestBody) {
      if (typeof requestBody === 'string') {
        // Validate JSON if it's a string
        try {
          JSON.parse(requestBody);
          parsedBody = requestBody;
        } catch {
          return NextResponse.json(
            { error: 'Request body must be valid JSON' },
            { status: 400 }
          );
        }
      } else {
        parsedBody = JSON.stringify(requestBody);
      }
    }

    // Prepare headers (forward auth cookies from original request)
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward cookies from the original request
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    // Measure latency
    const startTime = Date.now();

    try {
      // Make internal request
      const response = await fetch(targetUrl, {
        method: method.toUpperCase(),
        headers,
        body: parsedBody,
      });

      const latency = Date.now() - startTime;

      // Read response body
      let responseBody: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch {
          responseBody = await response.text();
        }
      } else {
        responseBody = await response.text();
      }

      return NextResponse.json({
        status: response.status,
        body: responseBody,
        latency,
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      
      return NextResponse.json({
        status: 500,
        body: {
          error: 'Failed to execute request',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        latency,
      });
    }
  } catch (error) {
    console.error('Error in api-tester handler:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
