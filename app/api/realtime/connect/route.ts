import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';

/**
 * POST /api/realtime/connect
 * 
 * Proxies WebRTC SDP offer to OpenAI Realtime API and returns SDP answer.
 * This endpoint ensures the OpenAI API key is never exposed to the client.
 * 
 * Security:
 * - Requires user authentication
 * - Uses server's OpenAI API key
 * - Validates session token (if implemented)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { sdp, session_token } = body;

    if (!sdp) {
      return NextResponse.json(
        { error: 'SDP offer is required' },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!OPENAI_API_KEY) {
      safeLogger.error('OpenAI API key not configured for Realtime API');
      return NextResponse.json(
        { error: 'Realtime API is not configured' },
        { status: 500 }
      );
    }

    // Optional: Validate session token here
    // For now, we'll skip token validation but add a TODO

    // Forward SDP offer to OpenAI Realtime API
    // OpenAI Realtime API endpoint: https://api.openai.com/v1/realtime/calls
    const response = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/sdp',
      },
      body: sdp,
    });

    if (!response.ok) {
      const errorText = await response.text();
      safeLogger.error('Failed to connect to OpenAI Realtime API', {
        status: response.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to connect to OpenAI Realtime API' },
        { status: response.status }
      );
    }

    // Get SDP answer from OpenAI
    const sdpAnswer = await response.text();

    // Return SDP answer to client
    return NextResponse.json({
      sdp: sdpAnswer,
    });
  } catch (error) {
    safeLogger.error('Error connecting to OpenAI Realtime API', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to OpenAI Realtime API' },
      { status: 500 }
    );
  }
}
