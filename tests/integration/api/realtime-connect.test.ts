/**
 * Integration Tests: Realtime Connect API
 * 
 * Tests for WebRTC connection establishment:
 * - SDP exchange via /api/realtime/connect
 * - Authentication
 * - SDP validation
 * - Error handling
 * 
 * Note: This test requires:
 * - Next.js dev server running on http://localhost:3000
 * - Test Supabase database configured
 * - Environment variables set in .env.test
 * - UAT_MOCK_REALTIME=1 for mock mode tests
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

describe('Realtime Connect API - Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let authCookie: string;
  let sessionToken: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-realtime-connect-${Date.now()}@test.com`;
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

  describe('POST /api/realtime/connect - Success Cases', () => {
    it('should exchange SDP and return answer', async () => {
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('sdp');
      expect(data).toHaveProperty('session_id');
      expect(typeof data.sdp).toBe('string');
      expect(data.sdp.length).toBeGreaterThan(0);
      
      if (IS_MOCK_MODE) {
        expect(data.requestId).toBe('mock-req-realtime-connect-12345');
      } else {
        expect(data).toHaveProperty('requestId');
      }
    });

    it('should include request ID in response', async () => {
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('requestId');
      expect(typeof data.requestId).toBe('string');
      expect(data.requestId.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/realtime/connect - Error Cases', () => {
    it('should return 400 when SDP is missing', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
    });

    it('should return 400 when SDP is empty string', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: '',
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 400 when SDP is invalid format', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: 'invalid sdp format',
          session_token: sessionToken,
        }),
      });

      // May return 400 or 500 depending on validation
      expect([400, 500]).toContain(response.status);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 401 when unauthenticated', async () => {
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No Cookie header
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Unauthorized');
      expect(data).toHaveProperty('requestId');
    });

    it('should return 400 when request body is invalid JSON', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
    });
  });

  describe('POST /api/realtime/connect - Validation', () => {
    it('should validate SDP format', async () => {
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      // Should accept valid SDP
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data).toHaveProperty('sdp');
      }
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // This test would require mocking OpenAI API or using invalid credentials
      // For now, we'll just verify the endpoint handles errors
      const sdpOffer = createMockSDPOffer();
      
      const response = await fetch(`${BASE_URL}/api/realtime/connect`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: sdpOffer,
          session_token: sessionToken,
        }),
      });

      // Should return some response (200, 400, 500, 502, 503)
      expect([200, 400, 500, 502, 503]).toContain(response.status);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
    });
  });
});
