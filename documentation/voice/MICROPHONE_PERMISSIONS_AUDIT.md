# Microphone Permissions & Device Handling Audit

**Date:** 2024-12-19  
**Purpose:** Audit microphone permission flow, device handling, and user guidance for all failure cases.

---

## Current Implementation Analysis

### Standard Voice Mode (`VoiceControls.tsx`)

#### Permission Request Flow

**Location:** `components/ai-advisor/VoiceControls.tsx` (lines 284-335)

**Current Implementation:**
1. **On Mount Check:**
   - Calls `navigator.mediaDevices.getUserMedia({ audio: true })`
   - If granted: Stops stream immediately, clears `permissionError`
   - If denied: Sets `permissionError` with generic message

2. **Error Handling:**
   - `NotAllowedError` / `PermissionDeniedError`: "Microphone permission is blocked. Enable it in your browser settings."
   - `NotFoundError` / `DevicesNotFoundError`: "No microphone found. Please connect a microphone and try again."
   - `NotReadableError` / `TrackStartError`: "Microphone is being used by another application. Please close other apps and try again."
   - `OverconstrainedError`: "Microphone constraints could not be satisfied. Please check your device settings."
   - Generic: "Unable to access microphone. Please check your browser settings."

**Issues Identified:**
1. ❌ **No structured logging** - Only console.warn/error
2. ❌ **No permission state tracking** - Doesn't use `navigator.permissions.query()`
3. ❌ **Generic error messages** - No browser-specific guidance
4. ❌ **No device enumeration** - Can't show available devices
5. ⚠️ **Permission denied during recording** - May leave UI stuck (partially handled in `onerror`)

#### Permission States

**Current States:**
- `permissionError: string | null` - Generic error message
- `voiceUnavailableReason: string | null` - Reason code
- `isListening: boolean` - Recording state

**Missing:**
- Permission state enum (`'prompt' | 'granted' | 'denied' | 'blocked'`)
- Permission state transition tracking
- Device list

### WebRTC Realtime Mode (`WebRTCRealtime.tsx`)

#### Permission Request Flow

**Location:** `components/ai-advisor/WebRTCRealtime.tsx` (line 746)

**Current Implementation:**
1. **On Connect:**
   - Calls `navigator.mediaDevices.getUserMedia({ audio: true })`
   - No error handling - throws to outer catch block
   - Generic error message: "Failed to connect"

**Issues Identified:**
1. ❌ **No permission-specific error handling** - All errors treated as connection failures
2. ❌ **No structured logging** - Only console.error
3. ❌ **No user guidance** - Generic "Failed to connect" message
4. ❌ **No device enumeration** - Can't select device
5. ❌ **No Safari/iOS handling** - No special constraints

---

## Permission States & Transitions

### Browser Permission States

1. **`prompt`** - User hasn't been asked yet
2. **`granted`** - Permission granted
3. **`denied`** - User denied permission (can be changed in settings)
4. **`blocked`** - Permission permanently blocked (requires browser settings)

### State Transitions

```
[Initial] → prompt → granted ✅
                ↓
            denied → [User can change in settings]
                ↓
            blocked → [Requires browser settings]
```

### Detection Method

```typescript
// Check permission state (if supported)
const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
// Returns: 'granted' | 'denied' | 'prompt'
```

**Note:** `navigator.permissions.query()` is not supported in Safari/iOS.

---

## Issues to Fix

### Issue #1: Permission Denied Leaves UI Stuck

**Current Behavior:**
- If permission denied during recording, `onerror` handler sets `isListening(false)`
- ✅ **Partially Fixed** - Error handler does reset state

**Remaining Issues:**
- No structured logging of permission state
- Generic error message doesn't guide user to fix

**Fix Required:**
- Add structured logging with permission state
- Add browser-specific guidance
- Track permission state transitions

### Issue #2: No Device Selection

**Current Behavior:**
- No device enumeration
- Uses default device only
- Can't switch devices

**Fix Required:**
- Enumerate devices with `navigator.mediaDevices.enumerateDevices()`
- Show device list (if multiple devices)
- Allow device selection
- Handle device changes (device unplugged)

### Issue #3: Safari/iOS Differences

**Known Issues:**
1. **Autoplay:** Safari blocks autoplay (requires user interaction)
2. **Mic Constraints:** Safari may require specific constraints
3. **Permission API:** `navigator.permissions.query()` not supported
4. **getUserMedia:** May require HTTPS (already handled)

**Fix Required:**
- Detect Safari/iOS
- Add Safari-specific constraints
- Handle autoplay policy (already partially handled in WebRTC)
- Fallback permission checking for Safari

---

## User-Facing Guidance by Failure Case

### 1. Permission Granted ✅
**Message:** None (permission granted, feature works)

### 2. Permission Denied
**Message:** 
```
Microphone permission was denied. To enable:
- Click the lock icon in your browser's address bar
- Select "Allow" for microphone access
- Refresh the page
```

**Browser-Specific:**
- **Chrome/Edge:** "Click the lock icon → Site settings → Microphone → Allow"
- **Firefox:** "Click the shield icon → Permissions → Microphone → Allow"
- **Safari:** "Safari → Settings → Websites → Microphone → Allow for this site"

### 3. Permission Blocked
**Message:**
```
Microphone access is permanently blocked. To enable:
- Open your browser settings
- Go to Privacy/Site Settings
- Find this website and allow microphone access
- Refresh the page
```

**Browser-Specific:**
- **Chrome:** "chrome://settings/content/microphone → Add this site to allowed"
- **Firefox:** "about:preferences#privacy → Permissions → Microphone → Manage Exceptions"
- **Safari:** "Safari → Preferences → Websites → Microphone → Allow"

### 4. No Device Found
**Message:**
```
No microphone found. Please:
- Connect a microphone to your device
- Check that your microphone is not muted
- Try a different microphone
```

### 5. Device In Use
**Message:**
```
Microphone is being used by another application. Please:
- Close other applications using the microphone
- Check video conferencing apps (Zoom, Teams, etc.)
- Try again
```

### 6. Safari Autoplay Blocked
**Message:**
```
Audio playback requires user interaction in Safari. Please:
- Click anywhere on the page to enable audio
- Or use a different browser (Chrome, Firefox, Edge)
```

---

## Structured Logging Events

### Permission State Events

```typescript
// Permission check initiated
{
  event: 'microphone_permission_check',
  timestamp: string,
  mode: 'standard' | 'webrtc',
  browser: string,
  hasPermissionAPI: boolean
}

// Permission state transition
{
  event: 'microphone_permission_state_change',
  timestamp: string,
  mode: 'standard' | 'webrtc',
  previousState: 'prompt' | 'granted' | 'denied' | 'blocked' | null,
  newState: 'prompt' | 'granted' | 'denied' | 'blocked',
  errorName?: string,
  errorMessage?: string
}

// Permission granted
{
  event: 'microphone_permission_granted',
  timestamp: string,
  mode: 'standard' | 'webrtc',
  deviceCount: number,
  defaultDeviceLabel?: string
}

// Permission denied
{
  event: 'microphone_permission_denied',
  timestamp: string,
  mode: 'standard' | 'webrtc',
  errorName: string,
  canChangeInSettings: boolean
}

// Device enumeration
{
  event: 'microphone_devices_enumerated',
  timestamp: string,
  deviceCount: number,
  devices: Array<{
    deviceId: string,
    label: string,
    kind: 'audioinput'
  }>
}

// Device selection
{
  event: 'microphone_device_selected',
  timestamp: string,
  deviceId: string,
  deviceLabel: string
}
```

---

## Implementation Plan

### Phase 1: Permission State Tracking
1. Add `navigator.permissions.query()` check (with Safari fallback)
2. Track permission state transitions
3. Add structured logging

### Phase 2: User Guidance
1. Add browser-specific error messages
2. Add step-by-step instructions
3. Add "Try again" buttons with clear actions

### Phase 3: Device Enumeration
1. Enumerate devices on permission grant
2. Show device list (if multiple)
3. Allow device selection
4. Handle device changes

### Phase 4: Safari/iOS Handling
1. Detect Safari/iOS
2. Add Safari-specific constraints
3. Handle autoplay policy
4. Add Safari-specific guidance

---

## Testing Checklist

### Permission States
- [ ] Permission prompt appears on first use
- [ ] Permission granted → Feature works
- [ ] Permission denied → Clear guidance shown
- [ ] Permission blocked → Clear guidance shown
- [ ] Permission state tracked and logged

### Device Handling
- [ ] Single device → Works automatically
- [ ] Multiple devices → Device list shown
- [ ] Device selection → Selected device used
- [ ] Device unplugged → Error shown, can select other device
- [ ] No devices → Clear error message

### Browser-Specific
- [ ] Chrome/Edge → Permission guidance works
- [ ] Firefox → Permission guidance works
- [ ] Safari → Permission guidance works (without permission API)
- [ ] Safari → Autoplay handling works
- [ ] iOS → Constraints work correctly

### Error Cases
- [ ] Permission denied during recording → UI not stuck
- [ ] Device in use → Clear error message
- [ ] No device found → Clear error message
- [ ] Permission blocked → Clear guidance

---

## Evidence Collection

### Console Logs
- Permission state transitions
- Device enumeration results
- Error details (name, message, stack)

### Permission State Transitions
- Track: `prompt → granted`, `prompt → denied`, `denied → blocked`
- Log timestamp and mode for each transition

### UI State Snapshots
- Before permission request
- After permission granted
- After permission denied
- After permission blocked
- Device selection UI (if multiple devices)

---

## Next Steps

1. Implement permission state tracking
2. Add structured logging
3. Add browser-specific user guidance
4. Add device enumeration and selection
5. Add Safari/iOS specific handling
6. Test all failure cases
7. Collect evidence (logs, screenshots, state transitions)
