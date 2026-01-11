'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ContextBar } from './ContextBar';
import { ChatPanel } from './ChatPanel';
import { QuickActions } from './QuickActions';
import { ContextSelectorModal } from './ContextSelectorModal';
import { HumanEscalationModal } from './HumanEscalationModal';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load context from database on mount
  useEffect(() => {
    const loadContext = async () => {
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
    
    loadContext();
  }, []); // Only run on mount

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText: string, isQuickAction = false) => {
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

    try {
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        context: activeContext,
      };

      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt, true);
  };

  const handleEscalateToHuman = () => {
    setShowHumanEscalation(true);
  };

  const hasNoContext = !activeContext.course && !activeContext.project && !activeContext.job;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">AI Advisor</h1>
        <p className="text-sm text-gray-600 mt-1">
          Get help with courses, projects, and job applications.
        </p>
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
          <form onSubmit={handleSubmit} className="flex gap-2">
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
