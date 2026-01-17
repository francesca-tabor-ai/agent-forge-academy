# WebRTC Realtime Isolation

## Overview

WebRTC Realtime has been hardened to prevent it from initializing or making API calls on pages other than `/student/ai-advisor`. It only initializes when the user explicitly selects WebRTC mode and clicks the Connect button.

## Changes Made

### 1. Conditional Rendering

**Before**: WebRTCRealtime component was always rendered but hidden with CSS (`className={useWebRTCRealtime ? '' : 'hidden'}`)

**After**: WebRTCRealtime component is only rendered when `useWebRTCRealtime` is true:

```tsx
{useWebRTCRealtime && (
  <VoiceErrorBoundary>
    <WebRTCRealtime
      autoConnect={false} // Never auto-connect
      // ... other props
    />
  </VoiceErrorBoundary>
)}
```

### 2. Removed Auto-Connect on Mount

**Before**: Component auto-connected when mounted on AI Advisor route

**After**: Component only connects when:
- `autoConnect={true}` prop is explicitly set (default: `false`)
- User is on `/student/ai-advisor` route
- User clicks the Connect button

### 3. Added `autoConnect` Prop

New prop to control auto-connect behavior:

```tsx
interface WebRTCRealtimeProps {
  // ... other props
  autoConnect?: boolean; // Default: false - user must click Connect button
}
```

### 4. Route Safety Check

Component still checks route but only for safety cleanup:

```tsx
// If we're not on AI Advisor route, ensure we're disconnected
// This is a safety check in case component is rendered on wrong route
if (!isAiAdvisorRoute) {
  if (peerConnectionRef.current) {
    disconnect();
  }
}
```

## Behavior

### On `/student/ai-advisor` Page

1. **Page Load**: WebRTCRealtime component is NOT rendered (unless user previously selected WebRTC mode)
2. **Select WebRTC Mode**: Component renders but does NOT auto-connect
3. **Click Connect**: User must explicitly click Connect button to establish connection
4. **API Calls**: Only made when user clicks Connect

### On Other Pages (e.g., `/student/portfolio`)

1. **Page Load**: WebRTCRealtime component is NOT rendered
2. **No API Calls**: No calls to `/api/realtime/connect` or `/api/realtime/session`
3. **No Initialization**: Component doesn't initialize at all

## Regression Tests

Added comprehensive regression tests in `tests/e2e/webrtc-regression.spec.ts`:

1. **Portfolio Page**: Verifies no realtime API calls on `/student/portfolio`
2. **Courses Page**: Verifies no realtime API calls on `/student/courses`
3. **Dashboard Page**: Verifies no realtime API calls on `/student/dashboard`
4. **AI Advisor Page**: Verifies API calls only happen when:
   - WebRTC mode is selected
   - User clicks Connect button
   - NOT on page load

## Files Modified

1. `components/ai-advisor/AIAdvisor.tsx`
   - Changed from conditional CSS hiding to conditional rendering
   - Added `autoConnect={false}` prop

2. `components/ai-advisor/WebRTCRealtime.tsx`
   - Added `autoConnect` prop (default: `false`)
   - Modified auto-connect useEffect to check `autoConnect` prop
   - Only auto-connects if explicitly enabled

3. `tests/e2e/webrtc-regression.spec.ts` (new)
   - Regression tests to ensure isolation

## Benefits

1. **Performance**: No unnecessary API calls on other pages
2. **Resource Usage**: No WebRTC connections established unless needed
3. **User Control**: User must explicitly choose WebRTC mode and connect
4. **Isolation**: WebRTC cannot break other pages
5. **Testability**: Clear behavior for testing

## Migration Notes

If you need auto-connect behavior in the future:

```tsx
<WebRTCRealtime
  autoConnect={true} // Enable auto-connect
  // ... other props
/>
```

But this should be used sparingly and only when absolutely necessary.
