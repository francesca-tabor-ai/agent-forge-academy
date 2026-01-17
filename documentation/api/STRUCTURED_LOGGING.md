# Structured Logging for AI Advisor APIs

## Overview

All AI Advisor API endpoints now use structured logging with consistent format including request IDs, status codes, and error reasons (without leaking sensitive keys).

## Logging Format

### Standard Log Structure

All logs follow this structure:

```typescript
safeLogger.{level}('[ServiceName] Log message', {
  requestId: string,        // Unique request identifier
  userId?: string,          // User ID (if authenticated)
  statusCode: number,       // HTTP status code
  errorCode?: string,       // Error code (e.g., 'UNAUTHORIZED', 'SERVICE_UNAVAILABLE')
  path: string,             // API path (e.g., '/api/ai-advisor/chat')
  method: string,           // HTTP method (e.g., 'POST')
  errorMessage?: string,    // Error reason (without leaking keys)
  // ... other context fields
});
```

## Endpoints

### 1. `/api/ai-advisor/chat` (POST)

**Request ID Format:**
- Mock mode: `mock-req-chat-12345`
- Production: `req_{timestamp}_{random}`

**Log Events:**

1. **Request Received**
   ```typescript
   safeLogger.info('[ChatAPI] Request received', {
     requestId,
     userId: user.id,
     path: '/api/ai-advisor/chat',
     method: 'POST',
     hasContext: !!context,
     hasConversationHistory: conversationHistory?.length > 0,
     intent: intent || 'general',
   });
   ```

2. **Request Completed (Success)**
   ```typescript
   safeLogger.info('[ChatAPI] Request completed', { 
     requestId, 
     userId: user.id,
     statusCode: 200,
     totalLatency,
     path: '/api/ai-advisor/chat',
     method: 'POST',
     conversationId: convId,
   });
   ```

3. **Error (with Status Code)**
   ```typescript
   safeLogger.error('[ChatAPI] Error generating LLM response', { 
     requestId,
     userId: user.id,
     statusCode,              // 400, 401, 429, 503, 504, 500
     errorCode,                // 'BAD_REQUEST', 'UNAUTHORIZED', 'RATE_LIMIT_EXCEEDED', 'SERVICE_UNAVAILABLE', 'TIMEOUT', 'UPSTREAM_ERROR'
     path: '/api/ai-advisor/chat',
     method: 'POST',
     model: process.env.OPENAI_MODEL,
     upstreamStatus,           // Upstream API status if available
     errorMessage,             // Error reason without leaking keys
     elapsed,
     stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
   });
   ```

### 2. `/api/ai-advisor/voice` (POST)

**Request ID Format:**
- Mock mode: `mock-req-voice-12345`
- Production: `voice_{timestamp}_{random}`

**Log Events:**

1. **Feature Disabled**
   ```typescript
   safeLogger.warn('[VoiceAPI] Feature disabled', { 
     requestId,
     statusCode: 403,
     errorCode: 'FEATURE_DISABLED',
     path: '/api/ai-advisor/voice',
     method: 'POST',
   });
   ```

2. **Unauthorized**
   ```typescript
   safeLogger.warn('[VoiceAPI] Unauthorized request', { 
     requestId,
     userId: null,
     statusCode: 401,
     errorCode: 'UNAUTHORIZED',
     path: '/api/ai-advisor/voice',
     method: 'POST',
   });
   ```

3. **Request Completed (Success)**
   ```typescript
   safeLogger.info('[VoiceAPI] Request completed', {
     requestId,
     userId: user.id,
     statusCode: 200,
     path: '/api/ai-advisor/voice',
     method: 'POST',
     conversationId: convId,
     hasAudio: !!responseAudio,
   });
   ```

4. **Error (with Status Code and Step)**
   ```typescript
   safeLogger.error('[VoiceAPI] Error processing voice request', {
     requestId,
     userId: user?.id,
     statusCode,              // 400, 401, 403, 502, 500
     errorCode,                // 'BAD_REQUEST', 'UNAUTHORIZED', 'FEATURE_DISABLED', 'UPSTREAM_ERROR', 'INTERNAL_ERROR'
     path: '/api/ai-advisor/voice',
     method: 'POST',
     errorStep,                // 'STT', 'LLM', 'TTS', or 'unknown'
     errorMessage,             // Error reason without leaking keys
     stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
   });
   ```

### 3. `/api/realtime/connect` (POST)

**Request ID Format:**
- Mock mode: `mock-req-realtime-connect-12345`
- Production: `realtime-{timestamp}-{random}`

**Log Events:**

1. **Auth Error**
   ```typescript
   safeLogger.error('[RealtimeConnect] Auth error', {
     requestId: reqId,
     statusCode: 401,
     errorCode: 'UNAUTHORIZED',
     path: '/api/realtime/connect',
     method: 'POST',
     errorMessage: authError.message,
     authErrorCode: authError.status,
   });
   ```

2. **Missing SDP Offer**
   ```typescript
   safeLogger.error('[RealtimeConnect] Missing SDP offer', {
     requestId: reqId,
     userId: user.id,
     statusCode: 400,
     errorCode: 'BAD_REQUEST',
     path: '/api/realtime/connect',
     method: 'POST',
     hasSessionToken: !!session_token,
   });
   ```

3. **Connection Attempt**
   ```typescript
   safeLogger.info('[RealtimeConnect] Attempting connection to OpenAI', {
     requestId: reqId,
     userId: user.id,
     path: '/api/realtime/connect',
     method: 'POST',
     sdpLength: sdp.length,
     hasSessionToken: !!session_token,
     endpoint: REALTIME_ENDPOINT,
   });
   ```

4. **Connection Success**
   ```typescript
   safeLogger.info('[RealtimeConnect] WebRTC SDP exchange successful', {
     requestId: reqId,
     userId: user.id,
     statusCode: 200,
     path: '/api/realtime/connect',
     method: 'POST',
     sdpAnswerLength: sdpAnswer.length,
     hasAudio: false, // Never log raw audio
   });
   ```

5. **OpenAI API Error**
   ```typescript
   safeLogger.error('[RealtimeConnect] OpenAI API returned error', {
     requestId: reqId,
     userId: user.id,
     statusCode: statusCode,   // 400, 401, 429, 500
     errorCode,                // 'BAD_REQUEST', 'UNAUTHORIZED', 'RATE_LIMIT_EXCEEDED', 'UPSTREAM_ERROR'
     path: '/api/realtime/connect',
     method: 'POST',
     upstreamStatus: response.status,
     upstreamStatusText: response.statusText,
     errorMessage,             // Error reason without leaking keys
     hasSdp: !!sdp,
     sdpLength: sdp?.length || 0,
     hasOpenAIKey: process.env.NODE_ENV === 'development' ? !!OPENAI_API_KEY : undefined,
     endpoint: REALTIME_ENDPOINT,
   });
   ```

6. **Network Error**
   ```typescript
   safeLogger.error('[RealtimeConnect] Network error connecting to OpenAI', {
     requestId: reqId,
     userId: user.id,
     statusCode: 500,
     errorCode: 'NETWORK_ERROR',
     path: '/api/realtime/connect',
     method: 'POST',
     errorMessage: error.message,
     errorName: error.name,
     endpoint: REALTIME_ENDPOINT,
     stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
   });
   ```

## Error Response Format

All error responses include `requestId`:

```json
{
  "ok": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "AI service is not configured. Please contact support.",
    "requestId": "req_1234567890_abc123"
  }
}
```

## UI Display

Request IDs are displayed in error messages:

1. **Chat Errors**: Request ID appears in service unavailable banner
   - Format: `⚠️ **Service unavailable** — ... **Request ID:** {requestId}`

2. **Voice Errors**: Request ID appears in error message
   - Format: `Failed to transcribe audio. Please try again or use text input. (Request ID: {requestId})`

3. **WebRTC Errors**: Request ID appears in error message
   - Format: `Realtime service is temporarily unavailable. Please try again later. (Request ID: {requestId})`

## Security

- **No API Keys Logged**: API keys are never logged, even in development
- **No PII in Logs**: User messages, transcripts, and audio data are never logged
- **Stack Traces**: Only logged in development mode
- **Error Messages**: Sanitized to not leak sensitive information

## Test Assertions

UAT tests verify request IDs appear in UI:

1. **Chat 503 Error**: Verifies request ID in service unavailable banner
2. **Voice Error**: Verifies request ID in error message (if API returns it)
3. **WebRTC Error**: Verifies error message is displayed (may contain request ID)

## Log Levels

- **info**: Successful operations, request received, request completed
- **warn**: Non-critical issues (feature disabled, unauthorized, fallback scenarios)
- **error**: Critical errors (API failures, connection errors, validation errors)

## Example Log Output

```
[ChatAPI] Request received { requestId: 'req_1234567890_abc123', userId: 'user-123', path: '/api/ai-advisor/chat', method: 'POST', hasContext: true, intent: 'general' }
[ChatAPI] Request completed { requestId: 'req_1234567890_abc123', userId: 'user-123', statusCode: 200, totalLatency: 1234, conversationId: 'conv-456' }
[ChatAPI] Error generating LLM response { requestId: 'req_1234567890_abc123', userId: 'user-123', statusCode: 503, errorCode: 'SERVICE_UNAVAILABLE', errorMessage: 'AI service is not configured', elapsed: 5000 }
```

## Files Modified

1. `app/api/ai-advisor/chat/route.ts` - Enhanced structured logging
2. `app/api/ai-advisor/voice/route.ts` - Enhanced structured logging
3. `app/api/realtime/connect/route.ts` - Enhanced structured logging
4. `components/ai-advisor/AIAdvisor.tsx` - Already displays request IDs in errors
5. `components/ai-advisor/VoiceControls.tsx` - Extracts and displays request IDs
6. `components/ai-advisor/WebRTCRealtime.tsx` - Extracts and displays request IDs
7. `tests/e2e/ai-advisor.spec.ts` - Added tests to verify request IDs in UI
