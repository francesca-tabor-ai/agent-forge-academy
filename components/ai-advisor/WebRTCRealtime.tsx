'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface WebRTCRealtimeProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  studentProfileId?: string | null;
}

interface RealtimeSession {
  client_secret: string;
  expires_at: string;
  session_id?: string;
  model: string;
  voice: string;
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
}: WebRTCRealtimeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);

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
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to get session credentials');
    }

    return await response.json();
  }, []);

  /**
   * Establish WebRTC connection to OpenAI Realtime API
   */
  const connect = useCallback(async () => {
    if (disabled || isConnecting || isConnected) return;

    try {
      setIsConnecting(true);
      setError(null);

      // Get ephemeral session credentials
      const session = await getSessionCredentials();
      sessionRef.current = session;

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
      peerConnectionRef.current = pc;

      // Get user media (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      // Add audio track to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create audio element for playback
      const audioElement = document.createElement('audio');
      audioElement.autoplay = true;
      audioElementRef.current = audioElement;

      // Handle incoming audio track
      pc.ontrack = (event) => {
        if (audioElement.srcObject !== event.streams[0]) {
          audioElement.srcObject = event.streams[0];
        }
      };

      // Create data channel for transcripts and events
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

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log('ICE connection state:', state);
        
        if (state === 'connected' || state === 'completed') {
          setIsConnected(true);
          setIsConnecting(false);
        } else if (state === 'disconnected' || state === 'failed') {
          setIsConnected(false);
          setError('Connection lost');
          if (onError) onError('Connection lost');
        }
      };

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
   */
  const handleRealtimeMessage = useCallback((message: any) => {
    // Handle different message types from OpenAI Realtime API
    // Based on OpenAI's Realtime API event structure
    if (message.type === 'conversation.item.input_audio_transcription.completed') {
      const transcript = message.transcript || '';
      setCurrentTranscript(transcript);
      if (onTranscript) onTranscript(transcript);
    } else if (message.type === 'conversation.item.output_audio_transcription.completed') {
      const response = message.transcript || '';
      if (onResponse) onResponse(response);
    } else if (message.type === 'response.audio_transcript.delta') {
      // Streaming transcript updates
      const delta = message.delta || '';
      setCurrentTranscript((prev) => prev + delta);
    } else if (message.type === 'response.audio_transcript.done') {
      // Final transcript
      const transcript = message.transcript || '';
      setCurrentTranscript(transcript);
      if (onResponse) onResponse(transcript);
    } else if (message.type === 'error') {
      const errorMsg = message.error?.message || 'Unknown error from OpenAI';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  }, [onTranscript, onResponse, onError]);

  /**
   * Send message to OpenAI via DataChannel
   */
  const sendMessage = useCallback((text: string) => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.warn('Data channel not open');
      return;
    }

    // Send message in OpenAI Realtime API format
    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: text,
      },
    };

    dataChannelRef.current.send(JSON.stringify(message));
  }, []);

  /**
   * Toggle mute/unmute microphone
   */
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;

    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);
  }, [isMuted]);

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

  // Auto-connect on mount (if not disabled)
  useEffect(() => {
    if (!disabled && !isConnected && !isConnecting) {
      connect();
    }
  }, [disabled, isConnected, isConnecting, connect]);

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

      {/* Controls */}
      <div className="flex items-center gap-2">
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

        {isConnected && (
          <button
            type="button"
            onClick={toggleMute}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isMuted
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
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
          WebRTC Realtime provides a persistent voice connection. Speak naturally and the AI will respond in real-time.
        </p>
      </div>
    </div>
  );
}
