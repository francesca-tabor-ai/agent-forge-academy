# Voice API Testing Guide

Quick guide to test the Voice API after setting up OpenAI API key and enabling the feature.

---

## ✅ Configuration Checklist

Verify these environment variables are set in `.env.local`:

```env
# Required for Voice API
OPENAI_API_KEY=sk-...                    # Your OpenAI API key
ENABLE_VOICE_API=true                     # Enable voice endpoint

# Optional (if different from LLM key)
LLM_API_KEY=sk-...                       # Can be same as OPENAI_API_KEY
LLM_PROVIDER=openai                      # Default: openai
```

**Note**: `OPENAI_API_KEY` is used for:
- Whisper API (Speech-to-Text)
- TTS API (Text-to-Speech)

---

## 🧪 Testing Methods

### Method 1: Browser UI (Easiest)

1. **Navigate to AI Advisor**
   - Go to `/student/ai-advisor` (or wherever AIAdvisor component is used)
   - You should see `VoiceControls` component above the text input

2. **Test Voice Input**
   - Click the microphone button
   - Speak your question
   - Verify transcript appears
   - Verify message is sent to chat

3. **Test Voice Output**
   - Enable "Voice output" toggle (speaker icon)
   - Send a message
   - Verify AI response is spoken aloud

4. **Test Edit Before Send**
   - Speak a message
   - When transcript appears, edit it if needed
   - Click "Send" or press Ctrl+Enter

### Method 2: API Endpoint (Direct Testing)

#### Test with cURL

```bash
# Test voice endpoint with audio file
curl -X POST http://localhost:3000/api/ai-advisor/voice \
  -H "Cookie: your-auth-cookie" \
  -F "audio=@test-audio.webm" \
  -F "studentProfileId=your-student-profile-id" \
  -F "generateAudio=true"
```

**Response**:
```json
{
  "transcript": "Your transcribed text here",
  "responseText": "AI response text",
  "responseAudio": "data:audio/mp3;base64,...",
  "conversationId": "uuid-here"
}
```

#### Test with JavaScript (Browser Console)

```javascript
// Record audio first (or use existing audio blob)
const audioBlob = /* your audio blob */;

const formData = new FormData();
formData.append('audio', audioBlob, 'audio.webm');
formData.append('studentProfileId', 'your-student-profile-id');
formData.append('generateAudio', 'true');

const response = await fetch('/api/ai-advisor/voice', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log('Transcript:', data.transcript);
console.log('Response:', data.responseText);

// Play audio if generated
if (data.responseAudio) {
  const audio = new Audio(data.responseAudio);
  audio.play();
}
```

---

## 🔍 Verification Steps

### 1. Check Feature Flag

Verify the endpoint is enabled:

```bash
# Should return 403 if disabled, 400 if enabled (missing audio)
curl -X POST http://localhost:3000/api/ai-advisor/voice \
  -H "Cookie: your-auth-cookie"
```

**Expected**:
- If `ENABLE_VOICE_API=true`: Returns 400 (Bad Request - missing audio)
- If `ENABLE_VOICE_API=false`: Returns 403 (Forbidden)

### 2. Check API Key

Verify OpenAI API key is configured:

```bash
# Check server logs when making a request
# Should NOT see: "OpenAI API key not configured"
```

### 3. Test Audio Formats

Supported formats:
- ✅ `audio/webm` (recommended for browser)
- ✅ `audio/mp3`
- ✅ `audio/wav`
- ✅ `audio/m4a`
- ✅ `audio/ogg`

**Max file size**: 10MB

### 4. Test Transcription

1. Record a short audio (5-10 seconds)
2. Send to `/api/ai-advisor/voice`
3. Verify `transcript` field contains your speech
4. Check accuracy

### 5. Test TTS Generation

1. Send request with `generateAudio=true`
2. Verify `responseAudio` field is present
3. Verify it's base64-encoded MP3
4. Play the audio to verify quality

---

## 🐛 Troubleshooting

### Issue: "Voice API is not enabled"

**Solution**: Set `ENABLE_VOICE_API=true` in `.env.local` and restart server

### Issue: "OpenAI API key not configured"

**Solution**: 
1. Verify `OPENAI_API_KEY` is set in `.env.local`
2. Restart Next.js dev server
3. Check for typos in variable name

### Issue: Transcription returns empty or wrong text

**Possible Causes**:
- Audio quality too low
- Background noise
- Language mismatch (currently English only)
- Audio format not supported

**Solutions**:
- Use clear audio (quiet environment)
- Speak clearly
- Check audio format is supported
- Verify audio file isn't corrupted

### Issue: TTS audio not playing

**Possible Causes**:
- `generateAudio` not set to `true`
- Audio format issue
- Browser doesn't support base64 audio

**Solutions**:
- Verify `generateAudio=true` in request
- Check browser console for errors
- Try different browser

### Issue: Browser voice controls not working

**Possible Causes**:
- Browser doesn't support Web Speech API
- Microphone permission denied
- HTTPS required (some browsers)

**Solutions**:
- Use Chrome or Edge (best support)
- Grant microphone permissions
- Use HTTPS in production
- Check browser console for errors

---

## 📊 Expected Behavior

### Voice Input (Client-Side)
- ✅ Microphone button appears
- ✅ Clicking starts recording (red pulsing indicator)
- ✅ Transcript appears in real-time
- ✅ Auto-stops after 3 seconds of silence (hands-free mode)
- ✅ Can edit transcript before sending

### Voice Input (Server-Side)
- ✅ Audio blob sent to `/api/ai-advisor/voice`
- ✅ Whisper API transcribes audio
- ✅ Transcript stored in `advisor_conversations`
- ✅ Voice metadata stored (duration, format, etc.)

### Voice Output (Client-Side)
- ✅ Browser `speechSynthesis` speaks responses
- ✅ Can toggle on/off
- ✅ Stops when user starts speaking (barge-in)

### Voice Output (Server-Side)
- ✅ OpenAI TTS generates audio
- ✅ Returns base64-encoded MP3
- ✅ Optional (only if `generateAudio=true`)

---

## 🎯 Quick Test Script

Save this as `test-voice.sh`:

```bash
#!/bin/bash

# Test Voice API
echo "Testing Voice API..."

# Replace these with your values
STUDENT_PROFILE_ID="your-student-profile-id"
AUTH_COOKIE="your-auth-cookie"
AUDIO_FILE="test-audio.webm"

# Test 1: Check if enabled
echo "1. Checking if voice API is enabled..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/ai-advisor/voice \
  -H "Cookie: $AUTH_COOKIE")

if [ "$RESPONSE" = "403" ]; then
  echo "❌ Voice API is disabled. Set ENABLE_VOICE_API=true"
  exit 1
elif [ "$RESPONSE" = "400" ]; then
  echo "✅ Voice API is enabled"
else
  echo "⚠️  Unexpected response: $RESPONSE"
fi

# Test 2: Send audio (if file exists)
if [ -f "$AUDIO_FILE" ]; then
  echo "2. Sending audio file..."
  curl -X POST http://localhost:3000/api/ai-advisor/voice \
    -H "Cookie: $AUTH_COOKIE" \
    -F "audio=@$AUDIO_FILE" \
    -F "studentProfileId=$STUDENT_PROFILE_ID" \
    -F "generateAudio=true" \
    | jq '.'
else
  echo "⚠️  Audio file not found: $AUDIO_FILE"
  echo "   Create a test audio file to test transcription"
fi

echo "Done!"
```

---

## 📝 Next Steps

After verifying voice API works:

1. **Test in UI**: Use the browser voice controls
2. **Test different scenarios**:
   - Short questions
   - Long questions
   - Background noise
   - Different accents
3. **Monitor costs**: Check OpenAI usage dashboard
4. **Optimize**: Adjust audio quality/format if needed

---

## 💰 Cost Considerations

**OpenAI Pricing** (as of 2024):
- **Whisper (STT)**: $0.006 per minute
- **TTS**: $15 per 1M characters

**Example**:
- 1 minute audio → ~$0.006 (STT)
- 500 character response → ~$0.0075 (TTS)
- **Total**: ~$0.014 per voice interaction

**Tips to reduce costs**:
- Use client-side Web Speech API when possible (free)
- Only use server-side TTS when needed
- Set `generateAudio=false` for most requests
- Cache common responses

---

## ✅ Success Criteria

You've successfully set up voice API if:

- ✅ Voice endpoint returns 400 (not 403) when called without audio
- ✅ Audio transcription works (accurate text returned)
- ✅ TTS generation works (audio returned when `generateAudio=true`)
- ✅ Browser voice controls appear and work
- ✅ No errors in server logs
- ✅ Conversations stored with voice metadata

---

## 🔗 Related Documentation

- [API Setup and Integration Guide](./API_SETUP_AND_INTEGRATION.md)
- [Missing APIs](./MISSING_APIS.md)
- [Implementation Status](./IMPLEMENTATION_STATUS.md)
