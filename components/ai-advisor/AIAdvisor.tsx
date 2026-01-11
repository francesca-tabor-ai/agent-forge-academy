'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ContextBar } from './ContextBar';
import { ChatPanel } from './ChatPanel';
import { QuickActions } from './QuickActions';
import { ContextSelectorModal } from './ContextSelectorModal';
import { HumanEscalationModal } from './HumanEscalationModal';
import { VoiceControls, triggerVoiceSpeak } from './VoiceControls';
import { VoiceErrorBoundary } from './VoiceErrorBoundary';

export interface NextAction {
  type: 'start_course' | 'open_course' | 'open_lesson' | 'open_job' | 'view_portfolio' | 'add_project' | 'browse_jobs' | 'unlock_plan';
  label: string;
  courseSlug?: string;
  lessonSlug?: string;
  jobId?: string;
  deepLink: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'human';
  content: string;
  timestamp: Date;
  context?: {
    course?: { id: string; slug: string; title: string };
    project?: { id: string; title: string };
    job?: { id: string; title: string; company: string };
  };
  intent?: string; // For quick actions
  nextActions?: NextAction[]; // Structured next actions for UI buttons
}

export interface ActiveContext {
  course?: { id: string; slug: string; title: string };
  project?: { id: string; title: string };
  job?: { id: string; title: string; company: string };
}

interface AIAdvisorProps {
  studentProfileId: string | null;
  activeCourses: Array<{ id: string; slug: string; title: string }>;
  activeProjects: Array<{ id: string; title: string }>;
  activeJobs: Array<{ id: string; title: string; company: string }>;
}

export function AIAdvisor({
  studentProfileId,
  activeCourses,
  activeProjects,
  activeJobs,
}: AIAdvisorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI advisor. I can help you with course explanations, project guidance, and job application support. What would you like help with today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<ActiveContext>({});
  const [showContextSelector, setShowContextSelector] = useState(false);
  const [showHumanEscalation, setShowHumanEscalation] = useState(false);
  const [conversationAttempts, setConversationAttempts] = useState(0);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load voice preference from localStorage
  useEffect(() => {
    const savedVoicePreference = localStorage.getItem('voiceEnabled');
    if (savedVoicePreference === 'true') {
      setVoiceOutputEnabled(true);
    }
  }, []);

  // Load context and conversation history from database on mount
  useEffect(() => {
    const loadContextAndHistory = async () => {
      try {
        const response = await fetch('/api/advisor/context');
        if (response.ok) {
          const data = await response.json();
          const loadedContext: ActiveContext = {};
          
          if (data.activeCourseId) {
            const course = activeCourses.find((c) => c.id === data.activeCourseId);
            if (course) loadedContext.course = course;
          }
          
          if (data.activeProjectId) {
            const project = activeProjects.find((p) => p.id === data.activeProjectId);
            if (project) loadedContext.project = project;
          }
          
          if (data.activeJobId) {
            const job = activeJobs.find((j) => j.id === data.activeJobId);
            if (job) loadedContext.job = job;
          }
          
          if (Object.keys(loadedContext).length > 0) {
            setActiveContext(loadedContext);
            
            // Load conversation history for this context
            const convParams = new URLSearchParams();
            if (loadedContext.course) convParams.set('courseId', loadedContext.course.id);
            if (loadedContext.project) convParams.set('projectId', loadedContext.project.id);
            if (loadedContext.job) convParams.set('jobId', loadedContext.job.id);
            
            const convResponse = await fetch(`/api/advisor/conversations?${convParams.toString()}`);
            if (convResponse.ok) {
              const convData = await convResponse.json();
              if (convData.messages && convData.messages.length > 0) {
                // Convert to Message format
                const loadedMessages: Message[] = convData.messages.map((msg: any) => ({
                  id: msg.id,
                  role: msg.role,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                  context: loadedContext,
                  intent: msg.intent,
                  nextActions: msg.metadata?.next_actions || undefined, // Load next actions from metadata
                }));
                
                // Replace initial greeting with loaded messages
                setMessages(loadedMessages);
                if (convData.conversationId) {
                  setConversationId(convData.conversationId);
                }
              }
            }
          } else {
            // Fallback: auto-detect context if none persisted
            const fallbackContext: ActiveContext = {};
            if (activeCourses.length > 0) {
              fallbackContext.course = activeCourses[0];
            }
            if (activeProjects.length > 0) {
              fallbackContext.project = activeProjects[0];
            }
            if (activeJobs.length > 0) {
              fallbackContext.job = activeJobs[0];
            }
            if (Object.keys(fallbackContext).length > 0) {
              setActiveContext(fallbackContext);
            }
          }
        }
      } catch (error) {
        console.error('Error loading context:', error);
        // Fallback: auto-detect context on error
        const fallbackContext: ActiveContext = {};
        if (activeCourses.length > 0) {
          fallbackContext.course = activeCourses[0];
        }
        if (activeProjects.length > 0) {
          fallbackContext.project = activeProjects[0];
        }
        if (activeJobs.length > 0) {
          fallbackContext.job = activeJobs[0];
        }
        if (Object.keys(fallbackContext).length > 0) {
          setActiveContext(fallbackContext);
        }
      }
    };
    
    loadContextAndHistory();
  }, []); // Only run on mount

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [conversationId, setConversationId] = useState<string | null>(null);

  const speakResponse = useCallback((text: string) => {
    if (!voiceOutputEnabled) return;
    
    // Remove markdown formatting for cleaner speech
    const cleanText = text
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      .replace(/`([^`]+)`/g, '$1') // Remove code blocks
      .replace(/\n+/g, '. ') // Replace newlines with pauses
      .trim();

    if (cleanText) {
      // Trigger voice speak via VoiceControls component
      triggerVoiceSpeak(cleanText);
    }
  }, [voiceOutputEnabled]);

  const handleSendMessage = async (messageText: string, isQuickAction = false, intent?: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
      context: activeContext,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setConversationAttempts((prev) => prev + 1);

    // Check if streaming is enabled (can be controlled via localStorage or feature flag)
    const enableStreaming = localStorage.getItem('aiAdvisorStreaming') !== 'false'; // Default to true

    try {
      if (enableStreaming) {
        // Use streaming (SSE)
        const response = await fetch('/api/ai-advisor/chat?stream=true', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            message: messageText,
            context: activeContext,
            studentProfileId,
            conversationHistory: messages.slice(-10), // Last 10 messages for context
            intent,
            conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        // Create placeholder assistant message
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          context: activeContext,
          intent,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Read streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.error) {
                    throw new Error(parsed.error);
                  }

                  if (parsed.content !== undefined) {
                    fullContent += parsed.content;
                    // Update message content in real-time
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: fullContent }
                          : msg
                      )
                    );
                  }

                  if (parsed.done) {
                    if (parsed.conversationId) {
                      setConversationId(parsed.conversationId);
                    }
                    setIsLoading(false);
                    // Speak the response if voice output is enabled
                    if (voiceOutputEnabled && fullContent) {
                      speakResponse(fullContent);
                    }
                    return;
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
          setIsLoading(false);
        }
      } else {
        // Non-streaming fallback
        const response = await fetch('/api/ai-advisor/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            context: activeContext,
            studentProfileId,
            conversationHistory: messages.slice(-10), // Last 10 messages for context
            intent,
            conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        
        // Update conversation ID if provided
        if (data.conversationId) {
          setConversationId(data.conversationId);
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          context: activeContext,
          intent, // Store intent for writeback actions
          nextActions: data.nextActions || undefined, // Include next actions from API
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        // Speak the response if voice output is enabled
        if (voiceOutputEnabled && data.response) {
          speakResponse(data.response);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or connect with a human advisor for help.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handleQuickAction = (prompt: string, intent?: string) => {
    handleSendMessage(prompt, true, intent);
  };

  const handleVoiceOutputToggle = (enabled: boolean) => {
    setVoiceOutputEnabled(enabled);
    localStorage.setItem('voiceEnabled', enabled ? 'true' : 'false');
    
    // If disabling, cancel any ongoing speech
    if (!enabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleEscalateToHuman = () => {
    setShowHumanEscalation(true);
  };

  const hasNoContext = !activeContext.course && !activeContext.project && !activeContext.job;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">AI Advisor</h1>
          <p className="text-sm text-gray-600 mt-1">
            Get help with courses, projects, and job applications.
          </p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={() => {
              setMessages([
                {
                  id: '1',
                  role: 'assistant',
                  content: "Hi! I'm your AI advisor. I can help you with course explanations, project guidance, and job application support. What would you like help with today?",
                  timestamp: new Date(),
                },
              ]);
              setConversationId(null);
            }}
            className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            New Chat
          </button>
        )}
      </div>

      {/* Context Bar */}
      <ContextBar
        activeContext={activeContext}
        onChangeContext={() => setShowContextSelector(true)}
      />

      {/* Empty State */}
      {hasNoContext && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-sm text-blue-800 mb-4">
            To give better help, choose context (optional). You can still ask anything.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/student/courses"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Browse Courses
            </Link>
            <Link
              href="/student/portfolio"
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Add a Project
            </Link>
            <Link
              href="/student/jobs"
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          chatEndRef={chatEndRef}
          activeContext={activeContext}
          onApplyDescription={async (description: string) => {
            if (!activeContext.project?.id) return;
            
            try {
              const response = await fetch(`/api/projects/${activeContext.project.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to update project');
              }
              
              // Show success message
              const successMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ **Success!** Project description has been updated. You can view it in your [portfolio](/student/portfolio).`,
                timestamp: new Date(),
                context: activeContext,
              };
              setMessages((prev) => [...prev, successMessage]);
            } catch (error) {
              console.error('Error applying description:', error);
              throw error;
            }
          }}
        />

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <QuickActions
            activeContext={activeContext}
            onAction={handleQuickAction}
          />
        </div>

        {/* Composer */}
        <div className="border-t border-gray-200 p-4">
          {/* Voice Controls - positioned above input, wrapped in error boundary */}
          <VoiceErrorBoundary
            onError={(error, errorInfo) => {
              console.error('VoiceControls error caught by boundary:', error, errorInfo);
              // Don't break text chat - error boundary handles the UI
            }}
          >
            <VoiceControls
              onTranscript={(text) => {
                // On transcript finalization, call the existing send handler
                // Wrap in try-catch to ensure text chat still works if voice fails
                try {
                  handleSendMessage(text);
                } catch (error) {
                  console.error('Error sending voice transcript:', error);
                  // Text input is still available, so user can retry
                }
              }}
              onSpeak={(text) => {
                // Called when speech starts
              }}
              onStopSpeaking={() => {
                // Called when speech stops
              }}
              disabled={isLoading}
              autoSpeak={voiceOutputEnabled}
              voiceOutputEnabled={voiceOutputEnabled}
              onVoiceOutputToggle={handleVoiceOutputToggle}
            />
          </VoiceErrorBoundary>
          
          <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything… (e.g., &quot;Explain CRAG like I&apos;m new&quot;, &quot;Review my project approach&quot;, &quot;Tailor my CV to this job&quot;)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>

          {/* Human Escalation */}
          {conversationAttempts >= 2 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={handleEscalateToHuman}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Need more help? Connect with a human advisor →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Context Selector Modal */}
      {showContextSelector && (
        <ContextSelectorModal
          activeCourses={activeCourses}
          activeProjects={activeProjects}
          activeJobs={activeJobs}
          currentContext={activeContext}
          onSelectContext={(context) => {
            setActiveContext(context);
            setShowContextSelector(false);
          }}
          onClose={() => setShowContextSelector(false)}
        />
      )}

      {/* Human Escalation Modal */}
      {showHumanEscalation && (
        <HumanEscalationModal
          messages={messages}
          activeContext={activeContext}
          onClose={() => setShowHumanEscalation(false)}
          onConfirm={async () => {
            // TODO: Implement actual escalation API call
            alert('Your request has been sent to a human advisor. They will contact you soon.');
            setShowHumanEscalation(false);
          }}
        />
      )}
    </div>
  );
}
