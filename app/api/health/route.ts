import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: 'agent-forge-academy',
      time: new Date().toISOString(),
    },
    { status: 200 }
  );
}

