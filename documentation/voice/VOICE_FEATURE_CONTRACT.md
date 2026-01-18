# Voice Feature Contract

**Purpose:** Document the expected behavior, payload shapes, streaming format, and state storage for both voice modes.

**Last Updated:** 2024-12-19

---

## Overview

The AI Advisor supports two voice modes:

1. **Standard Voice Mode** - Record → Upload → Transcript → Model Response → Audio Playback
2. **WebRTC Realtime Mode** - Connect → Stream Mic → Receive Audio + Partial Text → End Turn

---

## Feature Flags

### Standard Voice Mode
- **Flag:** `ENABLE_VOICE_API`
- **Location:** Server-side only (`app/api/ai-advisor/voice/route.ts`)
- **Default:** `false` (disabled)
- **Behavior:**
  - When `ENABLE_VOICE_API !== 'true'`: Returns `403 Forbidden`
  - When `ENABLE_VOICE_API === 'true'`: Voice API endpoint is enabled
- **Note:** Client-side does NOT check this flag. Client relies on browser Speech Recognition API by default, with optional API fallback in mock mode.

### WebRTC Realtime Mode
- **Flag:** None (always available if OpenAI API key is configured)
- **Gating:** Controlled by `OPENAI_API_KEY` or `LLM_API_KEY` environment variable
- **Behavior:**
  - If API key missing: Returns `500 Internal Server Error` from `/api/realtime/session`
  - If API key present: Realtime mode is available

---

## Standard Voice Mode Contract

### Flow Diagram

```
User Action
    ↓
[Browser Speech Recognition API]
    ↓ (or Mock Mode: MediaRecorder)
[Audio Blob Created]
    ↓
[POST /api/ai-advisor/voice]
    ↓
[OpenAI Whisper (STT)]
    ↓
[Transcript Text]
    ↓
[LLM Processing]
    ↓
[Model Response]
    ↓
[Optional: OpenAI TTS]
    ↓
[Response to Client]
```

### Client-Side Behavior

**Component:** `components/ai-advisor/VoiceControls.tsx`

**Modes:**
- **Push-to-Talk:** User holds mic button → Records → Releases → Sends
- **Hands-Free:** User clicks mic → Records → Auto-stops after 3s silence → Sends

**Capture Method:**
- **Default:** Browser Speech Recognition API (`webkitSpeechRecognition` or `SpeechRecognition`)
- **Mock Mode:** MediaRecorder → Creates WebM blob → Sends to API
- **Fallback:** None (if browser Speech Recognition fails, user must use text)

**State Storage (Client):**
- `isListening: boolean` - Recording state
- `recognitionState: 'idle' | 'listening' | 'processing' | 'error'` - Recognition state
- `partialTranscript: string` - Interim results from Speech Recognition
- `finalTranscript: string` - Final transcript
- `editableTranscript: string` - Editable transcript (if `allowEditBeforeSend=true`)
- `error: string | null` - Error message
- `voiceUnavailableReason: string | null` - Reason voice is unavailable
- `recordingDuration: number` - Recording duration in seconds

**Audio Output Toggle:**
- **Prop:** `voiceOutputEnabled: boolean` (default: `false`)
- **Behavior:** Controls browser Speech Synthesis API (`speechSynthesis.speak()`)
- **Implementation:** 
  - When `voiceOutputEnabled=true`: Assistant responses are spoken via TTS
  - When `voiceOutputEnabled=false`: No audio playback
- **Location:** `components/ai-advisor/VoiceControls.tsx` (lines 1026-1080)
- **Respected:** ✅ Yes - Toggle controls `speak()` function

### API Endpoint

**Endpoint:** `POST /api/ai-advisor/voice`

**Request Format:**
```typescript
FormData {
  audio: File,                    // Audio blob (webm, mp3, wav, m4a, ogg)
  studentProfileId?: string,      // Optional: Student profile ID
  conversationId?: string,        // Optional: Conversation ID
  context?: string,               // Optional: JSON stringified context
  intent?: string,                // Optional: Intent classification
  generateAudio?: 'true' | 'false' // Optional: Whether to generate TTS audio
}
```

**Request Validation:**
- Audio file required (400 if missing)
- Audio format: `audio/webm`, `audio/mp3`, `audio/wav`, `audio/m4a`, `audio/ogg`
- Max file size: 10MB
- Feature flag: `ENABLE_VOICE_API === 'true'` (403 if disabled)

**Response Format:**
```typescript
{
  transcript: string,              // Transcribed text
  responseText: string,             // LLM response
  conversationId: string,           // Conversation ID
  requestId: string,               // Request ID for observability
  responseAudio?: string           // Optional: Base64-encoded audio (if generateAudio=true)
                                   // Format: "data:audio/mp3;base64,<base64>"
}
```

**Response Processing:**
1. **STT:** Audio → OpenAI Whisper API → Transcript
2. **LLM:** Transcript + Context → LLM Provider → Response
3. **TTS (Optional):** Response → OpenAI TTS API → Audio blob → Base64

**State Storage (Server):**
- **Database:** `advisor_conversations` table
  - `student_profile_id: string`
  - `conversation_id: string`
  - `role: 'user' | 'assistant'`
  - `content: string` (transcript or response)
  - `metadata: JSONB` (intent, tools, voice metadata, citations)

**Error Responses:**
- `400 Bad Request`: Missing audio, invalid format, no speech detected
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Feature flag disabled
- `500 Internal Server Error`: Transcription/LLM/TTS failure
- `502 Bad Gateway`: Upstream service (Whisper/TTS) error

---

## WebRTC Realtime Mode Contract

### Flow Diagram

```
User Clicks Connect
    ↓
[POST /api/realtime/session]
    ↓
[Ephemeral Session Credentials]
    ↓
[Create RTCPeerConnection]
    ↓
[POST /api/realtime/connect (SDP Offer)]
    ↓
[SDP Answer from OpenAI]
    ↓
[WebRTC Connection Established]
    ↓
[DataChannel "oai-events" Opens]
    ↓
[Send System Config Event]
    ↓
[Stream Microphone Audio (WebRTC)]
    ↓
[Receive Audio + Transcripts (WebRTC)]
    ↓
[End Turn / Disconnect]
```

### Client-Side Behavior

**Component:** `components/ai-advisor/WebRTCRealtime.tsx`

**Modes:**
- **Push-to-Talk:** User holds mic button → Enables mic track → Releases → Commits turn
- **Hands-Free:** User enables → Mic continuously active → Server-side turn detection → Auto-commits

**Capture Method:**
- `navigator.mediaDevices.getUserMedia({ audio: true })` → `MediaStream`
- Audio track added to `RTCPeerConnection`
- Track enabled/disabled based on mode and user action

**State Storage (Client):**
- `isConnected: boolean` - WebRTC connection state
- `isConnecting: boolean` - Connection in progress
- `isMuted: boolean` - Microphone mute state
- `voiceMode: 'push-to-talk' | 'hands-free'` - Current mode
- `isHoldingMic: boolean` - Push-to-talk hold state
- `voiceOutputEnabled: boolean` - Voice output toggle (default: `true`)
- `partialUserTranscript: string` - Partial user transcript
- `partialAssistantTranscript: string` - Partial assistant transcript
- `currentTranscript: string` - Current transcript
- `error: string | null` - Error message
- `hasFailed: boolean` - Connection failure state
- `showFallbackMessage: boolean` - Show fallback banner

**Audio Output Toggle:**
- **Prop:** `voiceOutputEnabled: boolean` (default: `true`)
- **Behavior:** Controls audio element mute state
- **Implementation:**
  - When `voiceOutputEnabled=true`: `audioElement.muted = false`
  - When `voiceOutputEnabled=false`: `audioElement.muted = true`
- **Location:** `components/ai-advisor/WebRTCRealtime.tsx` (lines 1033-1041, 1058-1062)
- **Respected:** ✅ Yes - Toggle controls audio element mute state

**Audio Playback:**
- Audio element created and attached to DOM (hidden)
- Remote audio track from PeerConnection attached to `audioElement.srcObject`
- Autoplay enabled (with error handling for autoplay policies)

### API Endpoints

#### 1. Session Creation

**Endpoint:** `POST /api/realtime/session`

**Request Format:**
```typescript
{
  enableTurnDetection?: boolean  // Optional: Enable for hands-free mode
}
```

**Response Format:**
```typescript
{
  client_secret: string,          // Ephemeral token (base64)
  expires_at: string,             // ISO timestamp
  session_id: string,             // Session ID
  model: string,                  // Model name (e.g., "gpt-4o-realtime-preview-2024-12-17")
  voice: string,                  // Voice name (e.g., "alloy")
  turn_detection: boolean         // Turn detection enabled
}
```

**Rate Limiting:**
- 5 sessions per hour per user
- Returns `429 Too Many Requests` if exceeded

#### 2. WebRTC Connection

**Endpoint:** `POST /api/realtime/connect`

**Request Format:**
```typescript
{
  sdp: string,                    // SDP offer (plain text)
  session_token?: string          // Optional: Session token
}
```

**Response Format:**
```typescript
{
  sdp: string                     // SDP answer (plain text)
}
```

**Behavior:**
- Proxies SDP offer to OpenAI Realtime API
- Returns SDP answer to client
- Never exposes OpenAI API key to client

#### 3. Tool Execution

**Endpoint:** `POST /api/realtime/tool`

**Request Format:**
```typescript
{
  toolName: string,               // Tool name
  parameters: object,              // Tool parameters
  studentProfileId?: string        // Optional: Student profile ID
}
```

**Response Format:**
```typescript
{
  result: any                      // Tool execution result
}
```

### DataChannel Protocol

**Channel Name:** `"oai-events"`

**Event Types (Client → Server):**
```typescript
// System configuration
{
  type: 'session.update',
  session: {
    modalities: ['text', 'audio'],
    instructions: string,
    voice: string,
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    input_audio_transcription: { model: 'whisper-1' },
    turn_detection: { type: 'server_vad', threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 500 }
  },
  tools: Array<{ type: 'function', name: string, description: string, parameters: object }>
}

// Commit user turn (push-to-talk)
{
  type: 'input_audio_buffer.commit'
}

// Request response
{
  type: 'response.create'
}

// Tool call result
{
  type: 'conversation.item.create',
  item: {
    type: 'function_call_output',
    call_id: string,
    output: string  // JSON stringified result
  }
}
```

**Event Types (Server → Client):**
```typescript
// Partial user transcript
{
  type: 'conversation.item.input_audio_transcription.delta',
  delta: string
}

// Final user transcript
{
  type: 'conversation.item.input_audio_transcription.completed',
  transcript: string
}

// Partial assistant transcript
{
  type: 'response.audio_transcript.delta',
  delta: string
}
// OR
{
  type: 'response.content.delta',
  content: string
}

// Final assistant transcript
{
  type: 'response.audio_transcript.done',
  transcript: string
}
// OR
{
  type: 'response.done',
  content: string
}

// Tool call request
{
  type: 'conversation.item.requires_action',
  item: {
    type: 'function_call',
    id: string,
    name: string,
    arguments: string  // JSON stringified
  }
}

// Error
{
  type: 'error',
  error: {
    message: string,
    code: string
  }
}
```

**Streaming Format:**
- **Audio:** WebRTC RTP stream (Opus codec, 48kHz, stereo)
- **Text:** JSON events via DataChannel (UTF-8)
- **Bidirectional:** Audio streams in both directions simultaneously

**State Storage (Server):**
- **No persistent state** - WebRTC connection is ephemeral
- **Session tracking:** Ephemeral tokens (15-minute TTL)
- **Rate limiting:** In-memory per-user counters
- **Note:** Conversation history stored client-side via callbacks to `onFinalUserTranscript` / `onFinalAssistantTranscript`

---

## Endpoint Summary

| Mode | Endpoint | Method | Purpose | Feature Flag |
|------|----------|--------|---------|--------------|
| Standard | `/api/ai-advisor/voice` | POST | Audio transcription + LLM response | `ENABLE_VOICE_API` |
| Realtime | `/api/realtime/session` | POST | Create ephemeral session | None (requires API key) |
| Realtime | `/api/realtime/connect` | POST | WebRTC SDP exchange | None (requires API key) |
| Realtime | `/api/realtime/tool` | POST | Execute tool calls | None (requires API key) |

---

## Audio Output Toggle Behavior

### Standard Mode
- **Location:** `components/ai-advisor/VoiceControls.tsx`
- **Implementation:** Browser Speech Synthesis API
- **Respected:** ✅ Yes
- **Behavior:**
  - When enabled: `speechSynthesis.speak(utterance)` called
  - When disabled: No TTS playback
  - Toggle passed via `voiceOutputEnabled` prop

### WebRTC Realtime Mode
- **Location:** `components/ai-advisor/WebRTCRealtime.tsx`
- **Implementation:** Audio element mute state
- **Respected:** ✅ Yes
- **Behavior:**
  - When enabled: `audioElement.muted = false`
  - When disabled: `audioElement.muted = true`
  - Toggle passed via `voiceOutputEnabled` prop (default: `true`)

### Integration
- **Parent Component:** `components/ai-advisor/AIAdvisor.tsx`
- **State:** `voiceOutputEnabled` state managed in `AIAdvisor`
- **Propagation:** Passed to both `VoiceControls` and `WebRTCRealtime` components
- **Toggle Handler:** `handleVoiceOutputToggle` updates state and passes to children

---

## State Storage Summary

### Client-Side State

**Standard Mode (`VoiceControls.tsx`):**
- Recording state (listening, processing, error)
- Transcripts (partial, final, editable)
- Error messages
- Permission errors
- Network status
- **Storage:** React state (in-memory, lost on page refresh)

**WebRTC Mode (`WebRTCRealtime.tsx`):**
- Connection state (connected, connecting, failed)
- Microphone state (muted, holding)
- Transcripts (partial user, partial assistant, current)
- Error messages
- **Storage:** React state (in-memory, lost on page refresh)

**Parent Component (`AIAdvisor.tsx`):**
- Voice output toggle state
- Conversation messages
- Active context
- **Storage:** React state + Database (messages persisted)

### Server-Side State

**Standard Mode:**
- **Database:** `advisor_conversations` table
  - User messages with voice metadata
  - Assistant responses
  - Conversation history
  - Context (course/project/job)
- **Temporary:** None (stateless API)

**WebRTC Mode:**
- **Database:** None (ephemeral connection)
- **Temporary:** 
  - Ephemeral session tokens (15-minute TTL)
  - Rate limit counters (in-memory)
  - **Note:** Conversation history stored client-side via callbacks

---

## Checklist

### ✅ Feature Flag Gating
- **Standard Mode:** Gated by `ENABLE_VOICE_API` server-side
- **WebRTC Mode:** Gated by `OPENAI_API_KEY` presence

### ✅ Separate Endpoints
- **Standard Mode:** `/api/ai-advisor/voice` (single endpoint)
- **WebRTC Mode:** `/api/realtime/session`, `/api/realtime/connect`, `/api/realtime/tool` (three endpoints)

### ✅ Audio Output Toggle Respected
- **Standard Mode:** ✅ Controls Speech Synthesis API
- **WebRTC Mode:** ✅ Controls audio element mute state
- **Integration:** ✅ State managed in parent, passed to both components

---

## Payload Shapes Reference

### Standard Mode Request
```typescript
FormData {
  audio: File,                    // Required: Audio blob
  studentProfileId?: string,      // Optional
  conversationId?: string,        // Optional
  context?: string,                // Optional: JSON string
  intent?: string,                 // Optional
  generateAudio?: 'true' | 'false' // Optional
}
```

### Standard Mode Response
```typescript
{
  transcript: string,
  responseText: string,
  conversationId: string,
  requestId: string,
  responseAudio?: string           // Optional: "data:audio/mp3;base64,..."
}
```

### WebRTC Session Request
```typescript
{
  enableTurnDetection?: boolean
}
```

### WebRTC Session Response
```typescript
{
  client_secret: string,
  expires_at: string,
  session_id: string,
  model: string,
  voice: string,
  turn_detection: boolean
}
```

### WebRTC Connect Request
```typescript
{
  sdp: string,
  session_token?: string
}
```

### WebRTC Connect Response
```typescript
{
  sdp: string
}
```

### DataChannel Event (Client → Server)
```typescript
{
  type: string,
  session?: object,
  tools?: Array<object>,
  item?: object
}
```

### DataChannel Event (Server → Client)
```typescript
{
  type: string,
  delta?: string,
  transcript?: string,
  content?: string,
  item?: object,
  error?: object
}
```

---

## Notes

1. **Standard Mode** uses browser Speech Recognition API by default, with optional API fallback in mock mode only.
2. **WebRTC Mode** requires persistent connection - audio streams bidirectionally via WebRTC.
3. **Audio Output Toggle** is respected in both modes but implemented differently (Speech Synthesis vs. audio element mute).
4. **State Persistence:** Only Standard Mode persists conversation history to database. WebRTC Mode relies on client-side callbacks.
5. **Feature Flags:** Standard Mode is gated by `ENABLE_VOICE_API`. WebRTC Mode is gated by API key presence.
