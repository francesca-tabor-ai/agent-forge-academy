'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createSystemConfigEvent, REALTIME_TOOLS } from '@/lib/ai/realtime-tools';

export type VoiceMode = 'push-to-talk' | 'hands-free';

export interface ActiveContext {
  course?: { id: string; slug: string; title: string };
  project?: { id: string; title: string };
  job?: { id: string; title: string; company: string };
}

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
  // Context for tool calling
  context?: ActiveContext; // Current active context (course/project/job)
  // Fallback callback - called when WebRTC fails and should fallback to standard voice
  onFallback?: () => void; // Callback to trigger fallback to standard voice
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
  context,
  onFallback,
}: WebRTCRealtimeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(true); // Start muted (push-to-talk default)
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(defaultMode);
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true); // Voice output toggle (default: on)
  const [hasFailed, setHasFailed] = useState(false); // Track if WebRTC has failed
  const [showFallbackMessage, setShowFallbackMessage] = useState(false); // Show fallback message
  
  // Track partial transcripts for real-time display
  const [partialUserTranscript, setPartialUserTranscript] = useState('');
  const [partialAssistantTranscript, setPartialAssistantTranscript] = useState('');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<RealtimeSession | null>(null);
  
  // Timeout detection: track last event time
  const lastEventTimeRef = useRef<number>(Date.now());
  const timeoutCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const TIMEOUT_DURATION = 30000; // 30 seconds without events = timeout

  // Cleanup on unmount - stop tracks, close peer connection
  useEffect(() => {
    return () => {
      console.log('WebRTCRealtime unmounting - cleaning up');
      disconnect();
    };
  }, [disconnect]);

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
   * Handle tool call request from the model
   */
  const handleToolCall = useCallback(async (functionCall: any) => {
    // Handle different function call formats from OpenAI Realtime API
    const callId = functionCall.id || functionCall.call_id || functionCall.item_id;
    const toolName = functionCall.name || functionCall.function?.name;
    const argumentsStr = functionCall.arguments || functionCall.function?.arguments || '{}';
    
    if (!toolName) {
      console.error('Invalid function call: missing name', functionCall);
      return;
    }

    let parameters: any;
    try {
      parameters = typeof argumentsStr === 'string'
        ? JSON.parse(argumentsStr)
        : argumentsStr;
    } catch (e) {
      console.error('Failed to parse function arguments:', e);
      parameters = {};
    }

    // Execute tool on backend
    try {
      const response = await fetch('/api/realtime/tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName,
          parameters,
          studentProfileId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.status}`);
      }

      const { result } = await response.json();

      // Send tool result back to model via DataChannel
      // OpenAI Realtime API expects function_call_output item
      const toolResultEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(result),
        },
      };

      sendEvent(toolResultEvent);
    } catch (error) {
      console.error('Error executing tool:', error);
      
      // Send error result back to model
      const errorResultEvent = {
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Tool execution failed',
          }),
        },
      };

      sendEvent(errorResultEvent);
    }
  }, [studentProfileId, sendEvent]);

  /**
   * Send system/config event with context and tools
   * Called on session start or context change
   */
  const sendSystemConfig = useCallback(() => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Data channel not open, cannot send system config');
      return;
    }

    // Create system/config event with context and tools
    const configEvent = createSystemConfigEvent(
      context || {},
      REALTIME_TOOLS
    );

    sendEvent(configEvent);
  }, [context, sendEvent]);

  /**
   * Handle messages from OpenAI Realtime API via DataChannel
   * Use DataChannel messages to show partial and final transcripts
   */
  const handleRealtimeMessage = useCallback((message: any) => {
    // Update last event time for timeout detection
    lastEventTimeRef.current = Date.now();
    
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
    
    // Tool call events - OpenAI Realtime API sends tool calls in various formats
    else if (message.type === 'conversation.item.requires_action') {
      // Model is requesting a tool call
      const item = message.item;
      if (item && (item.type === 'function_call' || item.function_call)) {
        handleToolCall(item);
      }
    } else if (message.type === 'conversation.item.function_call' || message.type === 'function_call') {
      // Direct function call event
      handleToolCall(message.item || message);
    } else if (message.item?.type === 'function_call') {
      // Function call nested in item
      handleToolCall(message.item);
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
    handleToolCall,
  ]);

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
        // Update last event time
        lastEventTimeRef.current = Date.now();
        // Send system/config event on session start with context and tools
        sendSystemConfig();
      };

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle tool calls from the model
          if (message.type === 'conversation.item.requires_action' || 
              (message.type === 'conversation.item.input_audio_transcription.completed' && message.item?.type === 'function_call')) {
            const item = message.item || message;
            if (item && (item.type === 'function_call' || item.function_call)) {
              handleToolCall(item);
              return;
            }
          }
          
          // Handle other messages
          handleRealtimeMessage(message);
        } catch (e) {
          console.error('Failed to parse data channel message:', e);
        }
      };

      dataChannel.onerror = (event) => {
        console.error('Data channel error:', event);
        const errorMsg = 'Data channel error occurred';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        
        // Trigger fallback on data channel error
        triggerFallback();
      };
      
      dataChannel.onclose = () => {
        console.log('Data channel closed');
        if (isConnected) {
          // Unexpected close - trigger fallback
          setError('Data channel closed unexpectedly');
          triggerFallback();
        }
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
          const errorMsg = state === 'failed' ? 'Connection failed' : 'Connection lost';
          setError(errorMsg);
          if (onError) onError(errorMsg);
          
          // Trigger fallback on connection failure
          if (state === 'failed') {
            triggerFallback();
          }
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
      // System config will be sent when data channel opens (handled in onopen above)
      
      // Start timeout detection after connection attempt
      startTimeoutDetection();
    } catch (err) {
      console.error('Error connecting to Realtime API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      setIsConnecting(false);
      if (onError) onError(errorMessage);
      
      // Trigger fallback on connection failure
      triggerFallback();
    }
  }, [disabled, isConnecting, isConnected, getSessionCredentials, onError, sendSystemConfig, handleToolCall, handleRealtimeMessage, voiceMode, voiceOutputEnabled, triggerFallback]);

  /**
   * Start timeout detection - check if no events received for N seconds
   */
  const startTimeoutDetection = useCallback(() => {
    // Clear existing timeout check
    if (timeoutCheckIntervalRef.current) {
      clearInterval(timeoutCheckIntervalRef.current);
    }

    // Check every 5 seconds if we've received events
    timeoutCheckIntervalRef.current = setInterval(() => {
      if (!isConnected || !peerConnectionRef.current) {
        return; // Not connected, don't check
      }

      const timeSinceLastEvent = Date.now() - lastEventTimeRef.current;
      
      if (timeSinceLastEvent > TIMEOUT_DURATION) {
        console.warn('WebRTC timeout: No events received for', timeSinceLastEvent, 'ms');
        setError('Connection timeout - no response from server');
        triggerFallback();
      }
    }, 5000); // Check every 5 seconds
  }, [isConnected, triggerFallback]);

  /**
   * Reconnect to WebRTC
   */
  const reconnect = useCallback(() => {
    console.log('Reconnecting WebRTC...');
    setHasFailed(false);
    setShowFallbackMessage(false);
    setError(null);
    disconnect();
    
    // Small delay before reconnecting
    setTimeout(() => {
      connect();
    }, 500);
  }, [connect, disconnect]);

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
    // Stop timeout check
    if (timeoutCheckIntervalRef.current) {
      clearInterval(timeoutCheckIntervalRef.current);
      timeoutCheckIntervalRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (e) {
        console.warn('Error closing data channel:', e);
      }
      dataChannelRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('Error closing peer connection:', e);
      }
      peerConnectionRef.current = null;
    }

    // Cleanup audio element
    if (audioElementRef.current) {
      try {
        audioElementRef.current.srcObject = null;
        audioElementRef.current.pause();
      } catch (e) {
        console.warn('Error cleaning up audio element:', e);
      }
      audioElementRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setCurrentTranscript('');
    lastEventTimeRef.current = Date.now(); // Reset timeout timer
  }, []);

  /**
   * Trigger fallback to standard voice
   */
  const triggerFallback = useCallback(() => {
    console.log('WebRTC failed, triggering fallback to standard voice');
    setHasFailed(true);
    setShowFallbackMessage(true);
    disconnect();
    
    // Call fallback callback if provided
    if (onFallback) {
      onFallback();
    }
  }, [onFallback, disconnect]);

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

  // Send system/config event when context changes (if connected)
  useEffect(() => {
    if (isConnected && dataChannelRef.current?.readyState === 'open') {
      sendSystemConfig();
    }
  }, [context, isConnected, sendSystemConfig]);

  return (
    <div className="space-y-3">
      {/* Fallback Message */}
      {showFallbackMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="text-yellow-600 text-sm font-medium">
              ⚠️ Realtime unavailable, switching to standard voice
            </div>
            <button
              type="button"
              onClick={() => setShowFallbackMessage(false)}
              className="ml-auto text-yellow-600 hover:text-yellow-800"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected
              ? 'bg-green-500 animate-pulse'
              : isConnecting
              ? 'bg-yellow-500 animate-pulse'
              : hasFailed
              ? 'bg-red-500'
              : 'bg-gray-400'
          }`}
        />
        <span className="text-sm text-gray-600">
          {isConnected
            ? 'Connected'
            : isConnecting
            ? 'Connecting...'
            : hasFailed
            ? 'Connection Failed'
            : 'Disconnected'}
        </span>
        {/* Reconnect Button */}
        {hasFailed && !isConnecting && (
          <button
            type="button"
            onClick={reconnect}
            className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>
      
      {/* Error Display */}
      {error && !showFallbackMessage && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

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
