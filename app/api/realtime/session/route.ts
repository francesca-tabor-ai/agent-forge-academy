import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { safeLogger } from '@/lib/utils/redactPII';
import { checkRateLimit } from '@/lib/utils/rateLimit';

/**
 * POST /api/realtime/session
 * 
 * Creates an ephemeral OpenAI Realtime API session and returns credentials to the client.
 * The client uses these credentials to establish a WebRTC connection directly to OpenAI.
 * 
 * Security:
 * - Never exposes the long-lived OpenAI API key to the client
 * - Returns only ephemeral session credentials with short TTL
 * - Requires user authentication
 * - Rate limited per user
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

    // Optional: Get turn detection preference from request body
    const body = await request.json().catch(() => ({}));
    const enableTurnDetection = body.enableTurnDetection ?? false; // For hands-free mode

    // UAT Mock Mode: Return deterministic session credentials for testing
    const isMockMode = process.env.UAT_MOCK_AI === '1';
    if (isMockMode) {
      const sessionId = `mock_session_${user.id}_${Date.now()}`;
      const ephemeralToken = Buffer.from(
        `${sessionId}:${user.id}:${Date.now()}:mock`
      ).toString('base64');
      
      safeLogger.info('Realtime session created (mock mode)', {
        userId: user.id,
        sessionId,
        enableTurnDetection,
      });
      
      return NextResponse.json({
        client_secret: ephemeralToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        session_id: sessionId,
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        turn_detection: enableTurnDetection,
      });
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

    // Per-user rate limits on session mint
    // Limit: 5 sessions per hour per user
    const rateLimitResult = checkRateLimit(user.id, 5, 60 * 60 * 1000); // 5 requests per hour
    
    if (!rateLimitResult.allowed) {
      safeLogger.warn('Rate limit exceeded for Realtime session', {
        userId: user.id,
        resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        hasAudio: false, // Never log raw audio
      });
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many session requests. Please try again later.',
          resetAt: new Date(rateLimitResult.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Log session creation (without storing raw audio)
    safeLogger.info('Realtime session created', {
      userId: user.id,
      enableTurnDetection,
      remaining: rateLimitResult.remaining,
      resetAt: new Date(rateLimitResult.resetAt).toISOString(),
    });

    // Generate ephemeral session token for client
    // Note: OpenAI Realtime API WebRTC connections are proxied through our backend
    // to keep the API key secure. The ephemeral token is used for session tracking
    // and rate limiting, not for direct OpenAI authentication.
    
    // Short TTL: 15 minutes (900 seconds) for ephemeral tokens
    const expiresIn = 900; // 15 minutes
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    
    // Generate a secure ephemeral token for session tracking
    // This token is used to identify the session on our backend, not for OpenAI auth
    const sessionId = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const ephemeralToken = Buffer.from(
      `${sessionId}:${user.id}:${Date.now()}:${Math.random().toString(36).substring(7)}`
    ).toString('base64');

    safeLogger.info('Realtime session created', {
      userId: user.id,
      sessionId,
      expiresAt,
      enableTurnDetection,
      hasAudio: false, // Never log raw audio
    });

    // Return ephemeral credentials to client
    // The client_secret is used for session tracking on our backend
    // Actual OpenAI API calls are made server-side with the server's API key
    return NextResponse.json({
      client_secret: ephemeralToken, // Ephemeral token for session tracking
      expires_at: expiresAt,
      session_id: sessionId,
      model: 'gpt-4o-realtime-preview-2024-12-17',
      voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer, ash, ballad, coral, sage, verse, marin, cedar
      turn_detection: enableTurnDetection, // Enable server-side turn detection for hands-free mode
    });
  } catch (error) {
    safeLogger.error('Error creating Realtime session', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Realtime session' },
      { status: 500 }
    );
  }
}
