'use client';

import { Message, ActiveContext } from './AIAdvisor';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  activeContext: ActiveContext;
}

export function ChatPanel({ messages, isLoading, chatEndRef, activeContext }: ChatPanelProps) {
  const formatMessage = (content: string) => {
    // Convert markdown to JSX with proper formatting
    return <ReactMarkdown>{content}</ReactMarkdown>;
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
            {msg.context && (msg.context.course || msg.context.project || msg.context.job) && (
              <div className="flex items-center gap-1 mb-1">
                {getContextLink(msg.context)}
              </div>
            )}
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className={`text-sm ${msg.role === 'user' ? 'prose-invert' : ''} prose prose-sm max-w-none prose-headings:mt-0 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0`}>
                {formatMessage(msg.content)}
              </div>
            </div>
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
