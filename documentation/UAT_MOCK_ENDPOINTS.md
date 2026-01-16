# UAT Mock Endpoints - Implementation Summary

## Overview

All AI Advisor endpoints have been updated to support mock mode via `UAT_MOCK_AI=1` environment variable. When enabled, endpoints return deterministic responses with predictable request IDs for reliable UAT testing.

## Mock Endpoints

### 1. `/api/ai-advisor/chat` (POST)

**Status:** ✅ Fully Mocked

**Mock Behavior:**
- Returns deterministic responses based on message content, context, and intent
- Supports both streaming and non-streaming modes
- Always returns 200 OK

**Mock Request ID:** `mock-req-chat-12345` (deterministic)

**Response Format (Non-Streaming):**
```json
{
  "ok": true,
  "response": "This is a mock AI advisor response for UAT testing...",
  "conversationId": "mock-conv-123",
  "requestId": "mock-req-chat-12345"
}
```

**Response Format (Streaming):**
```
data: {"content": "This", "done": false}

data: {"content": " is", "done": false}

data: {"content": " a", "done": false}

...

data: {"content": "", "done": true, "conversationId": "mock-conv-123", "requestId": "mock-req-chat-12345"}
```

**Implementation:**
- Mock mode check after authentication
- Uses `getMockChatResponse()` function for context-aware responses
- Simulates streaming with 50ms delays between chunks

---

### 2. `/api/ai-advisor/voice` (POST)

**Status:** ✅ Fully Mocked

**Note:** The user mentioned `/api/voice/transcribe`, but this endpoint doesn't exist. Voice transcription is handled by `/api/ai-advisor/voice`.

**Mock Behavior:**
- Returns deterministic transcription text
- Returns mock AI response using same logic as chat endpoint
- Always returns 200 OK

**Mock Request ID:** `mock-req-voice-12345` (deterministic)

**Response Format:**
```json
{
  "transcript": "This is a mock voice transcription for UAT testing. In production, this would be the actual transcribed text from the audio input.",
  "responseText": "This is a mock AI advisor response for UAT testing...",
  "conversationId": "mock-conv-123",
  "requestId": "mock-req-voice-12345"
}
```

**Implementation:**
- Mock mode check after authentication
- Uses `getMockVoiceTranscript()` for deterministic transcription
- Uses `getMockChatResponse()` for AI response

---

### 3. `/api/realtime/connect` (POST)

**Status:** ✅ Fully Mocked

**Mock Behavior:**
- Returns deterministic SDP answer (200 OK) by default
- Can simulate unavailable (503) when `UAT_MOCK_REALTIME_UNAVAILABLE=1` is set
- Always returns predictable responses

**Mock Request ID:** `mock-req-realtime-connect-12345` (deterministic)

**Response Format (Success - 200 OK):**
```json
{
  "sdp": "v=0\r\no=- ...",
  "session_id": "mock-session-123"
}
```

**Response Format (Unavailable - 503):**
```json
{
  "error": "Realtime service unavailable",
  "message": "Realtime API is temporarily unavailable (mock mode)",
  "details": "This is a mock response for UAT testing"
}
```

**Implementation:**
- Mock mode check after authentication
- Checks `UAT_MOCK_REALTIME_UNAVAILABLE` for fallback testing
- Returns valid WebRTC SDP format for success case

---

### 4. `/api/realtime/session` (POST)

**Status:** ✅ Fully Mocked

**Mock Behavior:**
- Returns deterministic session credentials
- Always returns 200 OK
- Session ID format: `mock_session_{userId}_{timestamp}`

**Response Format:**
```json
{
  "client_secret": "base64-encoded-mock-token",
  "expires_at": "2024-01-01T12:00:00.000Z",
  "session_id": "mock_session_user123_1234567890",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy",
  "turn_detection": true
}
```

**Implementation:**
- Mock mode check before API key validation
- Returns deterministic session credentials

---

## Request ID Summary

All endpoints use **deterministic request IDs** in mock mode:

| Endpoint | Mock Request ID |
|----------|----------------|
| `/api/ai-advisor/chat` | `mock-req-chat-12345` |
| `/api/ai-advisor/voice` | `mock-req-voice-12345` |
| `/api/realtime/connect` | `mock-req-realtime-connect-12345` |
| `/api/realtime/session` | N/A (no request ID in response) |

## Environment Variables

### Primary Control
```bash
UAT_MOCK_AI=1  # Enables mock mode for all endpoints
```

### Additional Controls
```bash
UAT_MOCK_REALTIME_UNAVAILABLE=1  # Simulates Realtime unavailable (503)
```

## Testing with Mock Mode

### Enable Mock Mode
```bash
export UAT_MOCK_AI=1
npm run test:e2e
```

### Test Realtime Fallback
```bash
export UAT_MOCK_AI=1
export UAT_MOCK_REALTIME_UNAVAILABLE=1
npm run test:e2e
```

### Disable Mock Mode
```bash
unset UAT_MOCK_AI
unset UAT_MOCK_REALTIME_UNAVAILABLE
```

## Production Safety

✅ **No UI Changes:** Mock mode is controlled entirely by environment variables  
✅ **No Production Impact:** When `UAT_MOCK_AI` is not set, all endpoints behave normally  
✅ **Early Return:** Mock responses are returned immediately after authentication  
✅ **Deterministic:** Same inputs always produce same outputs for reliable testing  
✅ **Predictable Request IDs:** All mock responses use fixed request IDs for test assertions

## Files Modified

1. `app/api/ai-advisor/chat/route.ts`
   - Added deterministic request ID in mock mode
   - Mock mode check after authentication
   - Streaming and non-streaming support

2. `app/api/ai-advisor/voice/route.ts`
   - Added deterministic request ID in mock mode
   - Mock mode check after authentication
   - Deterministic transcription and response

3. `app/api/realtime/connect/route.ts`
   - Added deterministic request ID in mock mode
   - Mock mode check after authentication
   - Success and unavailable response support

4. `app/api/realtime/session/route.ts`
   - Mock mode check before API key validation
   - Deterministic session credentials

## Verification Checklist

- [x] All endpoints check `UAT_MOCK_AI=1` environment variable
- [x] Mock responses return deterministic request IDs
- [x] Mock responses are context-aware where applicable
- [x] Streaming responses are properly mocked
- [x] Production behavior unchanged when mock mode disabled
- [x] No UI changes required
- [x] All endpoints return 200 OK (except Realtime unavailable scenario)
