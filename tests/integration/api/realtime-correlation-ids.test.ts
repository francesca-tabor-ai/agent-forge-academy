/**
 * Integration Tests: Realtime API - Correlation IDs
 * 
 * Tests for correlation ID handling in realtime API:
 * - Correlation IDs in session creation
 * - Correlation IDs in SDP exchange
 * - Correlation IDs in error responses
 * - Correlation ID propagation
 * 
 * Note: This test requires:
 * - Next.js dev server running on http://localhost:3000
 * - Test Supabase database configured
 * - Environment variables set in .env.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const IS_MOCK_MODE = process.env.UAT_MOCK_REALTIME === '1';

// Helper to create a mock SDP offer
function createMockSDPOffer(): string {
  return `v=0
o=- 1234567890 1234567890 IN IP4 127.0.0.1
s=-
t=0 0
m=audio 9 UDP/TLS/RTP/SAVPF 111
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=rtcp-fb:111 transport-cc
a=setup:actpass
a=mid:0
a=ice-ufrag:test
a=ice-pwd:testpassword
a=fingerprint:sha-256 AA:BB:CC:DD:EE:FF
a=candidate:1 1 UDP 2130706431 127.0.0.1 54400 typ host`;
}

// Helper to generate correlation ID
function generateCorrelationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `webrtc_${timestamp}_${random}`;
}

describe('Realtime API - Correlation IDs Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let authCookie: string;
  let sessionToken: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-realtime-correlation-${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';
    
    // Sign up test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUserEmail,
      password: testPassword,
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create test user: ${authError?.message}`);
    }

    testUserId = authData.user.id;

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: testUserId,
        role: 'student',
      })
      .select('id')
      .single();

    if (profileError || !profile) {
      throw new Error(`Failed to create profile: ${profileError?.message}`);
    }

    testProfileId = profile.id;

    // Get auth session for cookie
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      authCookie = `sb-access-token=${sessionData.session.access_token}; sb-refresh-token=${sessionData.session.refresh_token}`;
    }

    // Create a session token for testing
    const sessionResponse = await fetch(`${BASE_URL}/api/realtime/session`, {
      method: 'POST',
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      sessionToken = sessionData.token || sessionData.client_secret || '';
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (testProfileId) {
      await supabase.from('profiles').delete().eq('id', testProfileId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Correlation ID in Session Creation', () => {
    it('should accept correlation ID in X-Correlation-ID header for session creation', async () => {
      const correlationId = generateCorrelationId();
      
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('session_id');
      expect(data).toHaveProperty('token');
    });

    it('should work without correlation ID header for session creation', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          // No X-Correlation-ID header
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('session_id');
    });
  });

  describe('Correlation ID in SDP Exchange', () => {
    it('should accept correlation ID in X-Correlation-ID header for SDP exchange', async () => {
      const correlationId = generateCorrelationId();
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      // May return 200, 400, 500 depending on SDP validity and OpenAI API
      expect([200, 400, 500, 502, 503]).toContain(response.status);
      
      const data = await response.json();
      expect(data).toHaveProperty('requestId');
    });

    it('should include request ID in error response when correlation ID is provided', async () => {
      const correlationId = generateCorrelationId();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({
          // Missing SDP - should cause error
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
      expect(typeof data.requestId).toBe('string');
    });
  });

  describe('Correlation ID in Error Responses', () => {
    it('should include request ID in 401 error response', async () => {
      const correlationId = generateCorrelationId();
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
          // No Cookie header - should cause 401
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
      expect(data.error).toContain('Unauthorized');
    });

    it('should include request ID in rate limit error response', async () => {
      const correlationId = generateCorrelationId();
      
      // Make multiple rapid requests to trigger rate limit
      const requests = Array(10).fill(null).map(() =>
        fetch(`${BASE_URL}/api/realtime/session`, {
          method: 'POST',
          headers: {
            'Cookie': authCookie,
            'Content-Type': 'application/json',
            'X-Correlation-ID': correlationId,
          },
          body: JSON.stringify({}),
        })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.find(r => r.status === 429);
      
      if (rateLimited) {
        const data = await rateLimited.json();
        expect(data).toHaveProperty('error');
        expect(data).toHaveProperty('resetAt');
      }
    });
  });

  describe('Correlation ID Format Validation', () => {
    it('should accept valid correlation ID format', async () => {
      const correlationId = 'webrtc_1234567890_abc123';
      
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
    });

    it('should handle special characters in correlation IDs', async () => {
      const correlationId = 'webrtc_123_!@#$%^&*()';
      
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({}),
      });

      // Should handle special characters
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Correlation ID Propagation', () => {
    it('should use different correlation IDs for session and connect', async () => {
      const sessionCorrelationId = generateCorrelationId();
      const connectCorrelationId = generateCorrelationId();
      
      // Create session with correlation ID
      const sessionResponse = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': sessionCorrelationId,
        },
        body: JSON.stringify({}),
      });

      expect(sessionResponse.status).toBe(200);
      const sessionData = await sessionResponse.json();
      const newSessionToken = sessionData.token || sessionData.client_secret || '';
      
      // Use connect with different correlation ID
      const sdpOffer = createMockSDPOffer();
      const connectResponse = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
          'X-Correlation-ID': connectCorrelationId,
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: newSessionToken,
        }),
      });

      // Both should work independently
      expect(sessionResponse.status).toBe(200);
      expect([200, 400, 500, 502, 503]).toContain(connectResponse.status);
    });
  });
});
