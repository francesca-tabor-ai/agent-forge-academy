# UAT Voice Mock Mode - Standard Voice Mode

## Overview

Standard voice mode has been made testable by implementing a mock audio pipeline that bypasses browser Speech Recognition and microphone requirements when `UAT_MOCK_AI=1` is enabled. This allows Playwright tests to run without real microphone permissions or browser Speech Recognition support.

## How It Works

### Mock Mode Detection

Mock mode is detected via:
1. `window.__UAT_MOCK_AI === true` or `window.__UAT_MOCK_AI === '1'`
2. `localStorage.getItem('UAT_MOCK_AI') === '1'`

### Mock Mode Behavior

When mock mode is enabled:

1. **Bypasses Browser Checks**: Skips Speech Recognition API and MediaDevices checks
2. **Skips Microphone Permission**: No microphone permission request needed
3. **Uses API-Based Transcription**: Instead of browser Speech Recognition, sends mock audio to `/api/ai-advisor/voice`
4. **Deterministic Responses**: Returns predictable transcription text from the API

### Flow in Mock Mode

1. User clicks/holds microphone button (push-to-talk) or activates hands-free mode
2. `startListening()` is called:
   - Sets `isListening = true`
   - Shows "Listening..." in partial transcript
   - Starts recording duration timer
   - **No actual microphone access needed**

3. User releases button (push-to-talk) or silence detected (hands-free):
   - `stopListening()` is called
   - Creates a mock audio blob (minimal WebM format)
   - Sends audio blob to `/api/ai-advisor/voice` via FormData
   - API returns deterministic transcription (when `UAT_MOCK_AI=1` on server)
   - Transcription is displayed in editable textarea or sent directly

4. Transcription is handled:
   - If `allowEditBeforeSend=true`: Shows editable transcript
   - If `allowEditBeforeSend=false`: Immediately calls `onTranscript(text)`

## Enabling Mock Mode in Playwright Tests

### Method 1: Set Window Variable (Recommended)

```typescript
test.beforeEach(async ({ page }) => {
  // Enable mock mode before navigating
  await page.addInitScript(() => {
    (window as any).__UAT_MOCK_AI = true;
  });
  
  // Navigate to page
  await page.goto('/student/ai-advisor');
});
```

### Method 2: Set LocalStorage

```typescript
test.beforeEach(async ({ page }) => {
  // Navigate first
  await page.goto('/student/ai-advisor');
  
  // Enable mock mode via localStorage
  await page.evaluate(() => {
    localStorage.setItem('UAT_MOCK_AI', '1');
  });
  
  // Reload page to apply mock mode
  await page.reload();
});
```

### Method 3: Set Environment Variable (Server-Side)

```bash
# Set environment variable before running tests
export UAT_MOCK_AI=1
npm run test:e2e
```

**Note**: This enables mock mode on the server (API responses), but you still need to enable client-side mock mode (window variable or localStorage) to bypass browser checks.

## Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('Voice Mode - Standard (Mock)', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock mode
    await page.addInitScript(() => {
      (window as any).__UAT_MOCK_AI = true;
    });
    
    // Login and navigate
    await page.goto('/auth/login');
    // ... login steps ...
    await page.goto('/student/ai-advisor');
  });

  test('should record and transcribe in push-to-talk mode', async ({ page }) => {
    // Wait for voice controls to load
    await page.waitForSelector('[data-testid="microphone-button"]');
    
    // Click and hold microphone button (push-to-talk)
    const micButton = page.locator('[data-testid="microphone-button"]');
    await micButton.press('MouseDown');
    
    // Wait for listening state
    await expect(page.locator('text=Listening...')).toBeVisible({ timeout: 2000 });
    
    // Release button (simulates stop recording)
    await micButton.press('MouseUp');
    
    // Wait for transcription (from API)
    await page.waitForSelector('[data-testid="transcript-input"]', { timeout: 5000 });
    
    // Verify transcription appears
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await expect(transcriptInput).toHaveValue(/mock|UAT testing/i);
  });
});
```

## API Endpoint

### `/api/ai-advisor/voice` (POST)

**Request Format:**
```typescript
FormData {
  audio: Blob,              // Audio file (WebM format)
  studentProfileId?: string, // Optional student profile ID
  context?: string          // Optional JSON stringified context
}
```

**Response Format (Mock Mode):**
```json
{
  "transcript": "This is a mock voice transcription for UAT testing.",
  "responseText": "Mock AI response...",
  "conversationId": "mock-conv-123",
  "requestId": "mock-req-voice-12345"
}
```

## Mock Audio Blob

In mock mode, a minimal WebM audio blob is created:

```typescript
function createMockAudioBlob(): Blob {
  const mockAudioData = new Uint8Array([
    0x1a, 0x45, 0xdf, 0xa3, // EBML header
    // ... minimal WebM structure
  ]);
  return new Blob([mockAudioData], { type: 'audio/webm' });
}
```

This blob is sent to the API, which returns deterministic transcription when `UAT_MOCK_AI=1` is set on the server.

## Benefits

1. **No Microphone Required**: Tests run without real microphone access
2. **No Browser Permissions**: No need to grant microphone permissions in tests
3. **Deterministic**: Same inputs always produce same outputs
4. **Fast**: No waiting for real audio processing
5. **CI/CD Friendly**: Works in headless environments without audio hardware

## Limitations

1. **No Real Audio Testing**: Cannot test actual audio quality or recognition accuracy
2. **Mock Audio Only**: Uses minimal WebM blob, not real audio data
3. **API Dependency**: Requires server to have `UAT_MOCK_AI=1` for deterministic responses

## Production Behavior

When mock mode is **not** enabled:
- Uses browser Speech Recognition API (webkitSpeechRecognition)
- Requires microphone permission
- Requires secure context (HTTPS)
- Real-time transcription via browser API
- No API calls for transcription (only for AI responses)

## Files Modified

1. `components/ai-advisor/VoiceControls.tsx`
   - Added `isMockModeEnabled()` function
   - Added `createMockAudioBlob()` function
   - Added `transcribeAudioViaAPI()` function
   - Modified `startListening()` to handle mock mode
   - Modified `stopListening()` to send audio to API in mock mode
   - Added `studentProfileId` and `context` props

2. `components/ai-advisor/AIAdvisor.tsx`
   - Passes `studentProfileId` and `context` to `VoiceControls`

3. `app/api/ai-advisor/voice/route.ts`
   - Already has mock mode support (returns deterministic transcription)

## Verification

To verify mock mode is working:

1. Enable mock mode in test
2. Check browser console for "Mock mode enabled" (if logging added)
3. Verify no microphone permission prompt appears
4. Verify API call to `/api/ai-advisor/voice` is made
5. Verify deterministic transcription is returned
