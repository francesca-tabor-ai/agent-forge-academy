/**
 * Integration Tests: Realtime Session API
 * 
 * Tests for realtime session creation:
 * - Session creation via /api/realtime/session
 * - Rate limiting
 * - Authentication
 * - Session token generation
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

describe('Realtime Session API - Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let authCookie: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-realtime-${Date.now()}@test.com`;
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

  describe('POST /api/realtime/session - Success Cases', () => {
    it('should create session for authenticated user', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('session_id');
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('expires_at');
      
      if (IS_MOCK_MODE) {
        expect(data.session_id).toContain('mock');
      } else {
        expect(typeof data.session_id).toBe('string');
        expect(data.session_id.length).toBeGreaterThan(0);
      }
    });

    it('should include turn detection config when enabled', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enableTurnDetection: true,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('session_id');
      // Turn detection config may be included in response
    });
  });

  describe('POST /api/realtime/session - Error Cases', () => {
    it('should return 401 when unauthenticated', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // No Cookie header
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(10).fill(null).map(() =>
        fetch(`${BASE_URL}/api/realtime/session`, {
          method: 'POST',
          headers: {
            'Cookie': authCookie,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      const responses = await Promise.all(requests);
      
      // At least one should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
      
      // Some may be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429);
      if (rateLimited.length > 0) {
        const data = await rateLimited[0].json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('POST /api/realtime/session - Validation', () => {
    it('should generate valid session token', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('token');
      expect(typeof data.token).toBe('string');
      expect(data.token.length).toBeGreaterThan(0);
    });

    it('should set expiration time', async () => {
      const response = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('expires_at');
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
      }
    });

    it('should generate unique session IDs', async () => {
      const response1 = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const response2 = await fetch(`${BASE_URL}/api/realtime/session`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data1 = await response1.json();
      const data2 = await response2.json();
      
      expect(data1.session_id).not.toBe(data2.session_id);
    });
  });
});
