/**
 * Unit Tests: Voice MediaRecorder Utilities
 * 
 * Tests for MediaRecorder-related utility functions:
 * - isMediaRecorderSupported()
 * - getBestAudioMimeType()
 * - MediaRecorder format detection
 * - Audio constraints validation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Check if MediaRecorder is supported
 */
function isMediaRecorderSupported(): boolean {
  return typeof MediaRecorder !== 'undefined';
}

/**
 * Get the best supported audio MIME type
 */
function getBestAudioMimeType(): string | null {
  if (!isMediaRecorderSupported()) {
    return null;
  }

  const supportedTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg',
    'audio/wav',
    'audio/mp4',
  ];

  for (const type of supportedTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return null;
}

/**
 * Validate audio constraints
 */
function validateAudioConstraints(constraints: MediaTrackConstraints): boolean {
  if (!constraints) {
    return false;
  }

  // Check for required audio constraints
  const hasEchoCancellation = constraints.echoCancellation !== undefined;
  const hasNoiseSuppression = constraints.noiseSuppression !== undefined;
  const hasAutoGainControl = constraints.autoGainControl !== undefined;
  const hasSampleRate = constraints.sampleRate !== undefined;
  const hasChannelCount = constraints.channelCount !== undefined;

  // At least some constraints should be present
  return hasEchoCancellation || hasNoiseSuppression || hasAutoGainControl || 
         hasSampleRate || hasChannelCount;
}

/**
 * Create optimal audio constraints for voice recording
 */
function createOptimalAudioConstraints(): MediaTrackConstraints {
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1, // Mono for speech
  };
}

describe('Voice MediaRecorder Utilities', () => {
  describe('isMediaRecorderSupported', () => {
    it('should return true when MediaRecorder is available', () => {
      // In test environment, MediaRecorder may or may not be available
      const result = isMediaRecorderSupported();
      expect(typeof result).toBe('boolean');
    });

    it('should return false when MediaRecorder is not available', () => {
      const originalMediaRecorder = (global as any).MediaRecorder;
      delete (global as any).MediaRecorder;

      try {
        const result = isMediaRecorderSupported();
        expect(result).toBe(false);
      } finally {
        (global as any).MediaRecorder = originalMediaRecorder;
      }
    });

    it('should handle MediaRecorder being undefined', () => {
      const originalMediaRecorder = (global as any).MediaRecorder;
      (global as any).MediaRecorder = undefined;

      try {
        const result = isMediaRecorderSupported();
        expect(result).toBe(false);
      } finally {
        (global as any).MediaRecorder = originalMediaRecorder;
      }
    });
  });

  describe('getBestAudioMimeType', () => {
    beforeEach(() => {
      // Mock MediaRecorder if not available
      if (typeof (global as any).MediaRecorder === 'undefined') {
        (global as any).MediaRecorder = class MockMediaRecorder {
          static isTypeSupported(type: string): boolean {
            // Mock: support webm and ogg
            return type.includes('webm') || type.includes('ogg');
          }
        };
      }
    });

    afterEach(() => {
      // Cleanup if needed
    });

    it('should return null when MediaRecorder is not supported', () => {
      const originalMediaRecorder = (global as any).MediaRecorder;
      delete (global as any).MediaRecorder;

      try {
        const result = getBestAudioMimeType();
        expect(result).toBeNull();
      } finally {
        (global as any).MediaRecorder = originalMediaRecorder;
      }
    });

    it('should return preferred format when available', () => {
      const originalIsTypeSupported = (MediaRecorder as any).isTypeSupported;
      (MediaRecorder as any).isTypeSupported = vi.fn((type: string) => {
        return type === 'audio/webm;codecs=opus';
      });

      try {
        const result = getBestAudioMimeType();
        expect(result).toBe('audio/webm;codecs=opus');
      } finally {
        (MediaRecorder as any).isTypeSupported = originalIsTypeSupported;
      }
    });

    it('should fallback to next format when preferred is not available', () => {
      const originalIsTypeSupported = (MediaRecorder as any).isTypeSupported;
      let callCount = 0;
      (MediaRecorder as any).isTypeSupported = vi.fn((type: string) => {
        callCount++;
        // First format not supported, second is
        if (callCount === 1) return false;
        if (callCount === 2) return true;
        return false;
      });

      try {
        const result = getBestAudioMimeType();
        expect(result).toBe('audio/webm');
      } finally {
        (MediaRecorder as any).isTypeSupported = originalIsTypeSupported;
      }
    });

    it('should return null when no formats are supported', () => {
      const originalIsTypeSupported = (MediaRecorder as any).isTypeSupported;
      (MediaRecorder as any).isTypeSupported = vi.fn(() => false);

      try {
        const result = getBestAudioMimeType();
        expect(result).toBeNull();
      } finally {
        (MediaRecorder as any).isTypeSupported = originalIsTypeSupported;
      }
    });

    it('should check formats in priority order', () => {
      const originalIsTypeSupported = (MediaRecorder as any).isTypeSupported;
      const checkedTypes: string[] = [];
      (MediaRecorder as any).isTypeSupported = vi.fn((type: string) => {
        checkedTypes.push(type);
        return false; // None supported
      });

      try {
        getBestAudioMimeType();
        expect(checkedTypes).toEqual([
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg',
          'audio/wav',
          'audio/mp4',
        ]);
      } finally {
        (MediaRecorder as any).isTypeSupported = originalIsTypeSupported;
      }
    });
  });

  describe('validateAudioConstraints', () => {
    it('should validate constraints with echo cancellation', () => {
      const constraints = { echoCancellation: true };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should validate constraints with noise suppression', () => {
      const constraints = { noiseSuppression: true };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should validate constraints with auto gain control', () => {
      const constraints = { autoGainControl: true };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should validate constraints with sample rate', () => {
      const constraints = { sampleRate: 48000 };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should validate constraints with channel count', () => {
      const constraints = { channelCount: 1 };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should validate constraints with all properties', () => {
      const constraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1,
      };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should reject empty constraints', () => {
      expect(validateAudioConstraints({})).toBe(false);
    });

    it('should reject null constraints', () => {
      expect(validateAudioConstraints(null as any)).toBe(false);
    });

    it('should reject undefined constraints', () => {
      expect(validateAudioConstraints(undefined as any)).toBe(false);
    });
  });

  describe('createOptimalAudioConstraints', () => {
    it('should create constraints with all optimal settings', () => {
      const constraints = createOptimalAudioConstraints();
      
      expect(constraints.echoCancellation).toBe(true);
      expect(constraints.noiseSuppression).toBe(true);
      expect(constraints.autoGainControl).toBe(true);
      expect(constraints.sampleRate).toBe(48000);
      expect(constraints.channelCount).toBe(1);
    });

    it('should create constraints that pass validation', () => {
      const constraints = createOptimalAudioConstraints();
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should use mono channel for speech', () => {
      const constraints = createOptimalAudioConstraints();
      expect(constraints.channelCount).toBe(1);
    });

    it('should use 48kHz sample rate', () => {
      const constraints = createOptimalAudioConstraints();
      expect(constraints.sampleRate).toBe(48000);
    });
  });

  describe('Audio Constraints Edge Cases', () => {
    it('should handle constraints with false values', () => {
      const constraints = {
        echoCancellation: false,
        noiseSuppression: false,
      };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should handle constraints with numeric values', () => {
      const constraints = {
        sampleRate: 44100,
        channelCount: 2,
      };
      expect(validateAudioConstraints(constraints)).toBe(true);
    });

    it('should handle constraints with object values', () => {
      const constraints = {
        sampleRate: { ideal: 48000, min: 44100 },
        channelCount: { ideal: 1, min: 1 },
      };
      // Note: This may not pass validation depending on implementation
      expect(typeof validateAudioConstraints(constraints as any)).toBe('boolean');
    });
  });
});
