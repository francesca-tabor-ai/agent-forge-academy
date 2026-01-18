import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/health
 * 
 * Basic health check endpoint.
 * For schema validation, use /api/health/schema
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'agent-forge-academy',
      time: new Date().toISOString(),
      endpoints: {
        basic: '/api/health',
        schema: '/api/health/schema',
      },
    },
    { status: 200 }
  );
}

