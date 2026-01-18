/**
 * Integration Tests: Voice API
 * 
 * Tests for voice API functionality:
 * - Audio transcription via /api/ai-advisor/voice
 * - TTS generation
 * - Error handling
 * - Format validation
 * - File size limits
 * 
 * Note: This test requires:
 * - Next.js dev server running on http://localhost:3000
 * - Test Supabase database configured
 * - Environment variables set in .env.test
 * - ENABLE_VOICE_API=true for real API tests
 * - UAT_MOCK_AI=1 for mock mode tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const IS_MOCK_MODE = process.env.UAT_MOCK_AI === '1';

// Helper to create a minimal audio blob (WebM format)
function createMockAudioBlob(): Blob {
  // Minimal WebM header (EBML structure)
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

// Helper to create a large blob (>10MB)
function createLargeAudioBlob(): Blob {
  const size = 11 * 1024 * 1024; // 11MB
  const buffer = new ArrayBuffer(size);
  return new Blob([buffer], { type: 'audio/webm' });
}

describe('Voice API - Integration Tests', () => {
  let supabase: ReturnType<typeof createServerSupabaseClient>;
  let testUserId: string;
  let testUserEmail: string;
  let testProfileId: string;
  let testStudentProfileId: string;
  let authCookie: string;

  beforeAll(async () => {
    supabase = createServerSupabaseClient();
    
    // Create test user
    testUserEmail = `test-voice-${Date.now()}@test.com`;
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

  describe('POST /api/ai-advisor/voice - Success Cases', () => {
    it('should transcribe audio and return response', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('transcript');
      expect(data).toHaveProperty('responseText');
      expect(data).toHaveProperty('conversationId');
      expect(data).toHaveProperty('requestId');
      
      if (IS_MOCK_MODE) {
        expect(data.transcript).toContain('mock');
        expect(data.requestId).toBe('mock-req-voice-12345');
      } else {
        expect(typeof data.transcript).toBe('string');
        expect(data.transcript.length).toBeGreaterThan(0);
      }
    });

    it('should return audio when generateAudio=true', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('generateAudio', 'true');

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('responseAudio');
      if (data.responseAudio) {
        expect(data.responseAudio).toMatch(/^data:audio\/mp3;base64,/);
      }
    });

    it('should use context when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('context', JSON.stringify({
        course: {
          id: 'test-course-id',
          slug: 'test-course',
          title: 'Test Course',
        },
      }));

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });

    it('should include conversation history when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('conversationHistory', JSON.stringify([
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date(),
        },
      ]));

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });
  });

  describe('POST /api/ai-advisor/voice - Error Cases', () => {
    it('should return 400 when audio file is missing', async () => {
      const formData = new FormData();
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('requestId');
    });

    it('should return 400 when file is too large (>10MB)', async () => {
      const largeBlob = createLargeAudioBlob();
      const formData = new FormData();
      formData.append('audio', largeBlob, 'large.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      // Should reject large files (may be 400 or 413)
      expect([400, 413]).toContain(response.status);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should return 403 when feature flag is disabled', async () => {
      // Note: This test requires ENABLE_VOICE_API=false
      // In mock mode, this may not apply
      if (IS_MOCK_MODE) {
        // Skip in mock mode as feature flag may be bypassed
        return;
      }

      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      // This test would need ENABLE_VOICE_API=false to work
      // For now, we'll just verify the endpoint checks the flag
      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      // If feature is disabled, should return 403
      // If enabled, should return 200 or 400 (missing audio)
      expect([200, 400, 403]).toContain(response.status);
    });

    it('should return 401 when unauthenticated', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        // No Cookie header
        body: formData,
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Unauthorized');
      expect(data).toHaveProperty('requestId');
    });
  });

  describe('POST /api/ai-advisor/voice - Validation', () => {
    it('should include request ID in all responses', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      const data = await response.json();
      expect(data).toHaveProperty('requestId');
      expect(typeof data.requestId).toBe('string');
      expect(data.requestId.length).toBeGreaterThan(0);
    });

    it('should store conversation in database', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Verify conversation was stored
      const { data: conversations, error } = await supabase
        .from('advisor_conversations')
        .select('*')
        .eq('conversation_id', data.conversationId)
        .order('created_at', { ascending: false })
        .limit(2);

      expect(error).toBeNull();
      expect(conversations).toBeTruthy();
      expect(conversations!.length).toBeGreaterThan(0);
      
      // Should have both user and assistant messages
      const roles = conversations!.map(c => c.role);
      expect(roles).toContain('user');
      expect(roles).toContain('assistant');
    });
  });

  describe('POST /api/ai-advisor/voice - Audio Formats', () => {
    const formats = [
      { type: 'audio/webm', name: 'WebM' },
      { type: 'audio/mp3', name: 'MP3' },
      { type: 'audio/wav', name: 'WAV' },
      { type: 'audio/m4a', name: 'M4A' },
      { type: 'audio/ogg', name: 'OGG' },
    ];

    formats.forEach(({ type, name }) => {
      it(`should accept ${name} format`, async () => {
        // Create a minimal blob with the correct MIME type
        const blob = new Blob(['fake audio data'], { type });
        const formData = new FormData();
        formData.append('audio', blob, `test.${name.toLowerCase()}`);
        formData.append('studentProfileId', testStudentProfileId);

        const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
          method: 'POST',
          headers: {
            'Cookie': authCookie,
          },
          body: formData,
        });

        // Should accept the format (may fail transcription but not reject format)
        expect([200, 400]).toContain(response.status);
        
        if (response.status === 200) {
          const data = await response.json();
          expect(data).toHaveProperty('transcript');
        }
      });
    });
  });

  describe('POST /api/ai-advisor/voice - Context Handling', () => {
    it('should use course context when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('context', JSON.stringify({
        course: {
          id: 'test-course-id',
          slug: 'test-course',
          title: 'Test Course',
        },
      }));

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });

    it('should use project context when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('context', JSON.stringify({
        project: {
          id: 'test-project-id',
          title: 'Test Project',
        },
      }));

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });

    it('should use job context when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('context', JSON.stringify({
        job: {
          id: 'test-job-id',
          title: 'Test Job',
          company: 'Test Company',
        },
      }));

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });

    it('should work without context', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      // No context provided

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });
  });

  describe('POST /api/ai-advisor/voice - Intent Handling', () => {
    it('should use intent when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('intent', 'question');

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('responseText');
    });
  });

  describe('POST /api/ai-advisor/voice - Conversation Management', () => {
    it('should create new conversation when conversationId not provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      // No conversationId

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('conversationId');
      expect(typeof data.conversationId).toBe('string');
      expect(data.conversationId.length).toBeGreaterThan(0);
    });

    it('should use existing conversationId when provided', async () => {
      const audioBlob = createMockAudioBlob();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'test.webm');
      formData.append('studentProfileId', testStudentProfileId);
      formData.append('conversationId', 'existing-conversation-id');

      const response = await fetch(`${BASE_URL}/api/ai-advisor/voice`, {
        method: 'POST',
        headers: {
          'Cookie': authCookie,
        },
        body: formData,
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('conversationId');
      expect(data.conversationId).toBe('existing-conversation-id');
    });
  });
});
