/**
 * Unit Tests: Voice Utilities
 * 
 * Tests for voice-related utility functions:
 * - Audio format validation
 * - Request ID generation
 * - Error message formatting
 * - Audio duration estimation
 */

import { describe, it, expect } from 'vitest';

/**
 * Validates audio format
 */
function validateAudioFormat(mimeType: string): boolean {
  const validFormats = [
    'audio/webm',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/ogg',
  ];
  return validFormats.includes(mimeType);
}

/**
 * Generates a request ID for voice API
 */
function generateVoiceRequestId(): string {
  return `voice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Formats error message for voice API
 */
function formatVoiceErrorMessage(error: Error, requestId: string): string {
  return `${error.message} (Request ID: ${requestId})`;
}

/**
 * Estimates audio duration from blob size (rough estimate)
 */
function estimateAudioDuration(audioBlob: Blob): number | undefined {
  if (audioBlob.size === 0) {
    return undefined;
  }
  // Rough estimate: ~16KB per second for webm
  return Math.ceil(audioBlob.size / 16000);
}

describe('Voice Utilities', () => {
  describe('validateAudioFormat', () => {
    it('should accept valid audio formats', () => {
      expect(validateAudioFormat('audio/webm')).toBe(true);
      expect(validateAudioFormat('audio/mp3')).toBe(true);
      expect(validateAudioFormat('audio/wav')).toBe(true);
      expect(validateAudioFormat('audio/m4a')).toBe(true);
      expect(validateAudioFormat('audio/ogg')).toBe(true);
    });

    it('should reject invalid audio formats', () => {
      expect(validateAudioFormat('audio/invalid')).toBe(false);
      expect(validateAudioFormat('video/webm')).toBe(false);
      expect(validateAudioFormat('image/png')).toBe(false);
      expect(validateAudioFormat('')).toBe(false);
    });

    it('should handle case sensitivity', () => {
      // Should be case-sensitive (current implementation)
      expect(validateAudioFormat('AUDIO/WEBM')).toBe(false);
      expect(validateAudioFormat('Audio/Webm')).toBe(false);
    });
  });

  describe('generateVoiceRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateVoiceRequestId();
      const id2 = generateVoiceRequestId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^voice_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^voice_\d+_[a-z0-9]+$/);
    });

    it('should have correct format', () => {
      const id = generateVoiceRequestId();
      const parts = id.split('_');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('voice');
      expect(parts[1]).toMatch(/^\d+$/); // Timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // Random string
      expect(parts[2].length).toBeGreaterThan(0);
    });

    it('should include timestamp', () => {
      const before = Date.now();
      const id = generateVoiceRequestId();
      const after = Date.now();
      
      const parts = id.split('_');
      const timestamp = parseInt(parts[1], 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('formatVoiceErrorMessage', () => {
    it('should format error message with request ID', () => {
      const error = new Error('Transcription failed');
      const requestId = 'voice_1234567890_abc123';
      
      const formatted = formatVoiceErrorMessage(error, requestId);
      
      expect(formatted).toContain('Transcription failed');
      expect(formatted).toContain('Request ID: voice_1234567890_abc123');
    });

    it('should handle errors without message', () => {
      const error = new Error('');
      const requestId = 'voice_1234567890_abc123';
      
      const formatted = formatVoiceErrorMessage(error, requestId);
      
      expect(formatted).toContain('Request ID: voice_1234567890_abc123');
    });

    it('should include request ID in correct format', () => {
      const error = new Error('Test error');
      const requestId = 'test-request-id';
      
      const formatted = formatVoiceErrorMessage(error, requestId);
      
      expect(formatted).toBe('Test error (Request ID: test-request-id)');
    });
  });

  describe('estimateAudioDuration', () => {
    it('should estimate duration from blob size', () => {
      const size = 160000; // 160KB = ~10 seconds
      const blob = new Blob([new ArrayBuffer(size)], { type: 'audio/webm' });
      
      const duration = estimateAudioDuration(blob);
      
      expect(duration).toBe(10);
    });

    it('should return undefined for empty blob', () => {
      const blob = new Blob([], { type: 'audio/webm' });
      
      const duration = estimateAudioDuration(blob);
      
      expect(duration).toBeUndefined();
    });

    it('should round up duration', () => {
      const size = 16001; // Just over 1 second
      const blob = new Blob([new ArrayBuffer(size)], { type: 'audio/webm' });
      
      const duration = estimateAudioDuration(blob);
      
      expect(duration).toBe(2); // Rounded up
    });

    it('should handle small blobs', () => {
      const size = 1000; // Less than 1 second
      const blob = new Blob([new ArrayBuffer(size)], { type: 'audio/webm' });
      
      const duration = estimateAudioDuration(blob);
      
      expect(duration).toBe(1); // At least 1 second
    });
  });
});
