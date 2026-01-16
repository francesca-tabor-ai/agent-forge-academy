'use client';

import { useState, useRef, useEffect } from 'react';
import { useClinicalSandbox } from '@/lib/tools/clinical-ai-sandbox/useClinicalSandbox';
import { evaluateBoundary } from '@/lib/tools/clinical-ai-sandbox/boundaryEngine';
import type { BoundaryEvaluationResult } from '@/lib/tools/clinical-ai-sandbox/boundaryEngine';

/**
 * Voice Interaction Demo Component
 * 
 * Demonstrates voice-based interactions with clinical AI systems with safe tone constraints.
 * Progressive enhancement: typed input first, optional voice capture.
 */
export function VoiceInteractionDemo() {
  const { addAuditLogEntry, voiceMode, setVoiceMode } = useClinicalSandbox();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Check for Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Type-safe check for Speech Recognition API
      const win = window as Window & {
        SpeechRecognition?: { new (): SpeechRecognition };
        webkitSpeechRecognition?: { new (): SpeechRecognition };
      };
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      const speechSynthesis = window.speechSynthesis;
      
      setSpeechSupported(!!SpeechRecognition);
      synthRef.current = speechSynthesis;
    }
  }, []);

  // Initialize speech recognition if available
  useEffect(() => {
    if (speechSupported && voiceMode) {
      const win = window as Window & {
        SpeechRecognition?: { new (): SpeechRecognition };
        webkitSpeechRecognition?: { new (): SpeechRecognition };
      };
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [speechSupported, voiceMode]);

  const handleStartListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (synthRef.current && ttsEnabled) {
      synthRef.current.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0;
      synthRef.current.speak(utterance);
    }
  };

  const generateToneConstrainedResponse = (boundaryResult: BoundaryEvaluationResult): string => {
    // Tone constraints: Supportive, Non-authoritative, Redirect to clinician for medical judgment
    
    if (boundaryResult.action === 'blocked') {
      // Refusal + clinician referral
      return `I understand you're looking for help, and I want to make sure you get the right support. ${boundaryResult.safeResponseTemplate} I'd encourage you to speak with a healthcare professional who can provide the personalized guidance you need.`;
    }

    if (boundaryResult.action === 'conditional') {
      // Clarifying question
      return `I'd like to help, but I need a bit more information to provide a safe and accurate response. ${boundaryResult.safeResponseTemplate} Could you share more details about your situation?`;
    }

    if (boundaryResult.action === 'allowed') {
      // Short, empathetic, non-clinical response template (never advice)
      return `I can share some general information that might be helpful. ${boundaryResult.safeResponseTemplate} Please keep in mind that I'm not a healthcare provider, and for any medical concerns, consulting with a doctor is always the best approach.`;
    }

    return boundaryResult.safeResponseTemplate;
  };

  const handleSubmit = () => {
    if (!input.trim() || isProcessing) {
      return;
    }

    setIsProcessing(true);

    // Always route through boundaryEngine first
    const boundaryResult = evaluateBoundary(input.trim());
    
    // Generate tone-constrained response
    const generatedResponse = generateToneConstrainedResponse(boundaryResult);
    setResponse(generatedResponse);

    // Speak response if TTS enabled
    if (ttsEnabled) {
      handleSpeak(generatedResponse);
    }

    // Log interaction in audit log
    addAuditLogEntry({
      module: 'voice-interaction-demo',
      input: input.trim(),
      decision: boundaryResult.action,
      reasons: boundaryResult.reasons,
      escalation: boundaryResult.escalation,
      metadata: {
        responseTemplate: generatedResponse,
        boundaryAction: boundaryResult.action,
        escalation: boundaryResult.escalation,
        matchedRule: boundaryResult.matchedRule?.id,
        voiceMode: voiceMode,
        ttsEnabled: ttsEnabled,
        inputMethod: isListening ? 'voice' : 'typed',
      },
    });

    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Voice Interaction Demo</h2>
        <p className="mt-2 text-gray-600">
          Experience voice-based interactions with clinical AI systems. Test natural language understanding, speech recognition, and conversational flows in a simulated clinical environment.
        </p>
      </div>

      {/* Tone Constraints Indicators */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Tone Constraints (Always Active)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-blue-800">Supportive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-blue-800">Non-authoritative</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-blue-800">Redirect to clinician for medical judgment</span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Your Question</h3>
        
        <div className="space-y-4">
          {/* Voice Controls (if supported) */}
          {speechSupported && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceMode}
                  onChange={(e) => setVoiceMode(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enable Voice Input</span>
              </label>
              {voiceMode && (
                <button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    isListening
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isListening ? 'Stop Listening' : 'Start Voice Input'}
                </button>
              )}
            </div>
          )}

          {/* Text Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your question here... (or use voice input if enabled)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isListening}
          />

          {/* TTS Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tts-toggle"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tts-toggle" className="text-sm text-gray-700 cursor-pointer">
              Enable Text-to-Speech (speak responses)
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isProcessing || isListening}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Submit'}
          </button>
          <p className="text-xs text-gray-500">Press Cmd+Enter to submit</p>
        </div>
      </div>

      {/* Response Section */}
      {response && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-700 leading-relaxed">{response}</p>
          </div>
          {ttsEnabled && (
            <button
              onClick={() => handleSpeak(response)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Speak Again
            </button>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">How It Works</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>All inputs are routed through the boundary engine before any response</li>
          <li>Responses are tone-constrained: supportive, non-authoritative, and redirect to clinicians for medical judgment</li>
          <li>No medical advice is ever provided - only general information and referrals</li>
          <li>All interactions are logged in the audit trail</li>
          <li>Voice input is optional - typed input works without any permissions</li>
        </ul>
      </div>
    </div>
  );
}

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
