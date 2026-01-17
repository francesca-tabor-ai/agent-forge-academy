# UAT WebRTC Realtime Mock Mode

## Overview

WebRTC Realtime mode has been made testable by implementing a mock connection mode that bypasses real WebRTC peer connections when `UAT_MOCK_REALTIME=1` is enabled. This allows Playwright tests to run without real WebRTC support or network connectivity.

## How It Works

### Mock Mode Detection

Mock mode is detected via:
1. `window.__UAT_MOCK_REALTIME === true` or `window.__UAT_MOCK_REALTIME === '1'`
2. `localStorage.getItem('UAT_MOCK_REALTIME') === '1'`

### Mock Mode Behavior

When mock mode is enabled:

1. **Bypasses Real WebRTC**: Skips RTCPeerConnection creation
2. **Calls API Directly**: Calls `/api/realtime/connect` with mock SDP offer
3. **Simulates Connection States**: Shows connecting → connected or failed states
4. **Triggers Fallback**: On failure, shows fallback banner and switches to Standard voice

### Flow in Mock Mode

1. User clicks "Connect" button
2. `connect()` is called:
   - Detects mock mode
   - Calls `connectMock()` instead of real WebRTC
   - Sets `isConnecting = true`
   - Calls `/api/realtime/connect` with mock SDP offer

3. API Response Handling:
   - **Success (200 OK)**: 
     - Sets `isConnected = true`
     - Sets `isConnecting = false`
     - Shows "Connected" status
   - **Failure (503 or other errors)**:
     - Sets `hasFailed = true`
     - Sets `showFallbackMessage = true`
     - Calls `triggerFallback()`
     - Shows fallback banner
     - Calls `onFallback()` callback

4. UI States:
   - **Connecting**: Yellow indicator, "Connecting..." text
   - **Connected**: Green indicator, "Connected" text
   - **Failed**: Red indicator, "Connection Failed" text + fallback banner

## Enabling Mock Mode in Playwright Tests

### Method 1: Set Window Variable (Recommended)

```typescript
test.beforeEach(async ({ page }) => {
  // Enable mock mode before navigating
  await page.addInitScript(() => {
    (window as any).__UAT_MOCK_REALTIME = true;
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
    localStorage.setItem('UAT_MOCK_REALTIME', '1');
  });
  
  // Reload page to apply mock mode
  await page.reload();
});
```

### Method 3: Set Environment Variable (Server-Side)

```bash
# Set environment variable before running tests
export UAT_MOCK_AI=1
export UAT_MOCK_REALTIME_UNAVAILABLE=1  # For testing fallback
npm run test:e2e
```

## Test IDs for Assertions

### Connection Status

- `data-testid="webrtc-connection-status"` - Container for connection status
- `data-testid="webrtc-status-indicator-{state}"` - Status indicator (connected/connecting/failed/disconnected)
- `data-testid="webrtc-status-text"` - Status text element

### Fallback Banner

- `data-testid="fallback-banner"` - Fallback message banner
- `data-testid-fallback-triggered="true"` - Attribute indicating fallback was triggered

### Buttons

- `data-testid="webrtc-connect-button"` - Connect/Disconnect button
- `data-testid="reconnect-button"` - Reconnect button (shown when failed)

## Test Example

```typescript
import { test, expect } from '@playwright/test';

test.describe('WebRTC Realtime - Mock Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Enable mock mode
    await page.addInitScript(() => {
      (window as any).__UAT_MOCK_REALTIME = true;
    });
    
    // Login and navigate
    await page.goto('/auth/login');
    // ... login steps ...
    await page.goto('/student/ai-advisor');
  });

  test('should show connecting state when connecting', async ({ page }) => {
    // Switch to WebRTC mode
    await page.locator('[data-testid="voice-mode-webrtc-button"]').click();
    
    // Click Connect
    await page.locator('[data-testid="webrtc-connect-button"]').click();
    
    // Verify connecting state
    await expect(page.locator('[data-testid="webrtc-status-indicator-connecting"]')).toBeVisible();
    await expect(page.locator('[data-testid="webrtc-status-text"]')).toContainText('Connecting...');
  });

  test('should show connected state on success', async ({ page }) => {
    // Switch to WebRTC mode
    await page.locator('[data-testid="voice-mode-webrtc-button"]').click();
    
    // Click Connect
    await page.locator('[data-testid="webrtc-connect-button"]').click();
    
    // Wait for connected state
    await expect(page.locator('[data-testid="webrtc-status-indicator-connected"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="webrtc-status-text"]')).toContainText('Connected');
  });

  test('should show fallback banner on failure', async ({ page, context }) => {
    // Intercept API to return 503
    await page.route('**/api/realtime/connect*', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Realtime service unavailable',
          message: 'Realtime API is temporarily unavailable (mock mode)',
        }),
      });
    });
    
    // Switch to WebRTC mode
    await page.locator('[data-testid="voice-mode-webrtc-button"]').click();
    
    // Click Connect
    await page.locator('[data-testid="webrtc-connect-button"]').click();
    
    // Wait for fallback banner
    await expect(page.locator('[data-testid="fallback-banner"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="fallback-banner"]')).toHaveAttribute('data-testid-fallback-triggered', 'true');
    
    // Verify failed state
    await expect(page.locator('[data-testid="webrtc-status-indicator-failed"]')).toBeVisible();
    await expect(page.locator('[data-testid="webrtc-status-text"]')).toContainText('Connection Failed');
  });
});
```

## API Endpoint

### `/api/realtime/connect` (POST)

**Request Format:**
```typescript
{
  sdp: string,           // SDP offer (mock in test mode)
  session_token?: string // Optional session token
}
```

**Response Format (Mock Success - 200 OK):**
```json
{
  "sdp": "v=0\r\no=- ...",
  "session_id": "mock-session-123"
}
```

**Response Format (Mock Failure - 503):**
```json
{
  "error": "Realtime service unavailable",
  "message": "Realtime API is temporarily unavailable (mock mode)",
  "details": "This is a mock response for UAT testing"
}
```

## UI States

### Connecting State
- **Indicator**: Yellow, pulsing
- **Text**: "Connecting..."
- **Test ID**: `webrtc-status-indicator-connecting`

### Connected State
- **Indicator**: Green, pulsing
- **Text**: "Connected"
- **Test ID**: `webrtc-status-indicator-connected`

### Failed State
- **Indicator**: Red, solid
- **Text**: "Connection Failed"
- **Test ID**: `webrtc-status-indicator-failed`
- **Fallback Banner**: Visible with `data-testid-fallback-triggered="true"`

### Disconnected State
- **Indicator**: Gray, solid
- **Text**: "Disconnected"
- **Test ID**: `webrtc-status-indicator-disconnected`

## Benefits

1. **No WebRTC Required**: Tests run without real WebRTC peer connections
2. **No Network Dependency**: Can test connection logic without network
3. **Deterministic**: Same inputs always produce same outputs
4. **Fast**: No waiting for real WebRTC negotiation
5. **CI/CD Friendly**: Works in headless environments without WebRTC support

## Limitations

1. **No Real WebRTC Testing**: Cannot test actual WebRTC peer connection quality
2. **No Audio Streaming**: Mock mode doesn't stream real audio
3. **API Dependency**: Requires server to have `UAT_MOCK_AI=1` for deterministic responses

## Production Behavior

When mock mode is **not** enabled:
- Creates real RTCPeerConnection
- Establishes WebRTC connection to OpenAI
- Streams real audio data
- Handles real-time transcription and responses

## Files Modified

1. `components/ai-advisor/WebRTCRealtime.tsx`
   - Added `isMockRealtimeEnabled()` function
   - Added `connectMock()` function
   - Modified `connect()` to check mock mode
   - Updated `triggerFallback()` to handle mock mode
   - Added test IDs for connection status and fallback banner

2. `app/api/realtime/connect/route.ts`
   - Already has mock mode support (returns deterministic responses)

## Verification

To verify mock mode is working:

1. Enable mock mode in test
2. Check browser console for "[WebRTC Mock]" logs
3. Verify no RTCPeerConnection is created
4. Verify API call to `/api/realtime/connect` is made
5. Verify UI states update correctly (connecting → connected/failed)
