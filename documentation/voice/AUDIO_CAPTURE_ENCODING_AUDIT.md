# Audio Capture and Encoding Audit

**Date:** 2024-12-19  
**Purpose:** Audit MediaRecorder/WebAudio usage, codec selection, sample rate, and channel configuration.

---

## Current Implementation Analysis

### Standard Voice Mode

#### Audio Capture Method

**Component:** `components/ai-advisor/VoiceControls.tsx`

**Current Implementation:**
- **Default Mode:** Browser Speech Recognition API (`webkitSpeechRecognition` / `SpeechRecognition`)
  - **No MediaRecorder usage** - Relies entirely on browser's Speech Recognition
  - **No audio encoding** - Browser handles audio internally
  - **No codec specification** - Browser-dependent
  - **No sample rate control** - Browser default
  - **No channel control** - Browser default

- **Mock Mode:** Creates minimal WebM blob (not real recording)
  - **Location:** `createMockAudioBlob()` (lines 146-159)
  - **Format:** `audio/webm` (minimal EBML structure)
  - **Purpose:** Testing only - no actual audio data
  - **Not a real MediaRecorder implementation**

**Issues Identified:**
1. ❌ **No MediaRecorder implementation** - Cannot record audio for API fallback
2. ❌ **No codec specification** - Browser Speech Recognition codec is unknown
3. ❌ **No sample rate control** - Uses browser default (typically 48kHz)
4. ❌ **No channel control** - Uses browser default (typically mono for speech)
5. ❌ **No audio constraints** - No echo cancellation, noise suppression, etc.

#### API Endpoint Expectations

**Endpoint:** `POST /api/ai-advisor/voice`

**Accepted Formats:**
- `audio/webm`
- `audio/mp3`
- `audio/wav`
- `audio/m4a`
- `audio/ogg`

**Current Behavior:**
- Accepts any of the above formats
- Sends to OpenAI Whisper API (accepts all formats)
- No format validation beyond MIME type
- No codec validation

**Duration Estimation:**
```typescript
// Rough estimate: ~16KB per second for webm
const duration = audioBlob.size > 0 ? Math.ceil(audioBlob.size / 16000) : undefined;
```
- ⚠️ **Inaccurate** - WebM bitrate varies significantly
- ⚠️ **No actual duration calculation** - Should decode audio to get real duration

---

### WebRTC Realtime Mode

#### Audio Capture Method

**Component:** `components/ai-advisor/WebRTCRealtime.tsx`

**Current Implementation:**
```typescript
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
```

**Issues Identified:**
1. ❌ **No audio constraints** - Uses browser defaults
2. ❌ **No echo cancellation specified** - May cause echo/feedback
3. ❌ **No noise suppression specified** - May pick up background noise
4. ❌ **No auto gain control specified** - Volume may be inconsistent
5. ❌ **No sample rate specified** - Browser default (typically 48kHz)
6. ❌ **No channel count specified** - Browser default (typically mono)

**WebRTC Configuration:**
- **Codec:** Opus (specified in SDP: `a=rtpmap:111 opus/48000/2`)
- **Sample Rate:** 48kHz (from SDP)
- **Channels:** Stereo (2 channels, from SDP)
- **Format:** RTP stream over WebRTC

**Realtime API Configuration:**
```typescript
input_audio_format: 'pcm16',
output_audio_format: 'pcm16',
```
- **Input Format:** PCM16 (16-bit PCM)
- **Output Format:** PCM16 (16-bit PCM)
- **Note:** WebRTC handles Opus → PCM16 conversion automatically

**Issues:**
- ⚠️ **Mismatch:** getUserMedia may not produce 48kHz stereo
- ⚠️ **No constraint validation** - Browser may use different sample rate/channels
- ⚠️ **No format verification** - Cannot confirm actual audio format

---

## Codec Analysis

### Standard Mode

| Aspect | Current | Expected | Status |
|--------|---------|----------|--------|
| **Codec** | Unknown (browser-dependent) | WebM/Opus or WAV/PCM | ❌ Not specified |
| **Sample Rate** | Unknown (browser default) | 16kHz or 48kHz | ❌ Not specified |
| **Channels** | Unknown (browser default) | Mono (1) | ❌ Not specified |
| **Bitrate** | Unknown | Variable | ❌ Not specified |
| **Container** | N/A (Speech Recognition) | WebM or WAV | ❌ Not applicable |

**Recommendation:**
- If implementing MediaRecorder fallback, use:
  - **Codec:** Opus (WebM container)
  - **Sample Rate:** 48kHz (or 16kHz for smaller files)
  - **Channels:** Mono (1) for speech
  - **Bitrate:** 32-64 kbps for speech

### WebRTC Mode

| Aspect | Current | Expected | Status |
|--------|---------|----------|--------|
| **Codec** | Opus (via WebRTC) | Opus | ✅ Correct |
| **Sample Rate** | 48kHz (SDP) | 48kHz | ✅ Correct |
| **Channels** | Stereo (2, SDP) | Stereo (2) | ✅ Correct |
| **Format** | PCM16 (Realtime API) | PCM16 | ✅ Correct |
| **Constraints** | None specified | Echo cancellation, noise suppression | ❌ Missing |

**Recommendation:**
- Add audio constraints to getUserMedia:
  ```typescript
  {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
      channelCount: 1, // Mono for speech (or 2 for stereo)
    }
  }
  ```

---

## MediaRecorder Usage

### Current Status

**Standard Mode:**
- ❌ **No MediaRecorder implementation**
- Mock mode creates minimal WebM blob (not real recording)
- No actual audio capture for API fallback

**WebRTC Mode:**
- ❌ **No MediaRecorder usage**
- Uses WebRTC directly (no intermediate recording)

### Recommended Implementation

**For Standard Mode API Fallback:**

```typescript
// Start recording
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    channelCount: 1, // Mono for speech
  }
});

const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 64000, // 64 kbps for speech
});

const chunks: Blob[] = [];
mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunks.push(event.data);
  }
};

mediaRecorder.onstop = () => {
  const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
  // Send to API
};

mediaRecorder.start();
// ... stop when done
mediaRecorder.stop();
```

**Codec Support Check:**
```typescript
const isOpusSupported = MediaRecorder.isTypeSupported('audio/webm;codecs=opus');
const isWebmSupported = MediaRecorder.isTypeSupported('audio/webm');
// Fallback to WAV if Opus not supported
```

---

## WebAudio Usage

### Current Status

**Standard Mode:**
- ❌ **No WebAudio usage**
- No AudioContext creation
- No audio processing

**WebRTC Mode:**
- ❌ **No WebAudio usage**
- No AudioContext creation
- No audio processing

### Potential Use Cases

1. **Audio Analysis:**
   - VAD (Voice Activity Detection)
   - Volume level monitoring
   - Silence detection

2. **Audio Processing:**
   - Noise reduction
   - Echo cancellation (if not handled by browser)
   - Normalization

3. **Audio Visualization:**
   - Waveform display
   - Volume meter

**Recommendation:**
- Consider WebAudio for VAD if browser Speech Recognition doesn't provide it
- Use for audio visualization (waveform, volume meter)
- Not required for basic recording (MediaRecorder is sufficient)

---

## Sample Rate Analysis

### Current Implementation

**Standard Mode:**
- **Unknown** - Browser Speech Recognition default
- Typically 48kHz for modern browsers
- May vary by browser/OS

**WebRTC Mode:**
- **48kHz** - Specified in SDP (`opus/48000/2`)
- Browser may resample if getUserMedia produces different rate
- Realtime API expects PCM16 (no sample rate specified, assumes 48kHz)

**Whisper API:**
- Accepts any sample rate
- Automatically resamples to 16kHz internally
- No sample rate requirement

**Recommendation:**
- **Standard Mode:** 48kHz (matches WebRTC, good quality)
- **WebRTC Mode:** 48kHz (already correct)
- **Alternative:** 16kHz for smaller files (acceptable for speech)

---

## Channel Configuration

### Current Implementation

**Standard Mode:**
- **Unknown** - Browser Speech Recognition default
- Typically mono (1 channel) for speech recognition
- May vary by browser/OS

**WebRTC Mode:**
- **Stereo (2 channels)** - Specified in SDP (`opus/48000/2`)
- **Issue:** Speech typically uses mono (1 channel)
- **Waste:** Stereo doubles bandwidth for no benefit

**Recommendation:**
- **Standard Mode:** Mono (1 channel) for speech
- **WebRTC Mode:** Mono (1 channel) for speech
- **Update SDP:** Change to `opus/48000/1` or let browser negotiate

---

## Issues Summary

### Critical Issues

1. **No MediaRecorder Implementation**
   - **Impact:** Cannot record audio for API fallback
   - **Severity:** HIGH
   - **Fix:** Implement MediaRecorder with Opus codec

2. **No Audio Constraints in WebRTC**
   - **Impact:** Poor audio quality (echo, noise, inconsistent volume)
   - **Severity:** HIGH
   - **Fix:** Add echo cancellation, noise suppression, auto gain control

3. **WebRTC Uses Stereo Instead of Mono**
   - **Impact:** Wastes bandwidth (doubles data for no benefit)
   - **Severity:** MEDIUM
   - **Fix:** Specify mono (1 channel) in constraints

### Medium Issues

4. **No Codec Specification in Standard Mode**
   - **Impact:** Unknown codec, cannot optimize
   - **Severity:** MEDIUM
   - **Fix:** Implement MediaRecorder with explicit codec

5. **No Sample Rate Control**
   - **Impact:** May use inefficient sample rates
   - **Severity:** MEDIUM
   - **Fix:** Specify sample rate in constraints

6. **Inaccurate Duration Estimation**
   - **Impact:** Duration shown to user may be wrong
   - **Severity:** LOW
   - **Fix:** Decode audio to get actual duration

---

## Recommendations

### Immediate Fixes

1. **Add Audio Constraints to WebRTC:**
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({
     audio: {
       echoCancellation: true,
       noiseSuppression: true,
       autoGainControl: true,
       sampleRate: 48000,
       channelCount: 1, // Mono for speech
     }
   });
   ```

2. **Update WebRTC SDP for Mono:**
   - Change from `opus/48000/2` to `opus/48000/1`
   - Or let browser negotiate based on constraints

### Future Enhancements

3. **Implement MediaRecorder for Standard Mode:**
   - Use Opus codec (WebM container)
   - 48kHz sample rate, mono channel
   - 64 kbps bitrate
   - Fallback to WAV if Opus not supported

4. **Add Audio Format Validation:**
   - Verify codec before sending to API
   - Log actual format for debugging
   - Provide user feedback if format issues

5. **Add Duration Calculation:**
   - Decode audio to get actual duration
   - Use WebAudio API or audio element
   - Display accurate duration to user

---

## Testing Checklist

### Codec Verification
- [ ] Standard Mode: Verify browser Speech Recognition codec (if possible)
- [ ] WebRTC Mode: Verify Opus codec in SDP
- [ ] MediaRecorder: Test Opus support, fallback to WAV

### Sample Rate Verification
- [ ] Standard Mode: Check actual sample rate (if accessible)
- [ ] WebRTC Mode: Verify 48kHz in SDP and constraints
- [ ] Test with different browsers (may vary)

### Channel Verification
- [ ] Standard Mode: Check channel count (if accessible)
- [ ] WebRTC Mode: Verify mono (1 channel) after fix
- [ ] Test stereo vs mono quality/bandwidth

### Audio Quality
- [ ] Test echo cancellation (speak near speakers)
- [ ] Test noise suppression (background noise)
- [ ] Test auto gain control (varying distances)
- [ ] Test audio quality across browsers

### Format Validation
- [ ] Verify WebM/Opus format
- [ ] Test WAV fallback
- [ ] Verify API accepts all formats
- [ ] Test file size vs quality tradeoff

---

## Evidence Collection

### Console Logs
- MediaRecorder codec support
- getUserMedia constraints
- Audio track settings (sampleRate, channelCount)
- SDP audio parameters

### Audio Format Verification
- Record sample audio
- Inspect with audio analysis tool
- Verify codec, sample rate, channels
- Compare file size vs quality

### Browser Differences
- Test in Chrome, Firefox, Safari, Edge
- Document codec differences
- Document sample rate differences
- Document channel differences

---

## Next Steps

1. **Immediate:** Add audio constraints to WebRTC getUserMedia
2. **Immediate:** Update WebRTC to use mono (1 channel)
3. **Short-term:** Implement MediaRecorder for Standard Mode API fallback
4. **Short-term:** Add codec support detection
5. **Long-term:** Add WebAudio for VAD/visualization
6. **Long-term:** Add audio format validation and logging
