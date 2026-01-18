/**
 * Microphone Permission Utilities
 * 
 * Provides utilities for checking microphone permissions, enumerating devices,
 * and providing browser-specific user guidance.
 */

import { safeLogger } from './redactPII';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'blocked' | 'unknown';

export interface MicrophoneDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface PermissionCheckResult {
  state: PermissionState;
  canChangeInSettings: boolean;
  errorName?: string;
  errorMessage?: string;
}

/**
 * Check microphone permission state
 * Uses navigator.permissions.query() if available, otherwise falls back to getUserMedia
 */
export async function checkMicrophonePermission(): Promise<PermissionCheckResult> {
  // Check if permissions API is supported (not available in Safari/iOS)
  if (typeof navigator !== 'undefined' && 'permissions' in navigator && 'query' in navigator.permissions) {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      // Log permission state
      safeLogger.info('Microphone permission state checked', {
        event: 'microphone_permission_check',
        timestamp: new Date().toISOString(),
        state: permissionStatus.state,
        hasPermissionAPI: true,
      });

      return {
        state: permissionStatus.state as PermissionState,
        canChangeInSettings: permissionStatus.state === 'denied',
      };
    } catch (error: any) {
      // Permissions API may not support 'microphone' in some browsers
      safeLogger.warn('Permission API query failed, falling back to getUserMedia', {
        error: error.message,
      });
    }
  }

  // Fallback: Try getUserMedia to check permission
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted - stop stream immediately
    stream.getTracks().forEach(track => track.stop());
    
    safeLogger.info('Microphone permission granted (via getUserMedia)', {
      event: 'microphone_permission_granted',
      timestamp: new Date().toISOString(),
      method: 'getUserMedia',
    });

    return {
      state: 'granted',
      canChangeInSettings: false,
    };
  } catch (error: any) {
    const errorName = error.name || 'UnknownError';
    const isDenied = errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError';
    const isBlocked = errorName === 'NotAllowedError'; // Can't distinguish without permission API

    safeLogger.warn('Microphone permission check failed', {
      event: 'microphone_permission_denied',
      timestamp: new Date().toISOString(),
      errorName,
      errorMessage: error.message,
      method: 'getUserMedia',
    });

    return {
      state: isDenied ? 'denied' : 'unknown',
      canChangeInSettings: isDenied,
      errorName,
      errorMessage: error.message,
    };
  }
}

/**
 * Enumerate available microphone devices
 * Requires microphone permission to be granted first
 */
export async function enumerateMicrophoneDevices(): Promise<MicrophoneDevice[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || 'Unknown Microphone',
        kind: device.kind,
      }));

    safeLogger.info('Microphone devices enumerated', {
      event: 'microphone_devices_enumerated',
      timestamp: new Date().toISOString(),
      deviceCount: audioInputs.length,
      devices: audioInputs.map(d => ({ deviceId: d.deviceId, label: d.label, kind: d.kind })),
    });

    return audioInputs;
  } catch (error: any) {
    safeLogger.error('Failed to enumerate microphone devices', {
      error: error.message,
      errorName: error.name,
    });
    return [];
  }
}

/**
 * Get browser-specific guidance for permission errors
 */
export function getPermissionGuidance(
  state: PermissionState,
  errorName?: string
): { title: string; message: string; steps: string[] } {
  const browser = detectBrowser();

  if (state === 'granted') {
    return {
      title: 'Microphone Access Granted',
      message: 'You can now use voice features.',
      steps: [],
    };
  }

  if (state === 'denied') {
    const guidance = getBrowserSpecificGuidance(browser, 'denied');
    return {
      title: 'Microphone Permission Denied',
      message: 'Microphone access is required for voice features.',
      steps: guidance.steps,
    };
  }

  if (state === 'blocked') {
    const guidance = getBrowserSpecificGuidance(browser, 'blocked');
    return {
      title: 'Microphone Access Blocked',
      message: 'Microphone access is permanently blocked. You need to enable it in browser settings.',
      steps: guidance.steps,
    };
  }

  // Handle specific error names
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return {
      title: 'No Microphone Found',
      message: 'No microphone device was detected on your system.',
      steps: [
        'Connect a microphone to your device',
        'Check that your microphone is not muted',
        'Try a different microphone',
      ],
    };
  }

  if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
    return {
      title: 'Microphone In Use',
      message: 'Your microphone is being used by another application.',
      steps: [
        'Close other applications using the microphone',
        'Check video conferencing apps (Zoom, Teams, etc.)',
        'Try again',
      ],
    };
  }

  if (errorName === 'OverconstrainedError') {
    return {
      title: 'Microphone Constraints Not Met',
      message: 'Your microphone does not meet the required specifications.',
      steps: [
        'Check your microphone settings',
        'Try a different microphone',
        'Update your audio drivers',
      ],
    };
  }

  return {
    title: 'Microphone Access Error',
    message: 'Unable to access microphone. Please check your browser settings.',
    steps: getBrowserSpecificGuidance(browser, 'denied').steps,
  };
}

/**
 * Detect browser type
 */
function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';
  if (userAgent.includes('edg')) return 'edge';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
  return 'unknown';
}

/**
 * Get browser-specific guidance steps
 */
function getBrowserSpecificGuidance(
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown',
  type: 'denied' | 'blocked'
): { steps: string[] } {
  if (type === 'denied') {
    switch (browser) {
      case 'chrome':
      case 'edge':
        return {
          steps: [
            'Click the lock icon (🔒) in your browser\'s address bar',
            'Select "Site settings"',
            'Find "Microphone" and select "Allow"',
            'Refresh this page',
          ],
        };
      case 'firefox':
        return {
          steps: [
            'Click the shield icon (🛡️) in your browser\'s address bar',
            'Select "Permissions"',
            'Find "Use the Microphone" and select "Allow"',
            'Refresh this page',
          ],
        };
      case 'safari':
        return {
          steps: [
            'Open Safari menu → Settings → Websites',
            'Select "Microphone" in the left sidebar',
            'Find this website and select "Allow"',
            'Refresh this page',
          ],
        };
      default:
        return {
          steps: [
            'Open your browser settings',
            'Go to Privacy/Site Settings',
            'Find microphone permissions and allow for this site',
            'Refresh this page',
          ],
        };
    }
  } else {
    // blocked
    switch (browser) {
      case 'chrome':
      case 'edge':
        return {
          steps: [
            'Open Chrome/Edge settings (chrome://settings/content/microphone)',
            'Click "Add" next to "Allow"',
            'Enter this website\'s URL',
            'Refresh this page',
          ],
        };
      case 'firefox':
        return {
          steps: [
            'Open Firefox settings (about:preferences#privacy)',
            'Go to "Permissions" → "Microphone"',
            'Click "Manage Exceptions"',
            'Add this website and select "Allow"',
            'Refresh this page',
          ],
        };
      case 'safari':
        return {
          steps: [
            'Open Safari → Preferences → Websites',
            'Select "Microphone" in the left sidebar',
            'Find this website and change to "Allow"',
            'Refresh this page',
          ],
        };
      default:
        return {
          steps: [
            'Open your browser settings',
            'Go to Privacy/Site Settings',
            'Find microphone permissions',
            'Add this website to allowed sites',
            'Refresh this page',
          ],
        };
    }
  }
}

/**
 * Check if running on Safari/iOS
 */
export function isSafariOrIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    (userAgent.includes('safari') && !userAgent.includes('chrome')) ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad')
  );
}

/**
 * Get Safari-specific audio constraints
 */
export function getSafariAudioConstraints(): MediaTrackConstraints {
  // Safari may require specific constraints
  return {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  };
}

/**
 * Log permission state transition
 */
export function logPermissionStateTransition(
  mode: 'standard' | 'webrtc',
  previousState: PermissionState | null,
  newState: PermissionState,
  errorName?: string
): void {
  safeLogger.info('Microphone permission state transition', {
    event: 'microphone_permission_state_change',
    timestamp: new Date().toISOString(),
    mode,
    previousState,
    newState,
    errorName,
  });
}
