# AI Advisor + Voice Mode: User Journey & Dependency Mapping

## Overview
This document maps all user journeys, API endpoints, error states, and failure points for the AI Advisor feature to guide UAT test creation.

---

## Key User Flows

### 1. New Chat
**Flow:**
- User clicks "New Chat" button (line 616-632 in `AIAdvisor.tsx`)
- Resets messages to initial greeting
- Clears `conversationId` state
- Does NOT clear `activeContext` (context persists)

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 616-632)

**API Endpoints:** None (client-side only)

**Error States:**
- None (pure state reset)

---

### 2. Send Message (Text)
**Flow:**
1. User types message in input field
2. Submits via form (line 580-583)
3. `handleSendMessage` called (line 206-578)
4. Creates user message object
5. Calls `/api/ai-advisor/chat` (streaming or non-streaming)
6. Updates messages state with response
7. Optionally speaks response if voice output enabled

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 206-578, 580-583)
- `app/api/ai-advisor/chat/route.ts` (lines 615-1411)

**API Endpoints:**
- `POST /api/ai-advisor/chat` (streaming: `?stream=true` or `Accept: text/event-stream`)
- `POST /api/ai-advisor/chat` (non-streaming)

**Request Body:**
```typescript
{
  message: string;
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  studentProfileId: string | null;
  conversationHistory: Array<Message>;
  intent?: string;
  conversationId?: string;
}
```

**Error States:**
- **Timeout** (45s client timeout, 60s server timeout): Shows "Taking longer than expected" message
- **Network Error**: Shows "Connection issue" with retry option
- **SERVICE_UNAVAILABLE**: Shows "Service unavailable" (LLM not configured)
- **RATE_LIMIT_EXCEEDED**: Shows "Rate limit exceeded"
- **UNAUTHORIZED**: Shows "Authentication error"
- **EMPTY_COMPLETION**: Shows "No response returned"
- **Generic Error**: Shows error message with Request ID

**Error Handling:**
- Retries on network/server errors (max 2 retries with exponential backoff)
- Restores user message in input field for retry
- Removes placeholder assistant message on error
- Error messages include Request ID for debugging

---

### 3. Context Switching (Course/Project/Job)
**Flow:**
1. User clicks context bar or "Change Context" button
2. Opens `ContextSelectorModal` (line 966-978)
3. User selects course/project/job
4. Updates `activeContext` state
5. Calls `POST /api/advisor/context` to persist context
6. Loads conversation history for new context via `GET /api/advisor/conversations`

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 86-178, 636-639, 966-978)
- `components/ai-advisor/ContextSelectorModal.tsx`
- `components/ai-advisor/ContextBar.tsx`
- `app/api/advisor/context/route.ts` (lines 1-160)
- `app/api/advisor/conversations/route.ts` (lines 5-137)

**API Endpoints:**
- `GET /api/advisor/context` - Fetch current context
- `POST /api/advisor/context` - Update context
- `GET /api/advisor/conversations?courseId=X&projectId=Y&jobId=Z` - Load conversation history

**Request Body (POST /api/advisor/context):**
```typescript
{
  activeCourseId?: string | null;
  activeProjectId?: string | null;
  activeJobId?: string | null;
}
```

**Error States:**
- **401 Unauthorized**: User not authenticated
- **403 Forbidden**: Not a student profile
- **404 Not Found**: Student profile or project not found
- **500 Internal Server Error**: Database error

**Error Handling:**
- Falls back to auto-detected context if API fails (lines 142-173)
- Continues with empty context if all fails

---

### 4. Service Unavailable Handling
**Flow:**
1. User sends message
2. API returns `SERVICE_UNAVAILABLE` error (LLM not configured)
3. Error message displayed in chat
4. User can retry or escalate to human

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 556-557)
- `app/api/ai-advisor/chat/route.ts` (lines 864-904, 1129-1172)

**API Endpoints:**
- `GET /api/ai-advisor/health` - Health check endpoint
- `POST /api/ai-advisor/chat` - Returns SERVICE_UNAVAILABLE if LLM not configured

**Error States:**
- **SERVICE_UNAVAILABLE**: LLM_API_KEY not set or invalid
- **UPSTREAM_ERROR**: LLM provider error
- **503 Service Unavailable**: Health check fails

**Error Handling:**
- Shows user-friendly error message
- Suggests contacting support
- Includes Request ID for debugging

---

### 5. Voice Mode: Standard Recording (Push-to-Talk + Hands-Free)
**Flow:**
1. User toggles to "Standard" voice mode (line 724)
2. `VoiceControls` component rendered (lines 900-931)
3. **Push-to-Talk:**
   - User holds microphone button
   - Browser Speech Recognition API starts
   - User speaks
   - Releases button
   - Transcript sent to `handleSendMessage`
4. **Hands-Free:**
   - User clicks microphone to start
   - Auto-stops after 3 seconds of silence
   - Transcript sent to `handleSendMessage`

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 720-744, 900-931)
- `components/ai-advisor/VoiceControls.tsx` (lines 128-1331)

**API Endpoints:**
- `POST /api/ai-advisor/voice` - Voice transcription (optional, if `ENABLE_VOICE_API=true`)
- Browser Speech Recognition API (client-side)

**Error States:**
- **Not Supported**: Browser doesn't support Speech Recognition
- **Permission Denied**: Microphone permission not granted
- **No Speech Detected**: No audio input detected
- **Network Error**: Speech Recognition service unavailable
- **Offline**: User is offline
- **Secure Context Required**: Not on HTTPS

**Error Handling:**
- Shows browser-specific error messages
- Falls back to text input
- Provides actionable guidance (e.g., enable microphone permission)
- Auto-disables hands-free mode on network errors

---

### 6. Voice Mode: WebRTC Realtime Connect / Reconnect / Fallback
**Flow:**
1. User toggles to "WebRTC Realtime" mode (line 735)
2. `WebRTCRealtime` component auto-connects on mount (lines 905-927)
3. **Connection:**
   - Calls `POST /api/realtime/session` to get credentials
   - Creates RTCPeerConnection
   - Creates DataChannel "oai-events"
   - Adds microphone track (muted by default)
   - Sends SDP offer to `POST /api/realtime/connect`
   - Receives SDP answer
   - Connection established
4. **Push-to-Talk:**
   - User holds mic button
   - Enables microphone track
   - Releases button
   - Commits turn and requests response
5. **Hands-Free:**
   - Microphone enabled automatically
   - Turn detection enabled server-side
   - Auto-detects when user finishes speaking
6. **Reconnect:**
   - User clicks "Reconnect" button
   - Disconnects and reconnects
7. **Fallback:**
   - On connection failure, triggers `onFallback` callback
   - Switches to Standard voice mode

**Files:**
- `components/ai-advisor/AIAdvisor.tsx` (lines 746-898)
- `components/ai-advisor/WebRTCRealtime.tsx` (lines 52-1166)
- `app/api/realtime/session/route.ts` (lines 1-122)
- `app/api/realtime/connect/route.ts` (lines 1-266)
- `app/api/realtime/tool/route.ts` (for tool calling)

**API Endpoints:**
- `POST /api/realtime/session` - Get ephemeral session credentials
- `POST /api/realtime/connect` - Proxy SDP offer/answer to OpenAI
- `POST /api/realtime/tool` - Execute tool calls from model

**Request Body (POST /api/realtime/session):**
```typescript
{
  enableTurnDetection?: boolean; // For hands-free mode
}
```

**Request Body (POST /api/realtime/connect):**
```typescript
{
  sdp: string; // SDP offer
  session_token: string; // Ephemeral token
  session_id?: string; // Session ID
}
```

**Error States:**
- **401 Unauthorized**: User not authenticated
- **400 Bad Request**: Invalid SDP or session token
- **429 Rate Limit**: Too many session requests
- **500 Internal Server Error**: Server error
- **503 Service Unavailable**: OpenAI Realtime API unavailable
- **Connection Timeout**: No events received for 30 seconds
- **Silence Timeout**: No speech activity for 5 minutes (auto-disconnect)
- **Data Channel Error**: Data channel closed unexpectedly
- **ICE Connection Failed**: WebRTC connection failed

**Error Handling:**
- Auto-fallback to Standard voice mode on connection failure
- Shows fallback message to user
- Provides "Reconnect" button for manual retry
- Timeout detection (30s) triggers fallback
- Silence timeout (5min) closes session gracefully

---

## API Endpoints Summary

### Chat & Voice
- `POST /api/ai-advisor/chat` - Send text message (streaming/non-streaming)
- `POST /api/ai-advisor/voice` - Voice transcription (optional, feature flag)
- `GET /api/ai-advisor/health` - Health check

### Context Management
- `GET /api/advisor/context` - Get active context
- `POST /api/advisor/context` - Update active context
- `GET /api/advisor/conversations` - Get conversation history

### WebRTC Realtime
- `POST /api/realtime/session` - Create session credentials
- `POST /api/realtime/connect` - Proxy SDP offer/answer
- `POST /api/realtime/tool` - Execute tool calls

---

## Error States by Category

### Authentication Errors
- **401 Unauthorized**: Session expired, user not authenticated
- **403 Forbidden**: Not a student profile

### Service Errors
- **SERVICE_UNAVAILABLE**: LLM not configured
- **UPSTREAM_ERROR**: LLM provider error
- **RATE_LIMIT_EXCEEDED**: Too many requests
- **TIMEOUT**: Request took too long
- **EMPTY_COMPLETION**: LLM returned empty response

### Network Errors
- **Network Error**: Connection failed
- **Offline**: User is offline
- **Connection Timeout**: No response from server

### Voice-Specific Errors
- **Not Supported**: Browser doesn't support voice
- **Permission Denied**: Microphone permission not granted
- **No Speech Detected**: No audio input
- **Secure Context Required**: Not on HTTPS

### WebRTC-Specific Errors
- **Connection Failed**: WebRTC connection failed
- **Data Channel Error**: Data channel closed
- **ICE Connection Failed**: WebRTC ICE failed
- **Session Timeout**: Session expired

---

## Current Error Handling Implementation

### Client-Side (AIAdvisor.tsx)
- Retry logic with exponential backoff (max 2 retries)
- Error messages with Request ID
- User message restoration for retry
- Placeholder message cleanup on error
- Timeout detection (45s client timeout)

### Server-Side (chat/route.ts)
- Request ID generation for observability
- Error code classification (SERVICE_UNAVAILABLE, RATE_LIMIT, etc.)
- PII-safe logging
- Stream timeout (60s)
- Empty completion detection

### Voice Controls (VoiceControls.tsx)
- Browser capability detection
- Permission error handling
- Network error deduplication
- Auto-restart with backoff (hands-free mode)
- Offline detection

### WebRTC Realtime (WebRTCRealtime.tsx)
- Auto-fallback to Standard voice on failure
- Timeout detection (30s)
- Silence timeout (5min)
- Reconnection logic
- Error boundary integration

---

## Test Scenarios to Cover

### 1. New Chat
- ✅ Reset messages to initial greeting
- ✅ Preserve active context
- ✅ Clear conversation ID

### 2. Send Message (Text)
- ✅ Successful message send (streaming)
- ✅ Successful message send (non-streaming)
- ✅ Timeout handling
- ✅ Network error handling
- ✅ Service unavailable handling
- ✅ Rate limit handling
- ✅ Empty response handling
- ✅ Retry logic

### 3. Context Switching
- ✅ Switch to course context
- ✅ Switch to project context
- ✅ Switch to job context
- ✅ Load conversation history on context switch
- ✅ Persist context to database
- ✅ Error handling (404, 500)

### 4. Service Unavailable
- ✅ LLM not configured
- ✅ Health check endpoint
- ✅ Error message display
- ✅ Human escalation option

### 5. Voice Mode: Standard
- ✅ Push-to-talk recording
- ✅ Hands-free recording
- ✅ Browser support detection
- ✅ Permission handling
- ✅ Network error handling
- ✅ Offline detection
- ✅ Transcript editing before send

### 6. Voice Mode: WebRTC Realtime
- ✅ Auto-connect on page load
- ✅ Push-to-talk mode
- ✅ Hands-free mode
- ✅ Connection failure fallback
- ✅ Reconnection
- ✅ Timeout detection
- ✅ Silence timeout
- ✅ Tool calling
- ✅ Context updates

---

## File Paths Reference

### Components
- `components/ai-advisor/AIAdvisor.tsx` - Main component
- `components/ai-advisor/VoiceControls.tsx` - Standard voice mode
- `components/ai-advisor/WebRTCRealtime.tsx` - WebRTC Realtime mode
- `components/ai-advisor/ChatPanel.tsx` - Chat UI
- `components/ai-advisor/ContextBar.tsx` - Context display
- `components/ai-advisor/ContextSelectorModal.tsx` - Context selector
- `components/ai-advisor/QuickActions.tsx` - Quick action buttons
- `components/ai-advisor/HumanEscalationModal.tsx` - Human escalation
- `components/ai-advisor/VoiceErrorBoundary.tsx` - Error boundary

### API Routes
- `app/api/ai-advisor/chat/route.ts` - Chat endpoint
- `app/api/ai-advisor/voice/route.ts` - Voice endpoint
- `app/api/ai-advisor/health/route.ts` - Health check
- `app/api/advisor/context/route.ts` - Context management
- `app/api/advisor/conversations/route.ts` - Conversation history
- `app/api/realtime/session/route.ts` - Realtime session
- `app/api/realtime/connect/route.ts` - Realtime connection
- `app/api/realtime/tool/route.ts` - Tool execution

### Pages
- `app/(student)/student/ai-advisor/page.tsx` - AI Advisor page

---

## Next Steps for UAT

1. Create test cases for each user flow
2. Test error scenarios
3. Test voice mode fallbacks
4. Test context switching
5. Test service unavailable scenarios
6. Test WebRTC connection/reconnection
7. Test timeout scenarios
8. Test rate limiting
9. Test offline scenarios
10. Test permission handling
