'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createSystemConfigEvent, REALTIME_TOOLS } from '@/lib/ai/realtime-tools';
import { safeLogger } from '@/lib/utils/redactPII';
import {
  checkMicrophonePermission,
  getPermissionGuidance,
  enumerateMicrophoneDevices,
  isSafariOrIOS,
  getSafariAudioConstraints,
  logPermissionStateTransition,
  type PermissionState,
  type MicrophoneDevice,
} from '@/lib/utils/microphonePermissions';

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
  // Auto-connect on mount (default: false - user must click Connect button)
  autoConnect?: boolean; // If true, automatically connect when component mounts (only on AI Advisor route)
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
/**
 * Check if UAT mock mode is enabled for Realtime
 * Mock mode can be enabled via window variable or environment check
 */
function isMockRealtimeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  // Check for window variable set by test environment
  return (window as any).__UAT_MOCK_REALTIME === true || 
         (window as any).__UAT_MOCK_REALTIME === '1' ||
         // Check localStorage (set by test setup)
         localStorage.getItem('UAT_MOCK_REALTIME') === '1';
}

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
  autoConnect = false, // Default: don't auto-connect - user must click Connect button
}: WebRTCRealtimeProps) {
  const pathname = usePathname();
  const isAiAdvisorRoute = pathname?.startsWith('/student/ai-advisor') ?? false;
  
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
  const [fallbackReason, setFallbackReason] = useState<string | null>(null); // Reason for fallback
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null); // Microphone permission state
  const [permissionError, setPermissionError] = useState<string | null>(null); // Permission error message
  const [availableDevices, setAvailableDevices] = useState<MicrophoneDevice[]>([]); // Available microphone devices
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null); // Selected device ID
  
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
  
  // Silence timeout: track last speech time (user or assistant)
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const silenceTimeoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Base timeout durations (will be adjusted based on voice mode)
  const HANDS_FREE_TIMEOUT = 3 * 60 * 1000; // 3 minutes for hands-free
  const PUSH_TO_TALK_TIMEOUT = 5 * 60 * 1000; // 5 minutes for push-to-talk
  
  // Connection timeout: track connection establishment timeout
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const CONNECTION_TIMEOUT = 10000; // 10 seconds for connection establishment

  /**
   * Disconnect and cleanup
   * Declared early so it can be used in useEffect cleanup functions
   */
  const disconnect = useCallback(() => {
    // Stop timeout check
    if (timeoutCheckIntervalRef.current) {
      clearInterval(timeoutCheckIntervalRef.current);
      timeoutCheckIntervalRef.current = null;
    }

    // Stop silence timeout check
    if (silenceTimeoutIntervalRef.current) {
      clearInterval(silenceTimeoutIntervalRef.current);
      silenceTimeoutIntervalRef.current = null;
    }

    // Clear connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
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
        // Remove from DOM if attached
        if (audioElementRef.current.parentNode) {
          audioElementRef.current.parentNode.removeChild(audioElementRef.current);
        }
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

  // Cleanup on unmount - stop tracks, close peer connection
  useEffect(() => {
    return () => {
      console.log('WebRTCRealtime unmounting - cleaning up');
      disconnect();
    };
  }, [disconnect]);

  // Listen for device changes
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || permissionState !== 'granted') {
      return;
    }

    const handleDeviceChange = async () => {
      try {
        const devices = await enumerateMicrophoneDevices();
        setAvailableDevices(devices);
        
        // If selected device is no longer available, select first device
        if (selectedDeviceId && !devices.find(d => d.deviceId === selectedDeviceId)) {
          if (devices.length > 0) {
            setSelectedDeviceId(devices[0].deviceId);
            // If connected, disconnect to allow reconnection with new device
            if (isConnected) {
              disconnect();
            }
          } else {
            setSelectedDeviceId(null);
          }
        } else if (!selectedDeviceId && devices.length > 0) {
          setSelectedDeviceId(devices[0].deviceId);
        }
      } catch (error) {
        console.warn('[WebRTC] Failed to refresh devices:', error);
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [permissionState, selectedDeviceId, isConnected, disconnect]);

  /**
   * Trigger fallback to standard voice
   * Declared early so it can be used in connect and other callbacks
   */
  const triggerFallback = useCallback((reason?: string) => {
    const correlationId = correlationIdRef.current || 'unknown';
    console.log('[WebRTC] Failed, triggering fallback to standard voice', { correlationId, reason });
    
    setHasFailed(true);
    setShowFallbackMessage(true);
    setFallbackReason(reason || 'Connection failed');
    
    // Disconnect only if not in mock mode (mock mode doesn't have real connections)
    const mockMode = isMockRealtimeEnabled();
    if (!mockMode) {
      disconnect();
    } else {
      // In mock mode, just reset connection state
      setIsConnected(false);
      setIsConnecting(false);
    }
    
    // Log fallback (without storing raw audio)
    safeLogger.info('WebRTC fallback triggered', {
      correlationId,
      reason: reason || 'unknown',
      timestamp: new Date().toISOString(),
      hasAudio: false,
    });
    
    // Call fallback callback if provided (with small delay for smooth transition)
    if (onFallback) {
      // Small delay to allow user to see the message before switching
      setTimeout(() => {
        onFallback();
      }, 1000);
    }
  }, [onFallback, disconnect]);

  /**
   * Start timeout detection - check if no events received for N seconds
   * Declared early so it can be used in connect callback
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
   * Start silence timeout detection - close session if no speech for X minutes
   * Declared early so it can be used in connect callback
   */
  const startSilenceTimeoutDetection = useCallback(() => {
    // Clear existing silence timeout check
    if (silenceTimeoutIntervalRef.current) {
      clearInterval(silenceTimeoutIntervalRef.current);
    }

    // Use shorter check interval for hands-free mode (30s) vs push-to-talk (60s)
    const checkInterval = voiceMode === 'hands-free' ? 30 * 1000 : 60 * 1000;
    const timeoutDuration = voiceMode === 'hands-free' 
      ? HANDS_FREE_TIMEOUT  // 3 minutes for hands-free
      : PUSH_TO_TALK_TIMEOUT; // 5 minutes for push-to-talk

    // Check periodically if there's been any speech activity
    silenceTimeoutIntervalRef.current = setInterval(() => {
      if (!isConnected || !peerConnectionRef.current) {
        return; // Not connected, don't check
      }

      const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
      
      if (timeSinceLastSpeech > timeoutDuration) {
        const durationMinutes = Math.round(timeSinceLastSpeech / 1000 / 60);
        console.log(`[WebRTC] Silence timeout: No speech activity for ${durationMinutes} minutes (mode: ${voiceMode})`);
        
        // Log silence timeout (without storing raw audio)
        safeLogger.info('Realtime session closed due to silence timeout', {
          durationMinutes,
          voiceMode,
          timestamp: new Date().toISOString(),
          hasAudio: false,
        });
        
        // Close session gracefully
        setError(`Session closed due to inactivity (${durationMinutes} minutes without speech)`);
        disconnect();
      } else if (voiceMode === 'hands-free' && timeSinceLastSpeech > timeoutDuration * 0.8) {
        // Warn user when approaching timeout in hands-free mode (80% of timeout)
        const remainingSeconds = Math.round((timeoutDuration - timeSinceLastSpeech) / 1000);
        if (remainingSeconds > 0 && remainingSeconds <= 30) {
          console.log(`[WebRTC] Approaching silence timeout: ${remainingSeconds}s remaining`);
          // Could show a subtle warning to user here if needed
        }
      }
    }, checkInterval);
  }, [isConnected, disconnect, voiceMode]);

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
    
    // Update last speech time when we detect speech activity
    // Track both user and assistant speech, including audio events
    const isSpeechEvent = 
      // User speech events
      message.type === 'conversation.item.input_audio_transcription.delta' ||
      message.type === 'conversation.item.input_audio_transcription.completed' ||
      message.type === 'conversation.item.input_audio_buffer.speech_started' ||
      message.type === 'conversation.item.input_audio_buffer.speech_stopped' ||
      // Assistant speech events
      message.type === 'response.audio_transcript.delta' ||
      message.type === 'response.audio_transcript.done' ||
      message.type === 'response.content.delta' ||
      message.type === 'response.content.done' ||
      message.type === 'response.audio.delta' ||
      message.type === 'response.audio.done' ||
      // Session events that indicate activity
      message.type === 'session.updated' ||
      // Any event with audio content
      (message.item && (
        message.item.type === 'message' ||
        message.item.type === 'input_audio_transcription' ||
        message.item.type === 'function_call'
      ));
    
    if (isSpeechEvent) {
      lastSpeechTimeRef.current = Date.now();
      
      // Log speech activity in development (without storing raw audio)
      if (process.env.NODE_ENV === 'development' && voiceMode === 'hands-free') {
        console.log('[WebRTC] Speech activity detected', {
          type: message.type,
          timestamp: new Date().toISOString(),
          hasAudio: false,
        });
      }
    }
    
    // Log events (without storing raw audio)
    // Only log event types, not audio data
    if (process.env.NODE_ENV === 'development') {
      console.log('[WebRTC] Event received:', {
        type: message.type,
        timestamp: new Date().toISOString(),
        hasAudio: false, // Never log raw audio
      });
    }
    
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
      
      // In hands-free mode, update speech time even on failure (user attempted to speak)
      if (voiceMode === 'hands-free') {
        lastSpeechTimeRef.current = Date.now();
      }
    } else if (message.type === 'conversation.item.input_audio_buffer.speech_started') {
      // User started speaking (turn detection event)
      if (voiceMode === 'hands-free') {
        lastSpeechTimeRef.current = Date.now();
        console.log('[WebRTC] Speech started detected (hands-free mode)');
      }
    } else if (message.type === 'conversation.item.input_audio_buffer.speech_stopped') {
      // User stopped speaking (turn detection event)
      if (voiceMode === 'hands-free') {
        lastSpeechTimeRef.current = Date.now();
        console.log('[WebRTC] Speech stopped detected (hands-free mode)');
      }
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
   * Mock connection for UAT testing
   * Calls /api/realtime/connect and simulates connection states
   */
  const connectMock = useCallback(async () => {
    if (disabled || isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);
      setHasFailed(false);
      setShowFallbackMessage(false);

      // Call /api/realtime/connect with mock SDP offer
      const mockSdpOffer = `v=0\r\no=- ${Date.now()} ${Date.now()} IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\na=rtpmap:111 opus/48000/2\r\n`;

      const response = await fetch('/api/realtime/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: mockSdpOffer,
          session_token: sessionRef.current?.client_secret || 'mock-token',
        }),
      });

      if (!response.ok) {
        // Simulate failure - trigger fallback
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Connection failed';
        
        setError(errorMessage);
        setHasFailed(true);
        setIsConnecting(false);
        
        // Trigger fallback
        triggerFallback();
        
        if (onError) {
          onError(errorMessage);
        }
        return;
      }

      // Success - simulate connected state
      const data = await response.json();
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      setHasFailed(false);
      
      // Enable mic for hands-free mode
      if (voiceMode === 'hands-free') {
        setIsMuted(false);
      }
      
      console.log('[WebRTC Mock] Connected successfully');
    } catch (error: any) {
      console.error('[WebRTC Mock] Connection error:', error);
      const errorMessage = error.message || 'Connection failed';
      setError(errorMessage);
      setHasFailed(true);
      setIsConnecting(false);
      
      // Trigger fallback
      triggerFallback();
      
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [disabled, isConnecting, isConnected, voiceMode, onError, triggerFallback]);

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

    // UAT Mock Mode: Use mock connection instead of real WebRTC
    const mockMode = isMockRealtimeEnabled();
    if (mockMode) {
      return connectMock();
    }

    try {
      setIsConnecting(true);
      setError(null);
      setHasFailed(false);

      // Set up connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (isConnecting && !isConnected) {
          const correlationId = correlationIdRef.current || 'unknown';
          console.warn('[WebRTC] Connection timeout', { correlationId });
          const timeoutError = 'Connection timed out. Please check your internet connection and try again.';
          setError(timeoutError);
          setHasFailed(true);
          setIsConnecting(false);
          if (onError) onError(timeoutError);
          
          // Log timeout (without storing raw audio)
          safeLogger.warn('WebRTC connection timeout', {
            correlationId,
            timestamp: new Date().toISOString(),
            hasAudio: false,
            sessionId: sessionRef.current?.session_id,
          });
          
          // Cleanup on timeout
          disconnect();
          
          // Trigger fallback on timeout with reason
          triggerFallback('Connection timeout after 10 seconds');
        }
      }, CONNECTION_TIMEOUT);

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
      // Attach to DOM (hidden) to ensure autoplay works
      audioElement.style.display = 'none';
      audioElement.setAttribute('data-webrtc-audio', 'true');
      document.body.appendChild(audioElement);
      audioElementRef.current = audioElement;

      // Handle incoming audio track from PeerConnection
      pc.ontrack = (event) => {
        // Attach remote audio stream to audio element
        if (audioElement.srcObject !== event.streams[0]) {
          audioElement.srcObject = event.streams[0];
          
          // Attempt to play (required for autoplay policies)
          audioElement.play().catch((playError) => {
            console.warn('Audio autoplay blocked:', playError);
            // User interaction may be required - show message if needed
            setError('Audio playback requires user interaction. Please click the page to enable audio.');
          });
        }
      };

      // Step 3: Create DataChannel "oai-events"
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        const correlationId = correlationIdRef.current || 'unknown';
        console.log('[WebRTC] Data channel opened', { correlationId });
        
        // Update last event time
        lastEventTimeRef.current = Date.now();
        lastSpeechTimeRef.current = Date.now(); // Initialize speech time
        
        // Log data channel opened (without storing raw audio)
        safeLogger.info('WebRTC data channel opened', {
          correlationId,
          timestamp: new Date().toISOString(),
          hasAudio: false, // Never log raw audio
        });
        
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
        const correlationId = correlationIdRef.current || 'unknown';
        console.error('[WebRTC] Data channel error', { correlationId, event });
        const errorMsg = 'Data channel error occurred';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        
        // Trigger fallback on data channel error
        triggerFallback('Data channel error');
      };
      
      dataChannel.onclose = () => {
        const correlationId = correlationIdRef.current || 'unknown';
        console.log('[WebRTC] Data channel closed', { correlationId });
        if (isConnected) {
          // Unexpected close - trigger fallback
          setError('Data channel closed unexpectedly');
          triggerFallback('Data channel closed unexpectedly');
        }
      };

      // Step 4: Add microphone track to PeerConnection
      // Request mic permission once - keep track attached but disabled by default
      // Use audio constraints for better quality: echo cancellation, noise suppression, mono channel
      // Use Safari-specific constraints if on Safari/iOS
      const baseConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000,
        channelCount: 1, // Mono for speech (not stereo) - saves bandwidth
      };
      
      const audioConstraints = isSafariOrIOS() 
        ? { ...baseConstraints, ...getSafariAudioConstraints() }
        : baseConstraints;
      
      // Check permission before requesting
      const previousState = permissionState;
      try {
        const permissionResult = await checkMicrophonePermission();
        const newState = permissionResult.state;
        setPermissionState(newState);
        logPermissionStateTransition('webrtc', previousState, newState);
        
        if (newState !== 'granted') {
          const guidance = getPermissionGuidance(newState, permissionResult.errorName);
          setPermissionError(guidance.message);
          throw new Error(guidance.message);
        }
        
        setPermissionError(null);
        
        // Enumerate devices for device selection
        if (newState === 'granted') {
          try {
            const devices = await enumerateMicrophoneDevices();
            setAvailableDevices(devices);
            
            // Auto-select first device if none selected
            if (devices.length > 0 && !selectedDeviceId) {
              setSelectedDeviceId(devices[0].deviceId);
            }
          } catch (deviceError) {
            console.warn('[WebRTC] Failed to enumerate devices:', deviceError);
          }
        }
      } catch (permError: any) {
        // Permission check failed - still try getUserMedia (may prompt user)
        console.warn('[WebRTC] Permission check failed, attempting getUserMedia:', permError);
      }
      
      // Add deviceId if a device is selected
      const finalAudioConstraints = { ...audioConstraints };
      if (selectedDeviceId) {
        (finalAudioConstraints as any).deviceId = { exact: selectedDeviceId };
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: finalAudioConstraints,
      });
      
      // Update permission state after successful getUserMedia
      if (permissionState !== 'granted') {
        setPermissionState('granted');
        logPermissionStateTransition('webrtc', permissionState, 'granted');
        setPermissionError(null);
        
        // Enumerate devices after successful getUserMedia (permission granted)
        try {
          const devices = await enumerateMicrophoneDevices();
          setAvailableDevices(devices);
          
          // Auto-select first device if none selected
          if (devices.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(devices[0].deviceId);
          }
        } catch (deviceError) {
          console.warn('[WebRTC] Failed to enumerate devices:', deviceError);
        }
      }
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
        const correlationId = correlationIdRef.current || 'unknown';
        console.log('[WebRTC] ICE connection state changed', { correlationId, state });
        
        if (state === 'connected' || state === 'completed') {
          // Clear connection timeout on successful connection
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          
          setIsConnected(true);
          setIsConnecting(false);
          
          // Log connection success (without storing raw audio)
          safeLogger.info('WebRTC connection established', {
            timestamp: new Date().toISOString(),
            voiceMode,
            hasAudio: false, // Never log raw audio
          });
          
          // Enable mic for hands-free mode after connection
          if (voiceMode === 'hands-free' && localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
              track.enabled = true;
            });
            setIsMuted(false);
            
            // Update last speech time for hands-free mode
            lastSpeechTimeRef.current = Date.now();
            
            // Log hands-free mode activation (without storing raw audio)
            safeLogger.info('Hands-free mode activated', {
              timestamp: new Date().toISOString(),
              hasAudio: false,
              turnDetectionEnabled: true,
            });
            
            console.log('[WebRTC] Hands-free mode: Microphone enabled, turn detection active');
          }
        } else if (state === 'disconnected' || state === 'failed') {
          // Clear connection timeout on failure
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          setIsConnected(false);
          const errorMsg = state === 'failed' ? 'Connection failed' : 'Connection lost';
          setError(errorMsg);
          if (onError) onError(errorMsg);
          
          // Trigger fallback on connection failure
          if (state === 'failed') {
            triggerFallback(`ICE connection ${state}`);
          }
        }
      };

      // Step 5: Do SDP offer/answer exchange with OpenAI Realtime endpoint
      // Create SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer to our backend proxy which will forward to OpenAI
      // The backend uses the server's API key to authenticate with OpenAI
      const sdpResponse = await fetch('/api/realtime/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          session_token: session.client_secret, // Ephemeral token for session tracking
          session_id: session.session_id, // Session ID if available
        }),
      });

      if (!sdpResponse.ok) {
        let errorText = 'Unknown error';
        let errorDetails: any = {};
        let requestId: string | undefined;
        try {
          const errorData = await sdpResponse.json();
          errorText = errorData.error || errorData.message || errorText;
          errorDetails = errorData;
          requestId = errorData.requestId;
        } catch {
          errorText = await sdpResponse.text().catch(() => errorText);
        }
        
        const correlationId = correlationIdRef.current || 'unknown';
        console.error('[WebRTC] Failed to connect to OpenAI Realtime', { 
          correlationId, 
          status: sdpResponse.status, 
          error: errorText 
        });
        
        // Provide more specific error messages with request ID and correlation ID if available
        let userFriendlyError = `Failed to connect to OpenAI Realtime API`;
        if (requestId) {
          userFriendlyError += ` (Request ID: ${requestId})`;
        }
        if (correlationId !== 'unknown') {
          userFriendlyError += ` (Correlation ID: ${correlationId})`;
        }
        let shouldFallback = false;
        
        if (sdpResponse.status === 400) {
          userFriendlyError = `Realtime API connection failed. Falling back to standard voice.${requestId ? ` (Request ID: ${requestId})` : ''}`;
          shouldFallback = true;
        } else if (sdpResponse.status === 401) {
          userFriendlyError = `Authentication failed. Please refresh the page and try again.${requestId ? ` (Request ID: ${requestId})` : ''}`;
        } else if (sdpResponse.status === 429) {
          userFriendlyError = `Rate limit exceeded. Please wait a moment and try again.${requestId ? ` (Request ID: ${requestId})` : ''}`;
        } else if (sdpResponse.status === 503) {
          userFriendlyError = `Realtime service is temporarily unavailable. Please try again later.${requestId ? ` (Request ID: ${requestId})` : ''}`;
          shouldFallback = true;
        }
        
        // For 400/503 errors, trigger fallback instead of showing error
        if (shouldFallback && onFallback) {
          const correlationId = correlationIdRef.current || 'unknown';
          safeLogger.warn('WebRTC connection failed, falling back to standard voice', {
            correlationId,
            status: sdpResponse.status,
            error: errorText,
            requestId,
            hasSession: !!session,
            sessionId: session?.session_id,
          });
          setHasFailed(true);
          setError(userFriendlyError); // Store error with request ID for display
          setIsConnecting(false);
          
          // Trigger fallback with reason
          triggerFallback(`API error (${sdpResponse.status})`);
          return; // Exit early, don't set error state
        }
        
        safeLogger.error('WebRTC connection failed', {
          status: sdpResponse.status,
          error: errorText,
          details: errorDetails,
          hasSession: !!session,
          sessionId: session?.session_id,
        });
        
        throw new Error(`${userFriendlyError} (${sdpResponse.status})`);
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
      
      // Start silence timeout detection
      startSilenceTimeoutDetection();
      
      // Note: Connection timeout will be cleared when ICE state becomes 'connected' or 'failed'
      // The timeout is set at the start of the connect function
    } catch (err) {
      // Clear connection timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      const correlationId = correlationIdRef.current || 'unknown';
      console.error('[WebRTC] Error connecting to Realtime API', { correlationId, error: err });
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      
      // Structured logging: connection error
      safeLogger.error('WebRTC connection error', {
        correlationId,
        errorMessage: errorMessage, // Error reason without leaking keys
        hasSession: !!sessionRef.current,
        sessionId: sessionRef.current?.session_id,
      });
      
      setError(errorMessage);
      setHasFailed(true);
      setIsConnecting(false);
      if (onError) onError(errorMessage);
      
      // Trigger fallback on connection failure with reason
      const reason = err instanceof Error ? err.message : 'Connection error';
      triggerFallback(reason);
    }
  }, [disabled, isConnecting, isConnected, getSessionCredentials, onError, sendSystemConfig, handleToolCall, handleRealtimeMessage, voiceMode, voiceOutputEnabled, triggerFallback, startTimeoutDetection, startSilenceTimeoutDetection]);

  /**
   * Reconnect to WebRTC
   */
  const reconnect = useCallback(() => {
    console.log('Reconnecting WebRTC...');
    
    // Log reconnection attempt (without storing raw audio)
    safeLogger.info('WebRTC reconnection attempted', {
      timestamp: new Date().toISOString(),
      hasAudio: false, // Never log raw audio
    });
    
    setHasFailed(false);
    setShowFallbackMessage(false);
    setFallbackReason(null);
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
    
    // Update last speech time when user starts speaking
    lastSpeechTimeRef.current = Date.now();
    
    // Log user speech start (without storing raw audio)
    safeLogger.info('User speech started', {
      mode: 'push-to-talk',
      timestamp: new Date().toISOString(),
      hasAudio: false, // Never log raw audio
    });
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
    
    // Update speech time when toggling mute (user interaction)
    lastSpeechTimeRef.current = Date.now();
    
    // Update speech time when toggling mute (user interaction)
    lastSpeechTimeRef.current = Date.now();

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

  // Auto-connect on mount - ONLY if explicitly enabled AND on AI Advisor route
  // By default, autoConnect=false, so user must click Connect button
  // This prevents WebRTC from connecting on other pages or when not selected
  useEffect(() => {
    // Only auto-connect if:
    // 1. autoConnect prop is true (explicitly enabled)
    // 2. On AI Advisor route
    // 3. Not disabled
    // 4. Not already connected/connecting
    // 5. No existing connection
    if (autoConnect && isAiAdvisorRoute && !disabled && !isConnected && !isConnecting && !peerConnectionRef.current) {
      connect();
    } else if (!isAiAdvisorRoute) {
      // If we're not on AI Advisor route, ensure we're disconnected
      // This is a safety check in case component is rendered on wrong route
      if (peerConnectionRef.current) {
        disconnect();
      }
    }

    // Cleanup on unmount (when user navigates away or component unmounts)
    return () => {
      if (peerConnectionRef.current) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, isAiAdvisorRoute]); // Re-run when route changes or autoConnect changes

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
        <div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm" 
          data-testid="fallback-banner"
          data-testid-fallback-triggered="true"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-blue-900 font-medium text-sm mb-1">
                Switching to Standard Voice Mode
              </div>
              <p className="text-blue-700 text-xs mb-3">
                {fallbackReason 
                  ? `Realtime connection unavailable (${fallbackReason}). You can continue using voice with standard mode, or try reconnecting.`
                  : 'Realtime connection unavailable. You can continue using voice with standard mode, or try reconnecting.'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={reconnect}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  data-testid="fallback-retry-button"
                >
                  Try Realtime Again
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFallbackMessage(false);
                    if (onFallback) {
                      onFallback();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-white text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  data-testid="fallback-use-standard-button"
                >
                  Use Standard Voice
                </button>
                <button
                  type="button"
                  onClick={() => setShowFallbackMessage(false)}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  aria-label="Dismiss"
                  data-testid="fallback-dismiss-button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="flex items-center gap-2" data-testid="webrtc-connection-status">
        <div
          data-testid={`webrtc-status-indicator-${isConnected ? 'connected' : isConnecting ? 'connecting' : hasFailed ? 'failed' : 'disconnected'}`}
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
        <span 
          data-testid="webrtc-status-text"
          className="text-sm text-gray-600"
        >
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
            data-testid="reconnect-button"
            onClick={reconnect}
            className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reconnect
          </button>
        )}
      </div>
      
      {/* Permission Error Display */}
      {permissionError && permissionState && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              {(() => {
                const guidance = getPermissionGuidance(permissionState);
                return (
                  <>
                    <p className="font-medium mb-2 text-red-900 text-sm">{guidance.title}</p>
                    <p className="mb-3 text-red-700 text-xs">{guidance.message}</p>
                    {guidance.steps.length > 0 && (
                      <div className="text-xs">
                        <p className="font-medium text-red-900 mb-2">How to fix:</p>
                        <ol className="list-decimal list-inside space-y-1 text-red-700">
                          {guidance.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !showFallbackMessage && !permissionError && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Device Selection */}
      {availableDevices.length > 1 && permissionState === 'granted' && (
        <div className="flex items-center gap-2 mb-3">
          <label className="text-xs text-gray-600">Microphone:</label>
          <select
            value={selectedDeviceId || ''}
            onChange={(e) => {
              setSelectedDeviceId(e.target.value);
              // Disconnect and reconnect with new device if connected
              if (isConnected) {
                disconnect();
                setTimeout(() => {
                  connect();
                }, 500);
              }
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="webrtc-microphone-device-select"
            disabled={isConnecting || isConnected}
          >
            {availableDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mode Selection */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-gray-600">Mode:</label>
        <button
          type="button"
          data-testid="webrtc-push-to-talk-toggle"
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
          data-testid="webrtc-hands-free-toggle"
          onClick={() => {
            setVoiceMode('hands-free');
            // Enable mic when switching to hands-free (if connected)
            if (localStreamRef.current && isConnected) {
              localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = true;
              });
              setIsMuted(false);
              
              // Update speech time when switching modes
              lastSpeechTimeRef.current = Date.now();
              
              // Log mode switch (without storing raw audio)
              safeLogger.info('Switched to hands-free mode', {
                timestamp: new Date().toISOString(),
                hasAudio: false,
              });
              
              console.log('[WebRTC] Switched to hands-free mode: Microphone enabled');
            }
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
              data-testid="webrtc-microphone-button"
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
              data-testid="webrtc-connect-button"
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
            Microphone is muted. Click &quot;Unmuted&quot; to start speaking.
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
