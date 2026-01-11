'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  disabled?: boolean;
  autoSpeak?: boolean; // Automatically speak assistant responses
  voiceOutputEnabled?: boolean; // Whether voice output is enabled
  onVoiceOutputToggle?: (enabled: boolean) => void; // Toggle voice output
  allowEditBeforeSend?: boolean; // Allow editing transcript before sending
}

type VoiceMode = 'push-to-talk' | 'hands-free';
type RecognitionState = 'idle' | 'listening' | 'processing' | 'error';

// Browser compatibility check with detailed capability detection
function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  } catch (error) {
    console.warn('Error checking Speech Recognition support:', error);
    return false;
  }
}

function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return 'speechSynthesis' in window && typeof window.speechSynthesis !== 'undefined';
  } catch (error) {
    console.warn('Error checking Speech Synthesis support:', error);
    return false;
  }
}

function isMediaDevicesSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    return (
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices !== 'undefined' &&
      'getUserMedia' in navigator.mediaDevices
    );
  } catch (error) {
    console.warn('Error checking MediaDevices support:', error);
    return false;
  }
}

/**
 * Comprehensive browser capability check
 * Returns object with detailed capability information
 */
export function checkVoiceCapabilities(): {
  speechRecognition: boolean;
  speechSynthesis: boolean;
  mediaDevices: boolean;
  isFullySupported: boolean;
  browserInfo: string;
} {
  const speechRecognition = isSpeechRecognitionSupported();
  const speechSynthesis = isSpeechSynthesisSupported();
  const mediaDevices = isMediaDevicesSupported();
  
  // Detect browser
  let browserInfo = 'Unknown';
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      browserInfo = 'Chrome';
    } else if (userAgent.includes('edg')) {
      browserInfo = 'Edge';
    } else if (userAgent.includes('firefox')) {
      browserInfo = 'Firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      browserInfo = 'Safari';
    }
  }

  return {
    speechRecognition,
    speechSynthesis,
    mediaDevices,
    isFullySupported: speechRecognition && speechSynthesis && mediaDevices,
    browserInfo,
  };
}

export function VoiceControls({
  onTranscript,
  onSpeak,
  onStopSpeaking,
  disabled = false,
  autoSpeak = false,
  voiceOutputEnabled = false,
  onVoiceOutputToggle,
  allowEditBeforeSend = true,
}: VoiceControlsProps) {
  const [mode, setMode] = useState<VoiceMode>('push-to-talk');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const recordingStartTimeRef = useRef<number>(0);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptInputRef = useRef<HTMLTextAreaElement>(null);
  const isEditingTranscriptRef = useRef(false);

  // Check microphone permission on mount with error handling
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      // Check if MediaDevices API is available
      if (!isMediaDevicesSupported()) {
        setPermissionError('Microphone access not supported in this browser');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted, stop the stream
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (error) {
            console.warn('Error stopping media track:', error);
          }
        });
        setPermissionError(null);
      } catch (err: any) {
        // Handle specific permission errors
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Microphone permission denied. Please enable microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setPermissionError('Microphone is being used by another application. Please close other apps and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setPermissionError('Microphone constraints could not be satisfied. Please check your device settings.');
        } else {
          setPermissionError('Unable to access microphone. Please check your browser settings.');
        }
        // Don't throw - permission errors are expected and handled gracefully
      }
    };

    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      checkMicrophonePermission().catch((error) => {
        console.error('Unexpected error checking microphone permission:', error);
        // Set a generic error but don't break the component
        setPermissionError('Unable to check microphone permissions');
      });
    }
  }, []);

  // Check browser support on mount with error handling
  useEffect(() => {
    try {
      const capabilities = checkVoiceCapabilities();
      setIsSupported(capabilities.isFullySupported);

      if (!capabilities.isFullySupported) {
        console.warn('Voice capabilities not fully supported:', capabilities);
        return;
      }

      if (capabilities.speechRecognition) {
        // Initialize Speech Recognition with error handling
        let SpeechRecognition;
        try {
          SpeechRecognition =
            (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        } catch (error) {
          console.error('Error accessing SpeechRecognition API:', error);
          setIsSupported(false);
          setError('Speech Recognition API not available');
          return;
        }
        
        if (!SpeechRecognition) {
          setIsSupported(false);
          setError('Speech Recognition not supported in this browser');
          return;
        }

        let recognition;
        try {
          recognition = new SpeechRecognition();
        } catch (error) {
          console.error('Error creating SpeechRecognition instance:', error);
          setIsSupported(false);
          setError('Failed to initialize voice recognition');
          return;
        }
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setRecognitionState('listening');
          setError(null);
          setPermissionError(null);
          lastSpeechTimeRef.current = Date.now();
          recordingStartTimeRef.current = Date.now();
          setRecordingDuration(0);
          
          // Start recording duration timer
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
          }
          recordingIntervalRef.current = setInterval(() => {
            setRecordingDuration(Math.floor((Date.now() - recordingStartTimeRef.current) / 1000));
          }, 1000);
        };

        recognition.onresult = (event: any) => {
          try {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
              } else {
                interimTranscript += transcript;
              }
            }

            if (interimTranscript) {
              setPartialTranscript(interimTranscript);
              lastSpeechTimeRef.current = Date.now();
            }

            if (finalTranscript) {
              const fullText = (finalTranscript + interimTranscript).trim();
              setFinalTranscript(fullText);
              setPartialTranscript('');
              setRecognitionState('processing');
              
              // Reset silence timer
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
              }

              // If edit mode is enabled, show editable transcript instead of sending immediately
              if (allowEditBeforeSend) {
                setEditableTranscript(fullText);
                setIsEditingTranscript(true);
                isEditingTranscriptRef.current = true;
                // Focus the textarea after a brief delay
                setTimeout(() => {
                  try {
                    transcriptInputRef.current?.focus();
                    transcriptInputRef.current?.setSelectionRange(fullText.length, fullText.length);
                  } catch (error) {
                    console.warn('Error focusing transcript input:', error);
                  }
                }, 100);
              } else {
                // Immediately send transcript with error handling
                try {
                  onTranscript(fullText);
                } catch (error) {
                  console.error('Error in onTranscript callback:', error);
                  setError('Failed to send transcript. Please try typing your message instead.');
                }
              }

              // Auto-stop in push-to-talk mode (unless editing)
              if (mode === 'push-to-talk' && !allowEditBeforeSend) {
                stopListening();
              } else if (mode === 'push-to-talk' && allowEditBeforeSend) {
                // Stop listening but keep state for editing
                stopListening();
              } else {
                // Reset silence timer for hands-free mode
                resetSilenceTimer();
              }
            }
          } catch (error) {
            console.error('Error processing recognition result:', error);
            setError('Error processing voice input. Please try again or use text input.');
            stopListening();
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setRecognitionState('error');
          setIsListening(false);
          
          // Stop recording timer
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
          setRecordingDuration(0);
          
          if (event.error === 'no-speech') {
            setError('No speech detected. Please try again.');
            // No speech detected, try to restart if in hands-free mode
            if (mode === 'hands-free') {
              setTimeout(() => {
                if (!disabled) {
                  startListening();
                }
              }, 1000);
            }
          } else if (event.error === 'audio-capture') {
            setError('Microphone not found or not accessible');
            setPermissionError('Please check that your microphone is connected and try again.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone permission denied');
            setPermissionError('Microphone access is required. Please enable microphone permissions in your browser settings and refresh the page.');
          } else if (event.error === 'network') {
            setError('Network error. Please check your connection and try again.');
          } else if (event.error === 'aborted') {
            // User or system aborted, don't show error
            setError(null);
          } else {
            setError(`Recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setRecognitionState('idle');
          
          // Stop recording timer
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }
          
          // Auto-restart in hands-free mode if not manually stopped and not editing
          if (mode === 'hands-free' && !disabled && !isEditingTranscriptRef.current) {
            setTimeout(() => {
              startListening();
            }, 500);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setIsSupported(false);
        setError('Speech Recognition not available');
      }
    } catch (error) {
      console.error('Error initializing voice controls:', error);
      setIsSupported(false);
      setError('Failed to initialize voice features. Text chat is still available.');
    }
  }, [mode, disabled, onTranscript, allowEditBeforeSend]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || disabled || isListening) return;

    try {
      setPartialTranscript('');
      setFinalTranscript('');
      setError(null);
      
      // Additional safety check before starting
      if (!isSpeechRecognitionSupported()) {
        setError('Speech Recognition is not supported in this browser');
        return;
      }

      recognitionRef.current.start();
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      
      // Handle specific error cases
      if (error?.name === 'InvalidStateError' || error?.message?.includes('already started')) {
        // Recognition already running, try to stop and restart
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (retryError) {
              setError('Failed to start voice recognition. Please try again.');
            }
          }, 100);
        } catch (stopError) {
          setError('Voice recognition is already active');
        }
      } else {
        setError('Failed to start voice recognition. Text input is still available.');
      }
    }
  }, [disabled, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        if (isListening) {
      recognitionRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        // Continue cleanup even if stop fails
      }
    }
    
    // Always reset state, even if stop() failed
    setIsListening(false);
    setRecognitionState('idle');
    
    // Stop recording timer
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [isListening]);

  const handleSendEditedTranscript = useCallback(() => {
    const textToSend = editableTranscript.trim();
    if (textToSend) {
      try {
        onTranscript(textToSend);
      } catch (error) {
        console.error('Error sending edited transcript:', error);
        setError('Failed to send message. Please try typing your message instead.');
        // Don't clear the editing state if send failed - let user retry
        return;
      }
    }
    setIsEditingTranscript(false);
    isEditingTranscriptRef.current = false;
    setEditableTranscript('');
    setFinalTranscript('');
    setPartialTranscript('');
  }, [editableTranscript, onTranscript]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingTranscript(false);
    isEditingTranscriptRef.current = false;
    setEditableTranscript('');
    setFinalTranscript('');
    setPartialTranscript('');
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    isEditingTranscriptRef.current = isEditingTranscript;
  }, [isEditingTranscript]);

  // Silence detection for auto-stop
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    if (mode === 'hands-free' && isListening) {
      silenceTimerRef.current = setTimeout(() => {
        const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
        // Auto-stop after 3 seconds of silence
        if (timeSinceLastSpeech > 3000) {
          stopListening();
          // Restart after a brief pause
          setTimeout(() => {
            if (!disabled) {
              startListening();
            }
          }, 1000);
        }
      }, 3000);
    }
  }, [mode, isListening, disabled, stopListening, startListening]);

  // Update silence timer when partial transcript changes
  useEffect(() => {
    if (partialTranscript && isListening) {
      lastSpeechTimeRef.current = Date.now();
      resetSilenceTimer();
    }
  }, [partialTranscript, isListening, resetSilenceTimer]);


  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (onStopSpeaking) {
      onStopSpeaking();
    }
  }, [onStopSpeaking]);

  const speak = useCallback((text: string) => {
    if (!text.trim() || !voiceOutputEnabled) return;

    try {
      if (!isSpeechSynthesisSupported()) {
        console.warn('Speech Synthesis not supported');
        return;
      }

      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech Synthesis API not available');
        return;
      }

      // Stop any ongoing speech
      stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
        if (onSpeak) {
          try {
            onSpeak(text);
          } catch (error) {
            console.error('Error in onSpeak callback:', error);
          }
        }
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onStopSpeaking) {
          try {
            onStopSpeaking();
          } catch (error) {
            console.error('Error in onStopSpeaking callback:', error);
          }
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        // Don't show error to user - TTS is optional
        if (onStopSpeaking) {
          try {
            onStopSpeaking();
          } catch (error) {
            console.error('Error in onStopSpeaking callback:', error);
          }
        }
      };

      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak function:', error);
      // Silently fail - TTS is optional, don't break the UI
      setIsSpeaking(false);
    }
  }, [onSpeak, onStopSpeaking, voiceOutputEnabled, stopSpeaking]);

  // Barge-in: Stop TTS when user starts speaking
  useEffect(() => {
    if (isListening && isSpeaking) {
      // User started speaking while TTS is active - stop TTS immediately
      stopSpeaking();
    }
  }, [isListening, isSpeaking, stopSpeaking]);

  // Listen for speak requests from parent via custom event
  useEffect(() => {
    const handleSpeakRequest = (event: CustomEvent<string>) => {
      if (voiceOutputEnabled && event.detail) {
        speak(event.detail);
      }
    };

    window.addEventListener('voice-speak' as any, handleSpeakRequest as EventListener);
    return () => {
      window.removeEventListener('voice-speak' as any, handleSpeakRequest as EventListener);
    };
  }, [speak, voiceOutputEnabled]);

  // Expose speak function to parent via callback ref pattern
  useEffect(() => {
    if (autoSpeak && onSpeak) {
      // Parent can call onSpeak to trigger speech
      // This is handled via the speak function above
    }
  }, [autoSpeak, onSpeak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stopListening, stopSpeaking]);

  // Fallback UI for unsupported browsers
  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
        <p className="font-medium mb-1">Voice controls not supported</p>
        <p className="text-xs">
          Voice input/output requires Chrome or Edge browser. Please use text input instead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">Voice Mode:</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              stopListening();
              setMode('push-to-talk');
            }}
            disabled={disabled}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              mode === 'push-to-talk'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Push-to-Talk
          </button>
      <button
        type="button"
            onClick={() => {
              stopListening();
              setMode('hands-free');
            }}
        disabled={disabled}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              mode === 'hands-free'
                ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Hands-Free
          </button>
        </div>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-3">
        {/* Microphone Button with Enhanced Visual State */}
        <button
          type="button"
          onMouseDown={() => {
            if (mode === 'push-to-talk') {
              startListening();
            }
          }}
          onMouseUp={() => {
            if (mode === 'push-to-talk' && !allowEditBeforeSend) {
              stopListening();
            }
          }}
          onTouchStart={() => {
            if (mode === 'push-to-talk') {
              startListening();
            }
          }}
          onTouchEnd={() => {
            if (mode === 'push-to-talk' && !allowEditBeforeSend) {
              stopListening();
            }
          }}
          onClick={() => {
            if (mode === 'hands-free') {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }
          }}
          disabled={disabled || !!permissionError}
          className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
              : 'bg-blue-600 hover:bg-blue-700'
          } ${disabled || permissionError ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
            isListening ? 'ring-2 ring-red-300 ring-offset-2' : ''
          }`}
          title={mode === 'push-to-talk' ? 'Hold to speak' : isListening ? 'Stop listening' : 'Start listening'}
          aria-label={isListening ? 'Recording - Click to stop' : 'Click to start recording'}
        >
          {isListening ? (
            // Recording animation - pulsing microphone icon
            <div className="relative">
              <svg
                className="w-6 h-6 text-white animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              {/* Recording indicator rings */}
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-red-500 opacity-20"></span>
              </span>
            </div>
          ) : (
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
        )}
      </button>

        {/* Speaker Button (TTS Toggle) */}
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
            }
            if (onVoiceOutputToggle) {
              onVoiceOutputToggle(!voiceOutputEnabled);
            }
          }}
          disabled={disabled}
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
            voiceOutputEnabled
              ? isSpeaking
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-green-400 hover:bg-green-500'
              : 'bg-gray-200 hover:bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isSpeaking ? 'Stop speaking' : voiceOutputEnabled ? 'Voice output enabled' : 'Enable voice output'}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </button>

        {/* Status Indicator with Recording Duration */}
        <div className="flex-1">
          {recognitionState === 'listening' && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-600 font-medium">Recording...</span>
                {recordingDuration > 0 && (
                  <span className="text-gray-500 text-xs">
                    {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          )}
          {recognitionState === 'processing' && !isEditingTranscript && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex h-2 w-2 bg-blue-500 rounded-full"></span>
              <span>Processing...</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Speaking...</span>
            </div>
          )}
          {!isListening && !isSpeaking && recognitionState === 'idle' && !isEditingTranscript && (
            <div className="text-xs text-gray-400">
              {mode === 'push-to-talk' ? 'Hold microphone to speak' : 'Click microphone to start'}
            </div>
          )}
        </div>
      </div>

      {/* Live Transcript Display */}
      {(partialTranscript || (finalTranscript && !isEditingTranscript)) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xs font-medium text-blue-800 mb-1">Live Transcript:</div>
          <div className="text-sm text-blue-900">
            {finalTranscript && !isEditingTranscript && <span className="font-medium">{finalTranscript}</span>}
            {partialTranscript && (
              <span className="text-blue-600 italic">{partialTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Editable Transcript (Edit Before Send Mode) */}
      {isEditingTranscript && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-amber-800">Edit Transcript Before Sending:</div>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
              aria-label="Cancel editing"
            >
              Cancel
            </button>
          </div>
          <textarea
            ref={transcriptInputRef}
            value={editableTranscript}
            onChange={(e) => setEditableTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSendEditedTranscript();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancelEdit();
              }
            }}
            className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Edit your transcript here..."
            aria-label="Edit transcript before sending"
          />
          <div className="flex items-center justify-between">
            <div className="text-xs text-amber-700">
              Press <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded text-xs">Ctrl+Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded text-xs">Cmd+Enter</kbd> to send
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEditedTranscript}
                disabled={!editableTranscript.trim()}
                className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Error Display with Actionable Guidance */}
      {permissionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <div className="flex items-start gap-2">
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
              <p className="font-medium mb-2">Microphone Access Required</p>
              <p className="mb-3">{permissionError}</p>
              <div className="space-y-2 text-xs">
                <p className="font-medium">How to enable microphone access:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Look for the microphone icon in your browser&apos;s address bar</li>
                  <li>Click it and select &quot;Allow&quot; for microphone access</li>
                  <li>Refresh this page</li>
                </ol>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Display */}
      {error && !permissionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <div className="flex items-start gap-2">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        {mode === 'push-to-talk' ? (
          <p>Hold the microphone button to speak, release to send</p>
        ) : (
          <p>Click microphone to start/stop. Auto-stops after 3 seconds of silence.</p>
        )}
      </div>
    </div>
  );
}

/**
 * Helper function to trigger speech from outside component
 * Usage: triggerVoiceSpeak(text)
 */
export function triggerVoiceSpeak(text: string) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('voice-speak', { detail: text });
    window.dispatchEvent(event);
  }
}
