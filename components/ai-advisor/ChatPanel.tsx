'use client';

import { Message, ActiveContext, NextAction } from './AIAdvisor';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  activeContext: ActiveContext;
  onApplyDescription?: (description: string) => Promise<void>;
  onRetryMessage?: (message: string) => void;
}

export function ChatPanel({ messages, isLoading, chatEndRef, activeContext, onApplyDescription, onRetryMessage }: ChatPanelProps) {
  const [applying, setApplying] = useState<string | null>(null);
  const [copiedRequestId, setCopiedRequestId] = useState<string | null>(null);

  const formatMessage = (content: string) => {
    // Convert markdown to JSX with proper formatting
    return (
      <ReactMarkdown
        components={{
          // Code blocks - dark theme
          pre: ({ children, ...props }: any) => (
            <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
              {children}
            </pre>
          ),
          // Code inside pre blocks
          code: ({ children, className, ...props }: any) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code {...props} className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            // Code block (inside pre)
            return (
              <code {...props} className={`${className || ''} bg-transparent text-gray-100`}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Extract project description from message content
  const extractProjectDescription = (content: string): string | null => {
    // Look for "Recruiter-Optimized Description" or "Project Description" sections
    const recruiterMatch = content.match(/### Recruiter-Optimized Description\s*\n\n(.*?)(?=\n\n###|$)/s);
    if (recruiterMatch) {
      return recruiterMatch[1].trim();
    }
    
    const projectMatch = content.match(/## Project Description:.*?\n\n(.*?)(?=\n\n###|$)/s);
    if (projectMatch) {
      return projectMatch[1].trim();
    }
    
    // If message contains "rewrite_description" intent and has a project context
    return null;
  };

  const handleApplyDescription = async (messageId: string, description: string) => {
    if (!onApplyDescription || !activeContext.project) return;
    
    setApplying(messageId);
    try {
      await onApplyDescription(description);
    } catch (error) {
      console.error('Error applying description:', error);
      alert('Failed to apply description. Please try again.');
    } finally {
      setApplying(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could show a toast notification here
  };

  const handleCopyRequestId = async (requestId: string) => {
    try {
      await navigator.clipboard.writeText(requestId);
      setCopiedRequestId(requestId);
      setTimeout(() => setCopiedRequestId(null), 2000);
    } catch (error) {
      console.error('Failed to copy request ID:', error);
    }
  };

  const handleRetry = (message: string) => {
    if (onRetryMessage) {
      onRetryMessage(message);
    }
  };

  const getActionIcon = (type: NextAction['type']): string => {
    switch (type) {
      case 'start_course':
      case 'open_course':
        return '📚';
      case 'open_lesson':
        return '📖';
      case 'open_job':
        return '💼';
      case 'view_portfolio':
        return '📁';
      case 'add_project':
        return '➕';
      case 'browse_jobs':
        return '🔍';
      case 'unlock_plan':
        return '🎯';
      default:
        return '→';
    }
  };

  const getContextLink = (context: Message['context']) => {
    if (context?.course) {
      return (
        <Link
          href={`/student/courses/${context.course.slug}`}
          className="text-blue-600 hover:text-blue-700 underline text-sm"
        >
          View course: {context.course.title}
        </Link>
      );
    }
    if (context?.project) {
      return (
        <Link
          href={`/student/portfolio`}
          className="text-blue-600 hover:text-blue-700 underline text-sm"
        >
          View project: {context.project.title}
        </Link>
      );
    }
    if (context?.job) {
      return (
        <Link
          href={`/student/jobs`}
          className="text-blue-600 hover:text-blue-700 underline text-sm"
        >
          View job: {context.job.title}
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-hide">
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-testid={`message-bubble-${msg.role}`}
          className={`flex items-start gap-3 ${
            msg.role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-blue-600'
                : msg.role === 'human'
                ? 'bg-purple-500'
                : 'bg-gray-600'
            }`}
          >
            <span className="text-white text-xs font-bold">
              {msg.role === 'user' ? 'You' : msg.role === 'human' ? 'H' : 'AI'}
            </span>
          </div>
          <div
            className={`flex-1 ${
              msg.role === 'user' ? 'text-right' : ''
            }`}
          >
            {/* Render message content first - always show content if present */}
            {msg.content && msg.content.trim() ? (
              <div
                data-testid={msg.content.includes('Service unavailable') || msg.content.includes('SERVICE_UNAVAILABLE') ? 'service-unavailable-banner' : undefined}
                className={`inline-block p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-900'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className={`text-sm ${msg.role === 'user' ? 'prose-invert' : ''} prose prose-sm max-w-none prose-headings:mt-0 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0`}>
                  {formatMessage(msg.content)}
                </div>
              </div>
            ) : msg.role === 'assistant' ? (
              <div className="inline-block p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-gray-900">
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">⚠️ No response returned</p>
                  <p className="text-xs">The AI didn&apos;t return any content. Please try again or contact support if this persists.</p>
                </div>
              </div>
            ) : null}
            
            {/* Render context links below the message content */}
            {msg.context && (msg.context.course || msg.context.project || msg.context.job) && (
              <div className="flex items-center gap-1 mt-2">
                {getContextLink(msg.context)}
              </div>
            )}
            
            {/* Writeback actions for project descriptions */}
            {msg.role === 'assistant' && 
             msg.intent === 'rewrite_description' && 
             activeContext.project && 
             extractProjectDescription(msg.content) && (
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleApplyDescription(msg.id, extractProjectDescription(msg.content)!)}
                  disabled={applying === msg.id}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {applying === msg.id ? 'Applying...' : 'Apply to Project Description'}
                </button>
                <button
                  onClick={() => handleCopy(extractProjectDescription(msg.content)!)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 active:scale-95 hover:shadow-sm transition-all duration-200 ease-out"
                >
                  Copy
                </button>
              </div>
            )}

            {/* Error message actions (Try again, Copy Request ID) */}
            {msg.isError && msg.role === 'assistant' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.retryMessage && onRetryMessage && (
                  <button
                    onClick={() => handleRetry(msg.retryMessage!)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium"
                  >
                    🔄 Try Again
                  </button>
                )}
                {msg.requestId && (
                  <button
                    onClick={() => handleCopyRequestId(msg.requestId!)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:scale-105 active:scale-95 hover:shadow-sm transition-all duration-200 ease-out font-medium"
                  >
                    {copiedRequestId === msg.requestId ? '✓ Copied!' : '📋 Copy Request ID'}
                  </button>
                )}
              </div>
            )}

            {/* Next Actions (structured action buttons) */}
            {msg.role === 'assistant' && msg.nextActions && msg.nextActions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.nextActions.map((action: NextAction, idx: number) => (
                  <Link
                    key={idx}
                    href={action.deepLink}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 hover:shadow-lg transition-all duration-200 ease-out font-medium inline-flex items-center gap-2"
                  >
                    {getActionIcon(action.type)}
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
