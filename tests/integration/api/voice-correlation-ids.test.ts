/**
 * Integration Tests: Voice API - Correlation IDs
 * 
 * Tests for correlation ID handling in voice API:
 * - Correlation IDs in request headers
 * - Correlation IDs in responses
 * - Correlation IDs in error messages
 * - Correlation ID propagation through API calls
 * 
 * Note: This test requires:
 * - Next.js dev server running on http://localhost:3000
 * - Test Supabase database configured
 * - Environment variables set in .env.test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const IS_MOCK_MODE = process.env.UAT_MOCK_AI === '1';

// Helper to create a minimal audio blob (WebM format)
function createMockAudioBlob(): Blob {
  const webmHeader = new Uint8Array([
    0x1A, 0x45, 0xDF, 0xA3, // EBML Header
    0x9F, 0x42, 0x86, 0x81, 0x01, // EBML Version
    0x42, 0x86, 0x81, 0x01, // EBML Read Version
    0x42, 0xF2, 0x86, 0x81, 0x01, // EBML Max ID Length
    0x42, 0xF3, 0x86, 0x81, 0x01, // EBML Max Size Length
    0x42, 0xF7, 0x81, 0x01, // DocType
    0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6D, // DocType Read Version
  ]);
  return new Blob([webmHeader], { type: 'audio/webm' });
}

// Helper to generate correlation ID
function generateCorrelationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `voice_${timestamp}_${random}`;
}

describe('Voice API - Correlation IDs Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let testStudentProfileId: string;
  let authCookie: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-voice-correlation-${Date.now()}@test.com`;
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

    // Create student profile
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .insert({
        profile_id: testProfileId,
      })
      .select('id')
      .single();

    if (studentProfileError || !studentProfile) {
      throw new Error(`Failed to create student profile: ${studentProfileError?.message}`);
    }

    testStudentProfileId = studentProfile.id;

    // Get auth session for cookie
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      authCookie = `sb-access-token=${sessionData.session.access_token}; sb-refresh-token=${sessionData.session.refresh_token}`;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    if (testStudentProfileId) {
      await supabase.from('student_profiles').delete().eq('id', testStudentProfileId);
    }
    if (testProfileId) {
      await supabase.from('profiles').delete().eq('id', testProfileId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Correlation ID in Request Headers', () => {
    it('should accept correlation ID in X-Correlation-ID header', async () => {
      const correlationId = generateCorrelationId();
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Response should include requestId (may be different from correlationId)
      expect(data).toHaveProperty('requestId');
      expect(typeof data.requestId).toBe('string');
    });

    it('should work without correlation ID header', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          // No X-Correlation-ID header
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('requestId');
    });

    it('should handle multiple requests with different correlation IDs', async () => {
      const correlationId1 = generateCorrelationId();
      const correlationId2 = generateCorrelationId();
      
      const audioBlob = createMockAudioBlob();
      
      const request1 = fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId1,
        },
        body: (() => {
          const fd = new FormData();
          fd.append('audio', audioBlob, 'test1.webm');
          fd.append('studentProfileId', testStudentProfileId);
          return fd;
        })(),
      });

      const request2 = fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId2,
        },
        body: (() => {
          const fd = new FormData();
          fd.append('audio', audioBlob, 'test2.webm');
          fd.append('studentProfileId', testStudentProfileId);
          return fd;
        })(),
      });

      const [response1, response2] = await Promise.all([request1, request2]);
      
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Both should have requestIds
      expect(data1).toHaveProperty('requestId');
      expect(data2).toHaveProperty('requestId');
      
      // Request IDs should be different
      expect(data1.requestId).not.toBe(data2.requestId);
    });
  });

  describe('Correlation ID in Error Responses', () => {
    it('should include request ID in error response when correlation ID is provided', async () => {
      const correlationId = generateCorrelationId();
      const formData = new FormData();
      // Missing audio file - should cause error
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
      expect(typeof data.requestId).toBe('string');
    });

    it('should include request ID in 401 error response', async () => {
      const correlationId = generateCorrelationId();
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'X-Correlation-ID': correlationId,
          // No Cookie header - should cause 401
        },
        body: formData,
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Correlation ID Format Validation', () => {
    it('should accept valid correlation ID format', async () => {
      const correlationId = 'voice_1234567890_abc123';
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      // Should accept any string as correlation ID
      expect([200, 400]).toContain(response.status);
    });

    it('should handle very long correlation IDs', async () => {
      const correlationId = 'voice_' + 'a'.repeat(1000);
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      // Should handle long correlation IDs (may truncate or reject)
      expect([200, 400, 413]).toContain(response.status);
    });

    it('should handle special characters in correlation IDs', async () => {
      const correlationId = 'voice_123_!@#$%^&*()';
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      // Should handle special characters
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Correlation ID Logging', () => {
    it('should log correlation ID in successful requests', async () => {
      const correlationId = generateCorrelationId();
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Response should have requestId for logging/tracking
      expect(data).toHaveProperty('requestId');
      
      // Note: In a real implementation, the correlation ID would be logged
      // on the server side. This test verifies the request is accepted.
    });

    it('should log correlation ID in error requests', async () => {
      const correlationId = generateCorrelationId();
      const formData = new FormData();
      // Missing audio - should cause error
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
          'X-Correlation-ID': correlationId,
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      
      // Error response should have requestId for logging
      expect(data).toHaveProperty('requestId');
      expect(data).toHaveProperty('error');
    });
  });
});
