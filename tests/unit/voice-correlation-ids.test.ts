/**
 * Unit Tests: Voice Correlation IDs
 * 
 * Tests for correlation ID generation and handling:
 * - generateCorrelationId() for voice interactions
 * - generateCorrelationId() for WebRTC interactions
 * - Correlation ID format validation
 * - Correlation ID uniqueness
 */

import { describe, it, expect } from 'vitest';

/**
 * Generate a correlation ID for voice interactions
 * Format: voice_<timestamp>_<random>
 */
function generateVoiceCorrelationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `voice_${timestamp}_${random}`;
}

/**
 * Generate a correlation ID for WebRTC interactions
 * Format: webrtc_<timestamp>_<random>
 */
function generateWebRTCCorrelationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `webrtc_${timestamp}_${random}`;
}

describe('Voice Correlation IDs', () => {
  describe('generateVoiceCorrelationId', () => {
    it('should generate unique correlation IDs', () => {
      const id1 = generateVoiceCorrelationId();
      const id2 = generateVoiceCorrelationId();
      
      expect(id1).not.toBe(id2);
    });

    it('should have correct format', () => {
      const id = generateVoiceCorrelationId();
      const parts = id.split('_');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('voice');
      expect(parts[1]).toMatch(/^\d+$/); // Timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // Random string
      expect(parts[2].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeLessThanOrEqual(7); // substring(2, 9) = max 7 chars
    });

    it('should include timestamp', () => {
      const before = Date.now();
      const id = generateVoiceCorrelationId();
      const after = Date.now();
      
      const parts = id.split('_');
      const timestamp = parseInt(parts[1], 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should match expected regex pattern', () => {
      const id = generateVoiceCorrelationId();
      const pattern = /^voice_\d+_[a-z0-9]+$/;
      
      expect(id).toMatch(pattern);
    });

    it('should generate different IDs when called rapidly', () => {
      const ids = Array(100).fill(null).map(() => generateVoiceCorrelationId());
      const uniqueIds = new Set(ids);
      
      // Should have high uniqueness (allowing for rare collisions)
      expect(uniqueIds.size).toBeGreaterThan(95);
    });
  });

  describe('generateWebRTCCorrelationId', () => {
    it('should generate unique correlation IDs', () => {
      const id1 = generateWebRTCCorrelationId();
      const id2 = generateWebRTCCorrelationId();
      
      expect(id1).not.toBe(id2);
    });

    it('should have correct format', () => {
      const id = generateWebRTCCorrelationId();
      const parts = id.split('_');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toBe('webrtc');
      expect(parts[1]).toMatch(/^\d+$/); // Timestamp
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // Random string
      expect(parts[2].length).toBeGreaterThan(0);
      expect(parts[2].length).toBeLessThanOrEqual(7);
    });

    it('should include timestamp', () => {
      const before = Date.now();
      const id = generateWebRTCCorrelationId();
      const after = Date.now();
      
      const parts = id.split('_');
      const timestamp = parseInt(parts[1], 10);
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should match expected regex pattern', () => {
      const id = generateWebRTCCorrelationId();
      const pattern = /^webrtc_\d+_[a-z0-9]+$/;
      
      expect(id).toMatch(pattern);
    });

    it('should generate different IDs from voice correlation IDs', () => {
      const voiceId = generateVoiceCorrelationId();
      const webrtcId = generateWebRTCCorrelationId();
      
      expect(voiceId).not.toBe(webrtcId);
      expect(voiceId.startsWith('voice_')).toBe(true);
      expect(webrtcId.startsWith('webrtc_')).toBe(true);
    });
  });

  describe('Correlation ID Format Validation', () => {
    it('should validate voice correlation ID format', () => {
      const validId = 'voice_1234567890_abc123';
      const pattern = /^voice_\d+_[a-z0-9]+$/;
      
      expect(validId).toMatch(pattern);
    });

    it('should validate WebRTC correlation ID format', () => {
      const validId = 'webrtc_1234567890_abc123';
      const pattern = /^webrtc_\d+_[a-z0-9]+$/;
      
      expect(validId).toMatch(pattern);
    });

    it('should reject invalid correlation ID formats', () => {
      const invalidIds = [
        'invalid',
        'voice_',
        'voice_123',
        'voice_123_',
        '_123_abc',
        'voice_abc_123', // timestamp should be numeric
        'webrtc_abc_123',
      ];
      
      const voicePattern = /^voice_\d+_[a-z0-9]+$/;
      const webrtcPattern = /^webrtc_\d+_[a-z0-9]+$/;
      
      invalidIds.forEach(id => {
        expect(id).not.toMatch(voicePattern);
        expect(id).not.toMatch(webrtcPattern);
      });
    });
  });

  describe('Correlation ID Uniqueness', () => {
    it('should generate unique IDs even with same timestamp', () => {
      // Mock Date.now() to return same value
      const originalNow = Date.now;
      const fixedTime = 1234567890;
      Date.now = () => fixedTime;
      
      try {
        const id1 = generateVoiceCorrelationId();
        const id2 = generateVoiceCorrelationId();
        
        // Should still be different due to random component
        expect(id1).not.toBe(id2);
        expect(id1.split('_')[1]).toBe(id2.split('_')[1]); // Same timestamp
        expect(id1.split('_')[2]).not.toBe(id2.split('_')[2]); // Different random
      } finally {
        Date.now = originalNow;
      }
    });

    it('should handle rapid generation without collisions', () => {
      const ids = new Set<string>();
      const iterations = 1000;
      
      for (let i = 0; i < iterations; i++) {
        ids.add(generateVoiceCorrelationId());
      }
      
      // Should have very high uniqueness
      expect(ids.size).toBe(iterations);
    });
  });

  describe('Correlation ID Edge Cases', () => {
    it('should handle minimum timestamp', () => {
      const originalNow = Date.now;
      Date.now = () => 0;
      
      try {
        const id = generateVoiceCorrelationId();
        expect(id).toMatch(/^voice_0_[a-z0-9]+$/);
      } finally {
        Date.now = originalNow;
      }
    });

    it('should handle maximum timestamp', () => {
      const originalNow = Date.now;
      Date.now = () => Number.MAX_SAFE_INTEGER;
      
      try {
        const id = generateVoiceCorrelationId();
        expect(id).toMatch(/^voice_\d+_[a-z0-9]+$/);
        expect(id.split('_')[1]).toBe(String(Number.MAX_SAFE_INTEGER));
      } finally {
        Date.now = originalNow;
      }
    });

    it('should handle empty random string (edge case)', () => {
      // This is unlikely but testable
      const originalRandom = Math.random;
      let callCount = 0;
      Math.random = () => {
        callCount++;
        // Return value that produces empty string after substring(2, 9)
        return 0.0001; // Very small number
      };
      
      try {
        const id = generateVoiceCorrelationId();
        // Should still have valid format
        expect(id).toMatch(/^voice_\d+_/);
      } finally {
        Math.random = originalRandom;
      }
    });
  });
});
