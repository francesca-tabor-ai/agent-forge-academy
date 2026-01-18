/**
 * Unit Tests: Voice Browser Capabilities
 * 
 * Tests for browser capability detection:
 * - Speech Recognition support
 * - Speech Synthesis support
 * - MediaDevices support
 * - Secure context detection
 * - Browser detection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Check if Speech Recognition is supported
 */
function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

/**
 * Check if Speech Synthesis is supported
 */
function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

/**
 * Check if MediaDevices is supported
 */
function isMediaDevicesSupported(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
}

/**
 * Check if we're in a secure context
 */
function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false;
  return window.isSecureContext || false;
}

/**
 * Detect browser from user agent
 */
function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Chrome';
  } else if (userAgent.includes('edg')) {
    return 'Edge';
  } else if (userAgent.includes('firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'Safari';
  }
  return 'Unknown';
}

/**
 * Check if mock mode is enabled
 */
function isMockModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return (window as any).__UAT_MOCK_AI === true || 
         (window as any).__UAT_MOCK_AI === '1' ||
         (typeof localStorage !== 'undefined' && localStorage.getItem('UAT_MOCK_AI') === '1');
}

describe('Voice Browser Capabilities', () => {
  let originalWindow: any;
  let originalNavigator: any;

  beforeEach(() => {
    originalWindow = global.window;
    originalNavigator = global.navigator;
  });

  afterEach(() => {
    global.window = originalWindow;
    global.navigator = originalNavigator;
  });

  describe('isSpeechRecognitionSupported', () => {
    it('should return false when window is undefined', () => {
      delete (global as any).window;
      expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it('should return true when SpeechRecognition is available', () => {
      (global as any).window = {
        SpeechRecognition: class {},
      };
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it('should return true when webkitSpeechRecognition is available', () => {
      (global as any).window = {
        webkitSpeechRecognition: class {},
      };
      expect(isSpeechRecognitionSupported()).toBe(true);
    });

    it('should return false when neither is available', () => {
      (global as any).window = {};
      expect(isSpeechRecognitionSupported()).toBe(false);
    });
  });

  describe('isSpeechSynthesisSupported', () => {
    it('should return false when window is undefined', () => {
      delete (global as any).window;
      expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it('should return true when speechSynthesis is available', () => {
      (global as any).window = {
        speechSynthesis: {},
      };
      expect(isSpeechSynthesisSupported()).toBe(true);
    });

    it('should return false when speechSynthesis is not available', () => {
      (global as any).window = {};
      expect(isSpeechSynthesisSupported()).toBe(false);
    });
  });

  describe('isMediaDevicesSupported', () => {
    it('should return false when window is undefined', () => {
      delete (global as any).window;
      delete (global as any).navigator;
      expect(isMediaDevicesSupported()).toBe(false);
    });

    it('should return false when navigator is undefined', () => {
      (global as any).window = {};
      delete (global as any).navigator;
      expect(isMediaDevicesSupported()).toBe(false);
    });

    it('should return true when mediaDevices and getUserMedia are available', () => {
      (global as any).navigator = {
        mediaDevices: {
          getUserMedia: () => {},
        },
      };
      expect(isMediaDevicesSupported()).toBe(true);
    });

    it('should return false when mediaDevices is missing', () => {
      (global as any).navigator = {};
      expect(isMediaDevicesSupported()).toBe(false);
    });

    it('should return false when getUserMedia is missing', () => {
      (global as any).navigator = {
        mediaDevices: {},
      };
      expect(isMediaDevicesSupported()).toBe(false);
    });
  });

  describe('isSecureContext', () => {
    it('should return false when window is undefined', () => {
      delete (global as any).window;
      expect(isSecureContext()).toBe(false);
    });

    it('should return true when isSecureContext is true', () => {
      (global as any).window = {
        isSecureContext: true,
      };
      expect(isSecureContext()).toBe(true);
    });

    it('should return false when isSecureContext is false', () => {
      (global as any).window = {
        isSecureContext: false,
      };
      expect(isSecureContext()).toBe(false);
    });

    it('should return false when isSecureContext is undefined', () => {
      (global as any).window = {};
      expect(isSecureContext()).toBe(false);
    });
  });

  describe('detectBrowser', () => {
    it('should return Unknown when navigator is undefined', () => {
      delete (global as any).navigator;
      expect(detectBrowser()).toBe('Unknown');
    });

    it('should detect Chrome', () => {
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      };
      expect(detectBrowser()).toBe('Chrome');
    });

    it('should detect Edge', () => {
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Edg/120.0.0.0',
      };
      expect(detectBrowser()).toBe('Edge');
    });

    it('should detect Firefox', () => {
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      };
      expect(detectBrowser()).toBe('Firefox');
    });

    it('should detect Safari', () => {
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
      };
      expect(detectBrowser()).toBe('Safari');
    });

    it('should return Unknown for unrecognized user agent', () => {
      (global as any).navigator = {
        userAgent: 'Unknown Browser 1.0',
      };
      expect(detectBrowser()).toBe('Unknown');
    });
  });

  describe('isMockModeEnabled', () => {
    beforeEach(() => {
      if (typeof (global as any).window !== 'undefined') {
        delete (global as any).window.__UAT_MOCK_AI;
      }
      if (typeof (global as any).localStorage !== 'undefined') {
        (global as any).localStorage.clear();
      }
    });

    it('should return false when window is undefined', () => {
      delete (global as any).window;
      expect(isMockModeEnabled()).toBe(false);
    });

    it('should return true when __UAT_MOCK_AI is true', () => {
      (global as any).window = {
        __UAT_MOCK_AI: true,
      };
      expect(isMockModeEnabled()).toBe(true);
    });

    it('should return true when __UAT_MOCK_AI is "1"', () => {
      (global as any).window = {
        __UAT_MOCK_AI: '1',
      };
      expect(isMockModeEnabled()).toBe(true);
    });

    it('should return true when localStorage has UAT_MOCK_AI=1', () => {
      (global as any).window = {};
      (global as any).localStorage = {
        getItem: vi.fn((key: string) => {
          return key === 'UAT_MOCK_AI' ? '1' : null;
        }),
      };
      expect(isMockModeEnabled()).toBe(true);
    });

    it('should return false when mock mode is not enabled', () => {
      (global as any).window = {};
      (global as any).localStorage = {
        getItem: vi.fn(() => null),
      };
      expect(isMockModeEnabled()).toBe(false);
    });

    it('should return false when __UAT_MOCK_AI is false', () => {
      (global as any).window = {
        __UAT_MOCK_AI: false,
      };
      expect(isMockModeEnabled()).toBe(false);
    });
  });

  describe('Browser Capability Combinations', () => {
    it('should detect fully supported browser', () => {
      (global as any).window = {
        SpeechRecognition: class {},
        speechSynthesis: {},
        isSecureContext: true,
      };
      (global as any).navigator = {
        mediaDevices: {
          getUserMedia: () => {},
        },
      };

      expect(isSpeechRecognitionSupported()).toBe(true);
      expect(isSpeechSynthesisSupported()).toBe(true);
      expect(isMediaDevicesSupported()).toBe(true);
      expect(isSecureContext()).toBe(true);
    });

    it('should detect partially supported browser', () => {
      (global as any).window = {
        speechSynthesis: {},
        isSecureContext: true,
      };
      (global as any).navigator = {
        mediaDevices: {
          getUserMedia: () => {},
        },
      };

      expect(isSpeechRecognitionSupported()).toBe(false);
      expect(isSpeechSynthesisSupported()).toBe(true);
      expect(isMediaDevicesSupported()).toBe(true);
      expect(isSecureContext()).toBe(true);
    });

    it('should detect unsupported browser', () => {
      (global as any).window = {
        isSecureContext: false,
      };
      (global as any).navigator = {};

      expect(isSpeechRecognitionSupported()).toBe(false);
      expect(isSpeechSynthesisSupported()).toBe(false);
      expect(isMediaDevicesSupported()).toBe(false);
      expect(isSecureContext()).toBe(false);
    });
  });
});
