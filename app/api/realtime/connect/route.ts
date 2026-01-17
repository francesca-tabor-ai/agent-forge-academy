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
  // Generate requestId for observability
  // In mock mode, use deterministic request ID for testing
  const isMockMode = process.env.UAT_MOCK_AI === '1';
  const reqId = isMockMode 
    ? 'mock-req-realtime-connect-12345' 
    : `realtime-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    // Authenticate user
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      // Structured logging: authentication error
      safeLogger.error('[RealtimeConnect] Auth error', {
        requestId: reqId,
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        path: '/api/realtime/connect',
        method: 'POST',
        errorMessage: authError.message, // Error reason without leaking keys
        authErrorCode: authError.status,
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication failed',
          requestId: reqId,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined,
        },
        { status: 401 }
      );
    }

    if (!user) {
      // Structured logging: no user session
      safeLogger.error('[RealtimeConnect] No user session', { 
        requestId: reqId,
        statusCode: 401,
        errorCode: 'UNAUTHORIZED',
        path: '/api/realtime/connect',
        method: 'POST',
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'User session not found',
          requestId: reqId,
        },
        { status: 401 }
      );
    }

    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      // Structured logging: invalid JSON body
      safeLogger.error('[RealtimeConnect] Invalid JSON body', {
        requestId: reqId,
        statusCode: 400,
        errorCode: 'BAD_REQUEST',
        path: '/api/realtime/connect',
        method: 'POST',
        errorMessage: parseError instanceof Error ? parseError.message : 'Unknown parse error',
      });
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
          requestId: reqId,
        },
        { status: 400 }
      );
    }

    const { sdp, session_token } = body;

    // UAT Mock Mode: Return deterministic response for testing
    if (isMockMode) {
      // Check if we should simulate unavailable (for testing fallback)
      const simulateUnavailable = process.env.UAT_MOCK_REALTIME_UNAVAILABLE === '1';
      
      if (simulateUnavailable) {
        // Structured logging: mock mode unavailable
        safeLogger.info('[RealtimeConnect] Mock mode: Simulating unavailable', { 
          requestId: reqId, 
          userId: user.id,
          statusCode: 503,
          errorCode: 'SERVICE_UNAVAILABLE',
          path: '/api/realtime/connect',
          method: 'POST',
          mockMode: true,
        });
        return NextResponse.json(
          { 
            error: 'Realtime service unavailable',
            message: 'Realtime API is temporarily unavailable (mock mode)',
            requestId: reqId,
            details: 'This is a mock response for UAT testing',
          },
          { status: 503 }
        );
      }
      
      // Return mock successful connection
      safeLogger.info('[RealtimeConnect] Mock mode: Returning mock SDP answer', { reqId, userId: user.id });
      return NextResponse.json({
        sdp: `v=0\r\no=- ${Date.now()} ${Date.now()} IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS mock-stream\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:mock\r\na=ice-pwd:mockpwd123456789012345678901234567890\r\na=fingerprint:sha-256 AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99\r\na=setup:actpass\r\na=mid:0\r\na=sendonly\r\na=rtcp-mux\r\na=rtpmap:111 opus/48000/2\r\n`,
        session_id: session_token || 'mock-session-123',
      });
    }

    // Validate required fields
    if (!sdp) {
      // Structured logging: missing SDP offer
      safeLogger.error('[RealtimeConnect] Missing SDP offer', {
        requestId: reqId,
        userId: user.id,
        statusCode: 400,
        errorCode: 'BAD_REQUEST',
        path: '/api/realtime/connect',
        method: 'POST',
        hasSessionToken: !!session_token,
      });
      return NextResponse.json(
        { 
          error: 'SDP offer is required',
          message: 'SDP offer field is missing from request body',
          requestId: reqId,
        },
        { status: 400 }
      );
    }

    // Validate SDP format
    if (typeof sdp !== 'string' || !sdp.trim()) {
      // Structured logging: invalid SDP format
      safeLogger.error('[RealtimeConnect] Invalid SDP format', {
        requestId: reqId,
        userId: user.id,
        statusCode: 400,
        errorCode: 'BAD_REQUEST',
        path: '/api/realtime/connect',
        method: 'POST',
        sdpType: typeof sdp,
        sdpLength: sdp?.length || 0,
      });
      return NextResponse.json(
        { 
          error: 'Invalid SDP offer format',
          message: 'SDP offer must be a non-empty string',
          requestId: reqId,
        },
        { status: 400 }
      );
    }

    // Get OpenAI API key from environment
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    if (!OPENAI_API_KEY) {
      // Structured logging: API key not configured
      safeLogger.error('[RealtimeConnect] OpenAI API key not configured', {
        requestId: reqId,
        userId: user.id,
        statusCode: 500,
        errorCode: 'SERVICE_UNAVAILABLE',
        path: '/api/realtime/connect',
        method: 'POST',
        // Don't log API key presence in production
        hasOpenAIKey: process.env.NODE_ENV === 'development' ? !!process.env.OPENAI_API_KEY : undefined,
        hasLLMKey: process.env.NODE_ENV === 'development' ? !!process.env.LLM_API_KEY : undefined,
      });
      return NextResponse.json(
        { 
          error: 'Realtime API is not configured',
          message: 'OpenAI API key is missing. Please configure OPENAI_API_KEY or LLM_API_KEY environment variable.',
          requestId: reqId,
        },
        { status: 500 }
      );
    }

    // Optional: Validate session token here
    // For now, we'll skip token validation but add a TODO

    // Forward SDP offer to OpenAI Realtime API
    // OpenAI Realtime API WebRTC endpoint
    // According to OpenAI docs: https://platform.openai.com/docs/guides/realtime-webrtc
    const REALTIME_ENDPOINT = 'https://api.openai.com/v1/realtime/calls';
    
    try {
      // Structured logging: connection attempt
      safeLogger.info('[RealtimeConnect] Attempting connection to OpenAI', {
        requestId: reqId,
        userId: user.id,
        path: '/api/realtime/connect',
        method: 'POST',
        sdpLength: sdp.length,
        hasSessionToken: !!session_token,
        endpoint: REALTIME_ENDPOINT,
      });

      const response = await fetch(REALTIME_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`, // Use server's API key
          'Content-Type': 'application/sdp',
          // Include session info if available
          ...(session_token && { 'X-Session-Token': session_token }),
        },
        body: sdp, // Send SDP offer as plain text (not JSON)
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
        
        // Return appropriate status code based on OpenAI's response
        const statusCode = response.status >= 400 && response.status < 500 
          ? response.status 
          : 500;
        
        // Structured logging: OpenAI API error
        safeLogger.error('[RealtimeConnect] OpenAI API returned error', {
          requestId: reqId,
          userId: user.id,
          statusCode: statusCode,
          errorCode: statusCode === 400 ? 'BAD_REQUEST' :
                     statusCode === 401 ? 'UNAUTHORIZED' :
                     statusCode === 429 ? 'RATE_LIMIT_EXCEEDED' : 'UPSTREAM_ERROR',
          path: '/api/realtime/connect',
          method: 'POST',
          upstreamStatus: response.status,
          upstreamStatusText: response.statusText,
          errorMessage: errorMessage, // Error reason without leaking keys
          hasSdp: !!sdp,
          sdpLength: sdp?.length || 0,
          // Don't log API key presence in production
          hasOpenAIKey: process.env.NODE_ENV === 'development' ? !!OPENAI_API_KEY : undefined,
          endpoint: REALTIME_ENDPOINT,
        });
        
        return NextResponse.json(
          { 
            error: 'Failed to connect to OpenAI Realtime API',
            message: statusCode === 400
              ? 'Invalid connection request. Please check your SDP offer format.'
              : statusCode === 401
              ? 'OpenAI API authentication failed. Please check API key configuration.'
              : statusCode === 429
              ? 'Rate limit exceeded. Please try again later.'
              : process.env.NODE_ENV === 'development'
              ? `${response.status}: ${errorMessage}`
              : 'Realtime connection failed. Please try again.',
            requestId: reqId,
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
          },
          { status: statusCode }
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

      safeLogger.info('[RealtimeConnect] WebRTC SDP exchange successful', {
        reqId,
        userId: user.id,
        sdpAnswerLength: sdpAnswer.length,
        hasAudio: false, // Never log raw audio
      });

      // Return SDP answer to client
      return NextResponse.json({
        sdp: sdpAnswer,
      });
    } catch (error: any) {
      // Structured logging: network error
      safeLogger.error('[RealtimeConnect] Network error connecting to OpenAI', {
        requestId: reqId,
        userId: user.id,
        statusCode: 500,
        errorCode: 'NETWORK_ERROR',
        path: '/api/realtime/connect',
        method: 'POST',
        errorMessage: error.message, // Error reason without leaking keys
        errorName: error.name,
        endpoint: REALTIME_ENDPOINT,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to connect to OpenAI Realtime API',
          message: error.message?.includes('fetch')
            ? 'Network error connecting to OpenAI. Please check your internet connection.'
            : process.env.NODE_ENV === 'development'
            ? error.message
            : 'Realtime connection error. Please try again.',
          requestId: reqId,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Structured logging: unexpected error
    safeLogger.error('[RealtimeConnect] Unexpected error', {
      requestId: reqId,
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      path: '/api/realtime/connect',
      method: 'POST',
      errorMessage: errorMessage,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    });
      return NextResponse.json(
        { 
          error: 'Failed to connect to OpenAI Realtime API',
          message: errorMessage,
          requestId: reqId,
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
  }
}
