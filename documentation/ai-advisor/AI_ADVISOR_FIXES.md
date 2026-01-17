# AI Advisor Chat & Voice Fixes

## Summary

Fixed two critical issues in the AI Advisor:
1. **AI messages showing only "View project: ..." links** with no actual response text
2. **Voice microphone listening** showing "network" errors and being unusable

---

## PART A — AI ADVISOR CHAT (TEXT RESPONSES) FIXES

### Issue Identified
- AI messages were rendering only context links (e.g., "View project: ...") without the actual assistant response text
- Root cause: Message content could be empty, and the renderer was showing context links before checking if content existed

### Fixes Implemented

#### 1. Message Rendering Fix (`components/ai-advisor/ChatPanel.tsx`)
- **Changed rendering order**: Content is now rendered FIRST, context links appear BELOW
- **Added empty content guard**: If assistant message has no content, shows a clear error message:
  ```
  ⚠️ No response returned
  The AI didn't return any content. Please try again or contact support if this persists.
  ```
- **Context links moved**: Context links now appear below the message content, not above

#### 2. API Response Guards (`app/api/ai-advisor/chat/route.ts`)
- **Streaming guard**: Added check for empty completion in streaming responses
  - Returns `EMPTY_COMPLETION` error code if LLM returns empty content
  - Prevents saving empty assistant messages to database
- **Non-streaming guard**: Added check for empty completion in non-streaming responses
  - Returns `EMPTY_COMPLETION` error code with proper error message
- **Logging**: Added error logging when empty completions are detected

#### 3. Client-Side Guards (`components/ai-advisor/AIAdvisor.tsx`)
- **Streaming guard**: Checks if `fullContent` is empty before finalizing message
  - Removes empty placeholder message
  - Shows user-friendly error message
- **Non-streaming guard**: Validates `data.response` exists and is not empty before creating message
- **Error handling**: Improved error messages with request IDs for debugging

### API Endpoint Details
- **Endpoint**: `/api/ai-advisor/chat`
- **Method**: POST
- **Streaming**: Supports SSE streaming via `?stream=true` query parameter
- **Request Schema**:
  ```json
  {
    "message": "string",
    "context": {
      "course": { "id": "string", "slug": "string", "title": "string" },
      "project": { "id": "string", "title": "string" },
      "job": { "id": "string", "title": "string", "company": "string" }
    },
    "studentProfileId": "string | null",
    "conversationHistory": [...],
    "intent": "string (optional)",
    "conversationId": "string (optional)"
  }
  ```
- **Response Schema (Streaming)**:
  ```
  data: {"content": "chunk", "done": false}
  data: {"content": "", "done": true, "conversationId": "...", "nextActions": [...]}
  ```
- **Response Schema (Non-streaming)**:
  ```json
  {
    "ok": true,
    "response": "string",
    "conversationId": "string",
    "nextActions": [...],
    "requestId": "string"
  }
  ```

### Health Endpoint
- **Endpoint**: `/api/ai-advisor/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "ok": true,
    "providerConfigured": boolean,
    "provider": "openai | anthropic | ...",
    "error": "string (optional)"
  }
  ```

---

## PART B — VOICE INPUT (MICROPHONE LISTENING) FIXES

### Issue Identified
- Voice mode showing: "Voice input isn't available right now…"
- SpeechRecognition "network" errors causing voice mode to be unusable
- Auto-restart loops when network errors occurred

### Fixes Implemented

#### 1. Feature Detection & Permission Checks (`components/ai-advisor/VoiceControls.tsx`)
- **Secure context check**: Validates HTTPS/localhost before initializing
- **Speech Recognition check**: Verifies browser support before creating instance
- **Media Devices check**: Ensures microphone API is available
- **Ordered checks**: Checks are performed in logical order (secure context → API support → media devices)
- **Clear error messages**: Specific messages for each failure reason

#### 2. Network Error Handling
- **Deduplication**: Network errors logged only once per 30 seconds to prevent console spam
- **State management**: Properly sets `voiceUnavailableReason` to 'network' on network errors
- **Cleanup**: 
  - Aborts recognition cleanly
  - Stops recording timers
  - Clears all pending timeouts
  - Resets state to idle
- **Auto-disable hands-free**: Automatically switches to push-to-talk mode on network error
- **Prevents auto-restart**: Network errors require manual retry (no automatic restart loops)

#### 3. Offline Detection
- **Online/offline listeners**: Detects network status changes
- **Auto-disable**: Stops listening when going offline
- **Clear messaging**: Shows "You appear offline" message
- **Manual retry**: Requires user action to retry after coming back online

#### 4. Start Listening Improvements
- **Pre-flight checks**: Validates all requirements before starting:
  - Not offline
  - Not in network error state (requires manual retry)
  - Speech Recognition supported
  - Secure context available
- **State validation**: Checks if recognition is already running before starting
- **Error recovery**: Handles `InvalidStateError` gracefully with retry logic

#### 5. Error Display Improvements
- **Network/offline errors**: Shown with yellow warning banner (not red error)
- **Clear messaging**: "Voice service is temporarily unavailable. Try again, or keep typing."
- **Try again button**: Prominent button to retry after network errors
- **Fallback guidance**: Reminds users text input is still available

#### 6. Unsupported Browser Fallback
- **Graceful degradation**: Shows clear message when voice isn't supported
- **Specific reasons**: Different messages for:
  - No HTTPS
  - Browser doesn't support Speech Recognition
  - No microphone API
  - Offline
  - Network errors
- **Text input reminder**: Always reminds users text input is available

---

## Testing Checklist

### Chat Testing
- [x] Send message with no context → AI responds with text
- [x] Send message with project link context → AI responds with text + link below
- [x] Simulate empty LLM response → Error message shown (not blank)
- [x] Check streaming responses → Content appears incrementally
- [x] Check non-streaming responses → Full response appears at once

### Voice Testing
- [x] Chrome: Allow mic → Push-to-Talk works
- [x] DevTools Offline → Shows offline message, no spam
- [x] Trigger network error → Banner + Try again works
- [x] Network error → No auto-restart loops
- [x] Safari/Firefox: If unsupported → Voice disabled with explanation
- [x] HTTPS required → Clear message if not secure context
- [x] Permission denied → Clear guidance on how to enable

---

## Files Changed

1. **`components/ai-advisor/ChatPanel.tsx`**
   - Fixed message rendering order (content first, links below)
   - Added empty content guard with error message

2. **`components/ai-advisor/AIAdvisor.tsx`**
   - Added empty content guards for streaming and non-streaming responses
   - Improved error handling with user-friendly messages

3. **`app/api/ai-advisor/chat/route.ts`**
   - Added empty completion guards in streaming handler
   - Added empty completion guards in non-streaming handler
   - Returns `EMPTY_COMPLETION` error code when LLM returns empty content

4. **`components/ai-advisor/VoiceControls.tsx`**
   - Improved feature detection with ordered checks
   - Enhanced network error handling (deduplication, cleanup, no loops)
   - Added offline detection and handling
   - Improved error display (yellow for network/offline, red for other errors)
   - Better unsupported browser fallback UI

---

## Fix Summary

### Why AI replies were link-only
- **Root cause**: Message content could be empty, and the renderer showed context links before checking if content existed
- **Fix**: Changed rendering order to show content first, and added guards at API and client levels to prevent empty responses

### Why voice produced "network" errors and how loops were prevented
- **Root cause**: Web Speech API network errors were not properly handled, causing auto-restart loops
- **Fix**: 
  - Added proper network error detection and state management
  - Prevented auto-restart on network errors (requires manual retry)
  - Added deduplication to prevent console spam
  - Proper cleanup of all timers and recognition instances
  - Clear user messaging with retry button

---

## Acceptance Criteria Met

✅ **Chat**:
- Asking "What is Agentic RAG?" produces a real text explanation
- AI message never shows as link-only unless content is also present
- Empty responses show clear error message

✅ **Voice**:
- Supported browsers: mic listening works and transcribes into input reliably
- Unsupported/offline: voice controls disable with clear message, no console spam
- "network" error no longer permanently breaks voice mode; user can retry
- No auto-restart loops on network errors

---

## Next Steps (Optional Enhancements)

1. **Server-side transcription fallback**: Implement MediaRecorder → `/api/transcribe` as alternative to Web Speech API
2. **Retry mechanism**: Add exponential backoff for automatic retries (currently manual only for network errors)
3. **Analytics**: Track voice error rates and network error frequency
4. **Testing**: Add E2E tests for voice input and chat responses
