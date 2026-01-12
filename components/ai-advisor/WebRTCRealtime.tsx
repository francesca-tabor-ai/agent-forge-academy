'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type VoiceMode = 'push-to-talk' | 'hands-free';

export interface WebRTCRealtimeProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  studentProfileId?: string | null;
  defaultMode?: VoiceMode;
  // Transcript callbacks for chat UI integration
  onPartialUserTranscript?: (text: string) => void; // Optional: show partial user transcript while speaking
  onPartialAssistantTranscript?: (text: string) => void; // Optional: show partial assistant transcript while speaking
  onFinalUserTranscript?: (text: string) => void; // Finalize user message into chat history
  onFinalAssistantTranscript?: (text: string) => void; // Finalize assistant message into chat history
}

interface RealtimeSession {
  client_secret: string;
  expires_at: string;
  session_id?: string;
  model: string;
  voice: string;
  turn_detection?: boolean;
}

/**
 * WebRTC Realtime component for persistent voice connection to OpenAI Realtime API
 * 
 * This component:
 * - Establishes a single persistent WebRTC connection per page session
 * - Streams microphone audio to OpenAI in real-time
 * - Receives synthesized audio and transcripts from OpenAI
 * - Maintains the connection for the lifetime of the component
 */
export function WebRTCRealtime({
  onTranscript,
  onResponse,
  onError,
  disabled = false,
  studentProfileId,
  defaultMode = 'push-to-talk',
  onPartialUserTranscript,
  onPartialAssistantTranscript,
  onFinalUserTranscript,
  onFinalAssistantTranscript,
}: WebRTCRealtimeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(true); // Start muted (push-to-talk default)
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(defaultMode);
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true); // Voice output toggle (default: on)
  
  // Track partial transcripts for real-time display
  const [partialUserTranscript, setPartialUserTranscript] = useState('');
  const [partialAssistantTranscript, setPartialAssistantTranscript] = useState('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  /**
   * Get ephemeral session credentials from backend
   */
  const getSessionCredentials = useCallback(async (): Promise<RealtimeSession> => {
    const response = await fetch('/api/realtime/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Enable turn detection for hands-free mode (server-side)
        enableTurnDetection: voiceMode === 'hands-free',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to get session credentials');
    }

    return await response.json();
  }, [voiceMode]);

  /**
   * Establish WebRTC connection to OpenAI Realtime API
   * 
   * Flow:
   * 1. Call /api/realtime/session to get ephemeral credentials
   * 2. Create RTCPeerConnection
   * 3. Create DataChannel "oai-events"
   * 4. Add microphone track (initially muted)
   * 5. Do SDP offer/answer exchange
   */
  const connect = useCallback(async () => {
    if (disabled || isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);

      // Step 1: Call /api/realtime/session to get ephemeral credentials
      const session = await getSessionCredentials();
      sessionRef.current = session;

      // Step 2: Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
      peerConnectionRef.current = pc;

      // Create audio element for playback (set up early)
      // When remote audio track arrives from PeerConnection, attach it to <audio autoplay> element
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElement.muted = !voiceOutputEnabled; // Mute if voice output is disabled
      audioElementRef.current = audioElement;

      // Handle incoming audio track from PeerConnection
      pc.ontrack = (event) => {
        // Attach remote audio stream to audio element
        if (audioElement.srcObject !== event.streams[0]) {
          audioElement.srcObject = event.streams[0];
        }
      };

      // Step 3: Create DataChannel "oai-events"
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('Data channel opened');
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (e) {
          console.error('Failed to parse data channel message:', e);
        }
      };

      dataChannel.onerror = (event) => {
        console.error('Data channel error:', event);
        setError('Data channel error occurred');
        if (onError) onError('Data channel error');
      };

      // Step 4: Add microphone track to PeerConnection
      // Request mic permission once - keep track attached but disabled by default
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Add audio tracks - disabled by default (for push-to-talk)
      // In hands-free mode, we'll enable it after connection
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false; // Disabled by default (push-to-talk mode)
        pc.addTrack(track, stream);
      });
      
      // Set initial mute state based on mode
      // Push-to-talk: muted (user must hold to speak)
      // Hands-free: will be enabled after connection
      setIsMuted(voiceMode === 'push-to-talk');

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log('ICE connection state:', state);
        
        if (state === 'connected' || state === 'completed') {
          setIsConnected(true);
          setIsConnecting(false);
          
          // Enable mic for hands-free mode after connection
          if (voiceMode === 'hands-free' && localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
              track.enabled = true;
            });
            setIsMuted(false);
          }
        } else if (state === 'disconnected' || state === 'failed') {
          setIsConnected(false);
          setError('Connection lost');
          if (onError) onError('Connection lost');
        }
      };

      // Step 5: Do SDP offer/answer exchange with OpenAI Realtime endpoint
      // Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to OpenAI Realtime API via our backend proxy
      // This ensures the API key is never exposed to the client
      // The backend will forward the offer to OpenAI using the server's API key
      const sdpResponse = await fetch('/api/realtime/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          session_token: session.client_secret, // Ephemeral token for session tracking
        }),
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.status} ${errorText}`);
      }

      // Get SDP answer from our backend
      const sdpData = await sdpResponse.json();
      if (!sdpData.sdp) {
        throw new Error('Invalid SDP answer from server');
      }
      
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: sdpData.sdp,
      });

      // Connection will be established via ICE
    } catch (err) {
      console.error('Error connecting to Realtime API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
      if (onError) onError(errorMessage);
      
      // Cleanup on error
      disconnect();
    }
  }, [disabled, isConnecting, isConnected, getSessionCredentials, onError]);

  /**
   * Handle messages from OpenAI Realtime API via DataChannel
   * Use DataChannel messages to show partial and final transcripts
   */
  const handleRealtimeMessage = useCallback((message: any) => {
    // Handle different message types from OpenAI Realtime API
    // Based on OpenAI's Realtime API event structure
    
    // User transcript events
    if (message.type === 'conversation.item.input_audio_transcription.delta') {
      // Partial user transcript while speaking (optional)
      const delta = message.delta || '';
      const newPartial = (partialUserTranscript + delta).trim();
      setPartialUserTranscript(newPartial);
      if (onPartialUserTranscript) {
        onPartialUserTranscript(newPartial);
      }
    } else if (message.type === 'conversation.item.input_audio_transcription.completed') {
      // Final user transcript - turn completed
      const transcript = message.transcript || '';
      setPartialUserTranscript(''); // Clear partial
      setCurrentTranscript(transcript);
      
      // Finalize user message into chat history
      if (onFinalUserTranscript) {
        onFinalUserTranscript(transcript);
      }
      // Legacy callback for backward compatibility
      if (onTranscript) onTranscript(transcript);
    } else if (message.type === 'conversation.item.input_audio_transcription.failed') {
      // User transcription failed
      setPartialUserTranscript('');
      const errorMsg = message.error?.message || 'Failed to transcribe user audio';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
    
    // Assistant transcript events
    else if (message.type === 'response.audio_transcript.delta' || message.type === 'response.content.delta') {
      // Partial assistant transcript while speaking (optional)
      const delta = message.delta || message.content || '';
      const newPartial = (partialAssistantTranscript + delta).trim();
      setPartialAssistantTranscript(newPartial);
      if (onPartialAssistantTranscript) {
        onPartialAssistantTranscript(newPartial);
      }
    } else if (message.type === 'response.audio_transcript.done' || message.type === 'response.done') {
      // Final assistant transcript - response completed
      const transcript = message.transcript || message.content || '';
      setPartialAssistantTranscript(''); // Clear partial
      setCurrentTranscript(transcript);
      
      // Finalize assistant message into chat history
      if (onFinalAssistantTranscript) {
        onFinalAssistantTranscript(transcript);
      }
      // Legacy callback for backward compatibility
      if (onResponse) onResponse(transcript);
    } else if (message.type === 'conversation.item.output_audio_transcription.completed') {
      // Legacy: completed output transcription
      const response = message.transcript || '';
      setPartialAssistantTranscript('');
      if (onFinalAssistantTranscript) {
        onFinalAssistantTranscript(response);
      }
      if (onResponse) onResponse(response);
    }
    
    // Error handling
    else if (message.type === 'error') {
      const errorMsg = message.error?.message || 'Unknown error from OpenAI';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
    
    // Connection events
    else if (message.type === 'session.updated') {
      // Session updated - could contain turn detection status, etc.
      console.log('Session updated:', message);
    }
  }, [
    partialUserTranscript,
    partialAssistantTranscript,
    onPartialUserTranscript,
    onPartialAssistantTranscript,
    onFinalUserTranscript,
    onFinalAssistantTranscript,
    onTranscript,
    onResponse,
    onError,
  ]);

  /**
   * Send event to OpenAI via DataChannel
   */
  const sendEvent = useCallback((event: any) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Data channel not open');
      return false;
    }

    try {
      dataChannelRef.current.send(JSON.stringify(event));
      return true;
    } catch (error) {
      console.error('Failed to send event:', error);
      return false;
    }
  }, []);

  /**
   * Commit user turn (end of speech) - for push-to-talk mode
   */
  const commitTurn = useCallback(() => {
    // Send commit event to indicate end of user speech
    // OpenAI Realtime API expects this to process the audio
    const commitEvent = {
      type: 'input_audio_buffer.commit',
    };
    
    return sendEvent(commitEvent);
  }, [sendEvent]);

  /**
   * Request response from model (if needed)
   */
  const requestResponse = useCallback(() => {
    // Request the model to respond
    const responseEvent = {
      type: 'response.create',
    };
    
    return sendEvent(responseEvent);
  }, [sendEvent]);

  /**
   * Push-to-Talk: Hold mic button
   */
  const handleHoldMic = useCallback(() => {
    if (!localStreamRef.current || !isConnected) return;

    // Enable microphone track
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    setIsHoldingMic(true);
    setIsMuted(false);
  }, [isConnected]);

  /**
   * Push-to-Talk: Release mic button
   */
  const handleReleaseMic = useCallback(() => {
    if (!localStreamRef.current || !isConnected) return;

    // Disable microphone track
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });

    setIsHoldingMic(false);
    setIsMuted(true);

    // Commit the user turn and optionally request response
    commitTurn();
    // Request response if model expects explicit "respond" event
    requestResponse();
  }, [isConnected, commitTurn, requestResponse]);

  /**
   * Toggle mute/unmute microphone (for hands-free mode)
   */
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current || voiceMode !== 'hands-free') return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    const newMutedState = !isMuted;
    
    audioTracks.forEach((track) => {
      track.enabled = !newMutedState;
    });

    setIsMuted(newMutedState);
  }, [isMuted, voiceMode]);

  /**
   * Toggle voice output (model audio playback)
   */
  const toggleVoiceOutput = useCallback(() => {
    const newVoiceOutputState = !voiceOutputEnabled;
    setVoiceOutputEnabled(newVoiceOutputState);

    // Mute/unmute the audio element
    if (audioElementRef.current) {
      audioElementRef.current.muted = !newVoiceOutputState;
    }
  }, [voiceOutputEnabled]);

  /**
   * Disconnect and cleanup
   */
  const disconnect = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Cleanup audio element
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null;
      audioElementRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setCurrentTranscript('');
  }, []);

  // Auto-connect on mount - establish connection on page load
  // Keep connection open until user navigates away or explicitly disconnects
  useEffect(() => {
    // Only connect once on mount, not on every render
    if (!disabled && !isConnected && !isConnecting && !peerConnectionRef.current) {
      connect();
    }

    // Cleanup on unmount (when user navigates away)
    return () => {
      if (peerConnectionRef.current) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run on mount/unmount

  // Sync audio element muted state with voice output toggle
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = !voiceOutputEnabled;
    }
  }, [voiceOutputEnabled]);

  return (
    <div className="space-y-3">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected
              ? 'bg-green-500 animate-pulse'
              : isConnecting
              ? 'bg-yellow-500 animate-pulse'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-gray-600">
          {isConnected
            ? 'Connected'
            : isConnecting
            ? 'Connecting...'
            : 'Disconnected'}
        </span>
      </div>

      {/* Mode Selection */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-gray-600">Mode:</label>
        <button
          type="button"
          onClick={() => {
            setVoiceMode('push-to-talk');
            // Disable mic when switching to push-to-talk
            if (localStreamRef.current) {
              localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = false;
              });
            }
            setIsMuted(true);
            setIsHoldingMic(false);
          }}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            voiceMode === 'push-to-talk'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Push-to-Talk
        </button>
        <button
          type="button"
          onClick={() => {
            setVoiceMode('hands-free');
            // Enable mic when switching to hands-free (if connected)
            if (localStreamRef.current && isConnected) {
              localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = true;
              });
            }
            setIsMuted(false);
          }}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            voiceMode === 'hands-free'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hands-Free
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {voiceMode === 'push-to-talk' && isConnected ? (
          <>
            {/* Push-to-Talk: Hold to speak button */}
            <button
              type="button"
              onMouseDown={handleHoldMic}
              onMouseUp={handleReleaseMic}
              onMouseLeave={handleReleaseMic} // Release if mouse leaves button
              onTouchStart={handleHoldMic}
              onTouchEnd={handleReleaseMic}
              disabled={disabled}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                isHoldingMic
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isHoldingMic ? '🎤 Speaking...' : '🎤 Hold to Speak'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={isConnected ? disconnect : connect}
              disabled={disabled || isConnecting}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isConnected
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${disabled || isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>

            {/* Hands-Free: Mute/Unmute toggle */}
            {isConnected && voiceMode === 'hands-free' && (
              <button
                type="button"
                onClick={toggleMute}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMuted
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isMuted ? '🔇 Muted' : '🔊 Unmuted'}
              </button>
            )}
          </>
        )}

        {/* Voice Output Toggle - Control model audio playback */}
        {isConnected && (
          <button
            type="button"
            onClick={toggleVoiceOutput}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              voiceOutputEnabled
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-400 hover:bg-gray-500 text-white'
            }`}
            title={voiceOutputEnabled ? 'Voice output enabled' : 'Voice output disabled'}
          >
            {voiceOutputEnabled ? '🔊 Voice Output' : '🔇 Voice Output'}
          </button>
        )}
      </div>

      {/* Current Transcript */}
      {currentTranscript && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-medium text-blue-800 mb-1">Live Transcript:</div>
          <div className="text-sm text-blue-900">{currentTranscript}</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <div className="font-medium mb-1">Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>
          WebRTC Realtime provides a persistent voice connection. The connection is established on page load and stays open until you navigate away.
        </p>
        {voiceMode === 'push-to-talk' && isConnected && (
          <p className="mt-1 text-blue-600">
            Hold the microphone button to speak. Release to send your message.
          </p>
        )}
        {voiceMode === 'hands-free' && isConnected && (
          <p className="mt-1 text-green-600">
            Hands-free mode: Speak naturally. The AI will detect when you finish speaking.
          </p>
        )}
        {isMuted && isConnected && voiceMode === 'hands-free' && (
          <p className="mt-1 text-amber-600">
            Microphone is muted. Click "Unmuted" to start speaking.
          </p>
        )}
        {!voiceOutputEnabled && isConnected && (
          <p className="mt-1 text-purple-600">
            Voice output is disabled. Model audio is muted.
          </p>
        )}
      </div>
    </div>
  );
}
