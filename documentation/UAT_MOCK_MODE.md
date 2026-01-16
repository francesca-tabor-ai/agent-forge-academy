# UAT Mock Mode for AI Advisor

## Overview

The AI Advisor backend supports a mock mode for deterministic UAT testing. When enabled, all AI-related endpoints return predictable, canned responses instead of calling actual AI services.

## Environment Variables

### Primary Control
- `UAT_MOCK_AI=1` - Enables mock mode for all AI advisor endpoints

### Additional Controls
- `UAT_MOCK_REALTIME_UNAVAILABLE=1` - When set with `UAT_MOCK_AI=1`, simulates Realtime API unavailable (503) for testing fallback behavior

## Affected Endpoints

### 1. `/api/ai-advisor/chat` (POST)
**Mock Behavior:**
- Returns deterministic responses based on:
  - Message content
  - Active context (course/project/job)
  - Intent (if provided)
- Supports both streaming and non-streaming modes
- Always returns 200 OK with mock response

**Mock Response Examples:**
- Course context: `"I can help you with **{course.title}**. Based on your question "{message}", here's a helpful response..."`
- Project context: `"I can help you with your project **{project.title}**. Based on your question "{message}", here's a helpful response..."`
- Job context: `"I can help you with the job application for **{job.title} at {job.company}**. Based on your question "{message}", here's a helpful response..."`
- Default: Generic mock response with user's message echoed back

### 2. `/api/ai-advisor/voice` (POST)
**Mock Behavior:**
- Returns deterministic transcription: `"This is a mock voice transcription for UAT testing. In production, this would be the actual transcribed text from the audio input."`
- Returns mock AI response using the same logic as chat endpoint
- Always returns 200 OK

**Response Format:**
```json
{
  "transcript": "This is a mock voice transcription for UAT testing...",
  "responseText": "This is a mock AI advisor response...",
  "conversationId": "mock-conv-123",
  "requestId": "voice_..."
}
```

### 3. `/api/realtime/session` (POST)
**Mock Behavior:**
- Returns deterministic session credentials
- Session ID format: `mock_session_{userId}_{timestamp}`
- Always returns 200 OK with mock session data

**Response Format:**
```json
{
  "client_secret": "base64-encoded-mock-token",
  "expires_at": "2024-01-01T12:00:00.000Z",
  "session_id": "mock_session_...",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "voice": "alloy",
  "turn_detection": true/false
}
```

### 4. `/api/realtime/connect` (POST)
**Mock Behavior:**
- If `UAT_MOCK_REALTIME_UNAVAILABLE=1`: Returns 503 Service Unavailable (for testing fallback)
- Otherwise: Returns mock SDP answer (200 OK) with valid WebRTC SDP format

**Response Format (Success):**
```json
{
  "sdp": "v=0\r\no=- ...",
  "session_id": "mock-session-123"
}
```

**Response Format (Unavailable):**
```json
{
  "error": "Realtime service unavailable",
  "message": "Realtime API is temporarily unavailable (mock mode)",
  "details": "This is a mock response for UAT testing"
}
```
Status: 503

## Usage

### Enable Mock Mode
```bash
# Enable mock mode
export UAT_MOCK_AI=1

# Run tests
npm run test:e2e

# Or run in headed mode
npm run test:e2e:headed
```

### Test Realtime Fallback
```bash
# Enable mock mode with unavailable Realtime
export UAT_MOCK_AI=1
export UAT_MOCK_REALTIME_UNAVAILABLE=1

# Run tests
npm run test:e2e
```

### Disable Mock Mode
```bash
# Unset the environment variable
unset UAT_MOCK_AI
unset UAT_MOCK_REALTIME_UNAVAILABLE

# Or set to empty/0
export UAT_MOCK_AI=0
```

## Implementation Details

### Mock Response Logic

The mock responses are context-aware and deterministic:

1. **Context Detection:**
   - Checks for active course/project/job in request context
   - Returns context-specific mock responses

2. **Intent Detection:**
   - Uses provided intent parameter
   - Falls back to message content analysis (keywords: "explain", "how", "what", "project", "review", "job", "career")

3. **Streaming Support:**
   - Mock streaming responses simulate word-by-word delivery
   - 50ms delay between chunks for realistic behavior

### Production Safety

- **No UI Changes:** Mock mode is controlled entirely by environment variables
- **No Production Impact:** When `UAT_MOCK_AI` is not set, all endpoints behave normally
- **Early Return:** Mock responses are returned immediately after authentication, before any AI service calls
- **Deterministic:** Same inputs always produce same outputs for reliable testing

## Testing Scenarios

### 1. Basic Chat Flow
```typescript
// With UAT_MOCK_AI=1
POST /api/ai-advisor/chat
{
  "message": "Explain CRAG",
  "context": { "course": { "id": "123", "slug": "agentic-rag", "title": "Agentic RAG" } }
}

// Returns deterministic response mentioning the course
```

### 2. Voice Transcription
```typescript
// With UAT_MOCK_AI=1
POST /api/ai-advisor/voice
FormData: { audio: File, context: {...} }

// Returns deterministic transcript and response
```

### 3. Realtime Connection Success
```typescript
// With UAT_MOCK_AI=1 (and UAT_MOCK_REALTIME_UNAVAILABLE not set)
POST /api/realtime/connect
{ "sdp": "...", "session_token": "..." }

// Returns 200 OK with mock SDP answer
```

### 4. Realtime Connection Failure (Fallback Test)
```typescript
// With UAT_MOCK_AI=1 and UAT_MOCK_REALTIME_UNAVAILABLE=1
POST /api/realtime/connect
{ "sdp": "...", "session_token": "..." }

// Returns 503 Service Unavailable
// Frontend should trigger fallback to Standard voice mode
```

## Files Modified

1. `app/api/ai-advisor/chat/route.ts`
   - Added `getMockChatResponse()` function
   - Added mock mode check after authentication
   - Supports streaming and non-streaming responses

2. `app/api/ai-advisor/voice/route.ts`
   - Added `getMockVoiceTranscript()` function
   - Added `getMockChatResponse()` function (duplicated from chat route)
   - Added mock mode check after authentication

3. `app/api/realtime/session/route.ts`
   - Added mock mode check before API key validation
   - Returns deterministic session credentials

4. `app/api/realtime/connect/route.ts`
   - Added mock mode check after authentication
   - Supports both success (200) and unavailable (503) responses
   - Returns mock SDP answer for success case

## Notes

- Mock mode is **only** enabled when `UAT_MOCK_AI=1` is explicitly set
- All mock responses include clear indicators that they are for UAT testing
- Mock responses are deterministic but context-aware for realistic testing
- Production code path is completely unchanged when mock mode is disabled
