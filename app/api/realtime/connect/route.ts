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
    // OpenAI Realtime API WebRTC endpoint
    // Note: The exact endpoint may vary - check OpenAI's latest documentation
    const REALTIME_ENDPOINT = 'https://api.openai.com/v1/realtime/calls';
    
    try {
      const response = await fetch(REALTIME_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`, // Use server's API key
          'Content-Type': 'application/sdp',
          // Include session info if available
          ...(session_token && { 'X-Session-Token': session_token }),
        },
        body: sdp, // Send SDP offer as plain text
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to connect to OpenAI Realtime API';
        
        // Try to parse error JSON
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error?.message || errorJson.error || errorMessage;
        } catch {
          // If not JSON, use text as-is
          errorMessage = errorText || errorMessage;
        }
        
        safeLogger.error('Failed to connect to OpenAI Realtime API', {
          status: response.status,
          statusText: response.statusText,
          error: errorMessage,
          userId: user.id,
          hasSdp: !!sdp,
          sdpLength: sdp?.length || 0,
        });
        
        return NextResponse.json(
          { 
            error: 'Failed to connect to OpenAI Realtime API',
            message: process.env.NODE_ENV === 'development'
              ? `${response.status}: ${errorMessage}`
              : 'Realtime connection failed. Please try again.',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: response.status || 500 }
        );
      }

      // Get SDP answer from OpenAI
      // OpenAI returns SDP answer as plain text
      const sdpAnswer = await response.text();
      
      if (!sdpAnswer || !sdpAnswer.trim()) {
        safeLogger.error('Empty SDP answer from OpenAI', {
          userId: user.id,
          status: response.status,
        });
        return NextResponse.json(
          { error: 'Empty SDP answer from OpenAI' },
          { status: 500 }
        );
      }

      safeLogger.info('WebRTC SDP exchange successful', {
        userId: user.id,
        sdpAnswerLength: sdpAnswer.length,
        hasAudio: false, // Never log raw audio
      });

      // Return SDP answer to client
      return NextResponse.json({
        sdp: sdpAnswer,
      });
    } catch (error: any) {
      safeLogger.error('Error connecting to OpenAI Realtime API', {
        error: error.message,
        stack: error.stack,
        userId: user.id,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to connect to OpenAI Realtime API',
          message: process.env.NODE_ENV === 'development'
            ? error.message
            : 'Realtime connection error. Please try again.',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    safeLogger.error('Error connecting to OpenAI Realtime API', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect to OpenAI Realtime API' },
      { status: 500 }
    );
  }
}
