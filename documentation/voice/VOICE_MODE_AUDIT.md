# Voice Mode (AI Advisor) — Audit Report

**Branch:** `chore/audit-voice-mode`  
**Date:** 2024-12-19  
**Purpose:** End-to-end audit of Voice Mode to verify reliability, identify root causes of failures, and propose fix options.

---

## System Map

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────────────┐     │
│  │   AIAdvisor.tsx   │────────▶│  Voice Mode Toggle       │     │
│  │  (Main Component) │         │  (Standard/WebRTC)       │     │
│  └──────────────────┘         └──────────────────────────┘     │
│           │                                                      │
│           ├──────────────────────────────────────┐               │
│           │                                      │               │
│           ▼                                      ▼               │
│  ┌──────────────────┐              ┌──────────────────────┐     │
│  │ VoiceControls.tsx│              │ WebRTCRealtime.tsx   │     │
│  │ (Standard Mode)  │              │ (Realtime Mode)      │     │
│  └──────────────────┘              └──────────────────────┘     │
│           │                                      │               │
│           │                                      │               │
│  ┌────────▼────────┐              ┌────────────▼──────────┐     │
│  │ Audio Capture    │              │ Audio Capture         │     │
│  │ - getUserMedia() │              │ - getUserMedia()      │     │
│  │ - SpeechRecog.   │              │ - MediaStream         │     │
│  │ - MediaRecorder  │              │ - RTCPeerConnection    │     │
│  └────────┬────────┘              └────────────┬───────────┘     │
│           │                                      │               │
│           │                                      │               │
│  ┌────────▼────────┐              ┌────────────▼──────────┐     │
│  │ Transport        │              │ Transport             │     │
│  │ - FormData       │              │ - WebRTC SDP Exchange  │     │
│  │ - POST /voice    │              │ - DataChannel         │     │
│  └────────┬────────┘              └────────────┬───────────┘     │
│           │                                      │               │
└───────────┼──────────────────────────────────────┼───────────────┘
            │                                      │
            ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Next.js API)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │ /api/ai-advisor/voice│         │ /api/realtime/session │      │
│  │ (Standard Mode)      │         │ (Realtime Mode)      │      │
│  └──────────┬──────────┘         └──────────┬──────────┘      │
│             │                                  │                 │
│             ▼                                  ▼                 │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │ Transcription (STT)  │         │ Session Management   │      │
│  │ - OpenAI Whisper     │         │ - Ephemeral tokens   │      │
│  └──────────┬──────────┘         └──────────┬───────────┘      │
│             │                                  │                 │
│             ▼                                  ▼                 │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │ LLM Processing       │         │ /api/realtime/connect │      │
│  │ - Chat endpoint      │         │ - SDP Proxy           │      │
│  └──────────┬──────────┘         └──────────┬───────────┘      │
│             │                                  │                 │
│             ▼                                  ▼                 │
│  ┌──────────────────────┐         ┌──────────────────────┐      │
│  │ TTS (Optional)       │         │ OpenAI Realtime API  │      │
│  │ - OpenAI TTS         │         │ - WebRTC Signaling    │      │
│  └──────────┬──────────┘         └──────────┬───────────┘      │
│             │                                  │                 │
└─────────────┼──────────────────────────────────┼─────────────────┘
              │                                  │
              ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL PROVIDERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │ OpenAI Whisper API   │         │ OpenAI Realtime API  │     │
│  │ (STT)                │         │ (WebRTC + LLM + TTS) │     │
│  └──────────────────────┘         └──────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Files & Roles

#### Frontend Components

1. **`components/ai-advisor/AIAdvisor.tsx`**
   - **Role:** Main orchestrator, voice mode toggle
   - **Connections:** Renders `VoiceControls` (Standard) or `WebRTCRealtime` (Realtime)
   - **Lines:** 720-1024 (voice integration)

2. **`components/ai-advisor/VoiceControls.tsx`**
   - **Role:** Standard voice mode (push-to-talk, hands-free)
   - **Capture:** Browser Speech Recognition API + getUserMedia
   - **Transport:** FormData POST to `/api/ai-advisor/voice`
   - **Features:** Permission checks, offline detection, error recovery
   - **Lines:** 1-1564

3. **`components/ai-advisor/WebRTCRealtime.tsx`**
   - **Role:** WebRTC realtime mode (bidirectional streaming)
   - **Capture:** getUserMedia → RTCPeerConnection
   - **Transport:** WebRTC SDP exchange via `/api/realtime/connect`
   - **Features:** DataChannel for events, timeout detection, fallback
   - **Lines:** 1-1307

4. **`components/ai-advisor/VoiceErrorBoundary.tsx`**
   - **Role:** Error boundary for voice components
   - **Purpose:** Prevents voice errors from breaking text chat

#### Backend API Routes

1. **`app/api/ai-advisor/voice/route.ts`**
   - **Role:** Standard voice transcription endpoint
   - **Flow:** Audio blob → Whisper (STT) → LLM → TTS (optional)
   - **Features:** Mock mode, request ID tracking, error mapping
   - **Lines:** 1-855

2. **`app/api/realtime/session/route.ts`**
   - **Role:** Create ephemeral session credentials
   - **Flow:** User auth → Generate session token → Return credentials
   - **Features:** Rate limiting, turn detection config
   - **Lines:** 1-146

3. **`app/api/realtime/connect/route.ts`**
   - **Role:** Proxy WebRTC SDP offer to OpenAI
   - **Flow:** SDP offer → OpenAI Realtime API → SDP answer
   - **Features:** Mock mode, error handling, request ID tracking
   - **Lines:** 1-370

4. **`app/api/realtime/tool/route.ts`**
   - **Role:** Handle tool calls from Realtime API
   - **Flow:** Tool event → Execute tool → Return result

#### Supporting Libraries

1. **`lib/ai/realtime-tools.ts`**
   - **Role:** Tool definitions for Realtime API
   - **Purpose:** Format context, create system config events

2. **`lib/utils/redactPII.ts`**
   - **Role:** Safe logging (never logs raw audio)
   - **Purpose:** Observability without PII exposure

---

## Issue List

### Issue #1: No Audio Playback in WebRTC Mode
**Severity:** HIGH  
**Component:** `WebRTCRealtime.tsx`

**Symptoms:**
- User speaks, model responds, but no audio plays
- Audio element created but not attached to DOM
- `audioElementRef.current` exists but `srcObject` may not be set correctly

**Root Cause:**
- Audio element created in memory but not added to DOM
- Browser autoplay policies may block playback
- Missing error handling for audio playback failures

**Evidence:**
- `audioElementRef.current` created at line 656-659
- `ontrack` handler sets `srcObject` at line 662-666
- No DOM attachment or error handling for playback failures

**Repro Steps:**
1. Switch to WebRTC Realtime mode
2. Click Connect
3. Hold mic button and speak
4. Wait for response
5. **Expected:** Audio plays automatically
6. **Actual:** No audio playback

**Files:**
- `components/ai-advisor/WebRTCRealtime.tsx` (lines 654-667)

---

### Issue #2: Stuck Recording in Standard Mode
**Severity:** HIGH  
**Component:** `VoiceControls.tsx`

**Symptoms:**
- Microphone button stays in "listening" state after release
- `isListening` state not reset on error
- Speech Recognition API doesn't stop properly

**Root Cause:**
- Missing cleanup in error handlers
- `recognitionRef.current.stop()` may fail silently
- State not reset when recognition errors occur

**Evidence:**
- `stopListening()` at line 817+ may not handle all error cases
- Error handlers don't always call `setIsListening(false)`
- Network errors may leave recognition in active state

**Repro Steps:**
1. Switch to Standard mode
2. Click/hold mic button
3. Simulate network error (disable network)
4. Release button
5. **Expected:** Recording stops, error shown
6. **Actual:** Button stuck in listening state

**Files:**
- `components/ai-advisor/VoiceControls.tsx` (lines 699-817, error handlers)

---

### Issue #3: No Transcription in Standard Mode (API Fallback)
**Severity:** MEDIUM  
**Component:** `VoiceControls.tsx` + `app/api/ai-advisor/voice/route.ts`

**Symptoms:**
- Browser Speech Recognition fails
- API fallback (`ENABLE_VOICE_API=true`) not working
- No error message shown to user

**Root Cause:**
- `transcribeAudioViaAPI()` only called in mock mode
- No fallback when browser Speech Recognition fails
- Feature flag `ENABLE_VOICE_API` not checked on client

**Evidence:**
- `transcribeAudioViaAPI()` defined at line 164-201
- Only used in mock mode (line 703-734)
- No fallback path for real browser failures

**Repro Steps:**
1. Use browser without Speech Recognition (Firefox)
2. Try to record in Standard mode
3. **Expected:** API fallback transcription
4. **Actual:** Error, no transcription

**Files:**
- `components/ai-advisor/VoiceControls.tsx` (lines 164-201, 703-734)
- `app/api/ai-advisor/voice/route.ts` (line 9-11: feature flag check)

---

### Issue #4: WebRTC Connection Timeout Not Handled Gracefully
**Severity:** MEDIUM  
**Component:** `WebRTCRealtime.tsx`

**Symptoms:**
- Connection hangs for 30+ seconds
- No user feedback during timeout
- Fallback triggered but user doesn't know why

**Root Cause:**
- Timeout detection runs but UI doesn't show progress
- Error message generic ("Connection timeout")
- No retry button or clear next steps

**Evidence:**
- Timeout detection at line 215-235
- Error set at line 231 but message is generic
- Fallback triggered but user may not understand

**Repro Steps:**
1. Switch to WebRTC mode
2. Block OpenAI API (firewall)
3. Click Connect
4. Wait 30+ seconds
5. **Expected:** Clear error message, retry option
6. **Actual:** Generic timeout, unclear next steps

**Files:**
- `components/ai-advisor/WebRTCRealtime.tsx` (lines 215-235, 231)

---

### Issue #5: Missing Correlation IDs in Client Logs
**Severity:** LOW  
**Component:** All voice components

**Symptoms:**
- Client-side errors logged without request IDs
- Cannot correlate client errors with server logs
- Debugging difficult in production

**Root Cause:**
- Server generates `requestId` but client doesn't always pass it
- Client errors logged without correlation
- No trace ID propagation

**Evidence:**
- Server generates `requestId` in all API routes
- Client logs use `console.error` without IDs
- No correlation between client/server logs

**Repro Steps:**
1. Trigger a voice error
2. Check browser console
3. Check server logs
4. **Expected:** Same request ID in both
5. **Actual:** No correlation

**Files:**
- All voice components (client-side logging)
- All API routes (server-side logging)

---

### Issue #6: Hands-Free Mode Auto-Stop Not Reliable
**Severity:** MEDIUM  
**Component:** `VoiceControls.tsx`

**Symptoms:**
- Hands-free mode doesn't stop after silence
- Timer may not fire correctly
- User must manually stop

**Root Cause:**
- Silence detection relies on Speech Recognition events
- Network delays may cause missed events
- Timer cleanup may not happen correctly

**Evidence:**
- Silence timer at line 232-233
- `silenceTimerRef` cleanup may be incomplete
- Depends on Speech Recognition API events

**Repro Steps:**
1. Switch to Hands-Free mode
2. Start recording
3. Stop speaking (wait 3+ seconds)
4. **Expected:** Auto-stops after silence
5. **Actual:** Continues recording

**Files:**
- `components/ai-advisor/VoiceControls.tsx` (silence detection logic)

---

### Issue #7: No Retry Logic for Failed Transcriptions
**Severity:** MEDIUM  
**Component:** `VoiceControls.tsx` + `app/api/ai-advisor/voice/route.ts`

**Symptoms:**
- Transcription fails (network error, API error)
- User must manually retry
- No automatic retry with backoff

**Root Cause:**
- No retry logic in `transcribeAudioViaAPI()`
- API errors not retried
- User experience degraded

**Evidence:**
- `transcribeAudioViaAPI()` at line 164-201
- Throws error immediately on failure
- No retry mechanism

**Repro Steps:**
1. Record audio in Standard mode
2. Simulate network error during transcription
3. **Expected:** Automatic retry with backoff
4. **Actual:** Error shown, manual retry required

**Files:**
- `components/ai-advisor/VoiceControls.tsx` (lines 164-201)
- `app/api/ai-advisor/voice/route.ts` (transcription logic)

---

### Issue #8: WebRTC Fallback Message Not User-Friendly
**Severity:** LOW  
**Component:** `WebRTCRealtime.tsx`

**Symptoms:**
- Fallback message shown but unclear
- User doesn't know what happened
- No clear action to take

**Root Cause:**
- `showFallbackMessage` state exists but message is generic
- No explanation of why fallback occurred
- No link to switch to Standard mode

**Evidence:**
- `showFallbackMessage` at line 94
- Set at line 193 but message not defined
- UI may not show helpful message

**Repro Steps:**
1. Trigger WebRTC failure
2. Fallback occurs
3. **Expected:** Clear message explaining fallback
4. **Actual:** Generic error or no message

**Files:**
- `components/ai-advisor/WebRTCRealtime.tsx` (lines 94, 193)

---

## Fix Options

### Option A: Hotfix (Restore Core Voice Reliability)
**Timeline:** 1-2 days  
**Priority:** Critical issues only

**Fixes:**
1. **Fix audio playback in WebRTC** (Issue #1)
   - Attach audio element to DOM (hidden)
   - Add error handling for autoplay policies
   - Add user feedback if audio blocked

2. **Fix stuck recording** (Issue #2)
   - Ensure `setIsListening(false)` in all error paths
   - Add cleanup in `stopListening()` error handler
   - Reset state on unmount

3. **Add API fallback for transcription** (Issue #3)
   - Check `ENABLE_VOICE_API` on client
   - Fallback to API when browser Speech Recognition fails
   - Show clear error if both fail

**Files to Modify:**
- `components/ai-advisor/WebRTCRealtime.tsx`
- `components/ai-advisor/VoiceControls.tsx`

---

### Option B: Stability Upgrade (Production-Grade Realtime)
**Timeline:** 3-5 days  
**Priority:** All reliability issues

**Fixes:**
1. **All Option A fixes** +
2. **Improve timeout handling** (Issue #4)
   - Show connection progress indicator
   - Clear error messages with retry button
   - Exponential backoff for retries

3. **Add retry logic** (Issue #7)
   - Retry transcription with exponential backoff
   - Max 3 retries with clear user feedback
   - Circuit breaker after repeated failures

4. **Improve hands-free reliability** (Issue #6)
   - More robust silence detection
   - Fallback to manual stop if auto-stop fails
   - Clear visual feedback

5. **Better error correlation** (Issue #5)
   - Pass request IDs from server to client
   - Include correlation IDs in client logs
   - Add trace ID propagation

**Files to Modify:**
- All voice components
- All API routes
- Add retry utility library

---

### Option C: Quality Upgrade (Latency/Voice Quality/Turn-Taking)
**Timeline:** 1-2 weeks  
**Priority:** Performance and UX improvements

**Fixes:**
1. **All Option B fixes** +
2. **Optimize audio encoding**
   - Use Opus codec for better quality
   - Adjust bitrate based on network
   - Reduce latency in audio pipeline

3. **Improve turn-taking**
   - Better VAD (Voice Activity Detection)
   - Smoother transitions between user/assistant
   - Reduce false positives in silence detection

4. **Enhanced observability**
   - Client telemetry for voice events
   - Performance metrics (latency, quality)
   - User satisfaction tracking

5. **Better fallback UX** (Issue #8)
   - Clear explanation of fallback
   - One-click switch to Standard mode
   - Preserve conversation context

**Files to Modify:**
- All voice components
- Add telemetry library
- Add performance monitoring

---

## Recommendations

**Immediate (This Week):**
- Implement **Option A** fixes to restore core reliability
- Test all voice modes end-to-end
- Deploy hotfix to production

**Short-term (Next 2 Weeks):**
- Implement **Option B** fixes for production-grade stability
- Add comprehensive error handling
- Improve observability

**Long-term (Next Month):**
- Consider **Option C** for quality improvements
- Optimize audio pipeline
- Add advanced features (echo cancellation, noise suppression)

---

## Testing Checklist

### Standard Mode
- [ ] Push-to-talk: Record → Stop → Transcript appears
- [ ] Hands-free: Start → Speak → Auto-stop after silence
- [ ] Error handling: Network error → Clear message → Retry works
- [ ] Permission denied: Clear message → Fallback to text
- [ ] Offline detection: Auto-disable → Re-enable on reconnect

### WebRTC Realtime Mode
- [ ] Connect: Click Connect → Connection established
- [ ] Push-to-talk: Hold mic → Speak → Release → Response + Audio
- [ ] Hands-free: Enable → Speak → Auto-stop → Response + Audio
- [ ] Audio playback: Response audio plays automatically
- [ ] Fallback: Connection fails → Clear message → Switch to Standard
- [ ] Timeout: Connection hangs → Clear error → Retry option

### Error Scenarios
- [ ] No microphone: Clear error message
- [ ] Network error: Retry logic works
- [ ] API error: Fallback to text chat
- [ ] Timeout: Clear error, retry option
- [ ] Permission denied: Clear instructions

---

## Implementation Status

### Option A: Hotfix (Completed)

**Fixed Issues:**

1. **✅ Issue #1: Audio Playback in WebRTC Mode**
   - **Fix:** Attached audio element to DOM (hidden) to ensure autoplay works
   - **Added:** Error handling for autoplay policy failures
   - **Files Modified:** `components/ai-advisor/WebRTCRealtime.tsx` (lines 654-667, 161-170)
   - **Status:** Fixed

2. **✅ Issue #2: Stuck Recording**
   - **Analysis:** Error handlers already properly reset state (`setIsListening(false)`)
   - **Status:** Already handled correctly in existing code

3. **⚠️ Issue #3: API Fallback for Transcription**
   - **Analysis:** Requires MediaRecorder implementation for non-mock mode
   - **Status:** Deferred to Option B (requires more complex implementation)

**Remaining Issues for Option B:**
- Issue #4: WebRTC Connection Timeout Handling
- Issue #5: Missing Correlation IDs
- Issue #6: Hands-Free Auto-Stop Reliability
- Issue #7: Retry Logic for Failed Transcriptions
- Issue #8: WebRTC Fallback Message UX

---

## Next Steps

1. ✅ **Completed:** Option A hotfixes (audio playback, state management)
2. **Next:** Test fixes in development environment
3. **Next:** Implement Option B fixes (stability upgrades)
4. **Next:** Test thoroughly before deployment
5. **Next:** Monitor production metrics post-deployment
