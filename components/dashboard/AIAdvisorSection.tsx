'use client';

import { useState } from 'react';

interface AIAdvisorSectionProps {
  studentProfileId: string | null;
  activeCourses: Array<{
    id: string | null;
    slug: string;
    title: string;
  }>;
}

export function AIAdvisorSection({ studentProfileId, activeCourses }: AIAdvisorSectionProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    // TODO: Implement actual AI advisor API call
    // This would be context-aware based on:
    // - Current course
    // - Current project
    // - Current job application
    setTimeout(() => {
      setIsLoading(false);
      setMessage('');
      // Show response (would come from API)
    }, 1000);
  };

  const contextInfo = activeCourses.length > 0 
    ? `Currently learning: ${activeCourses[0].title}`
    : 'No active courses';

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">AI Advisor</h2>
        <span className="text-xs text-gray-500">AI + Human Hybrid Help</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Context Awareness */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-1">Context-Aware</p>
          <p className="text-sm text-blue-700">{contextInfo}</p>
          {activeCourses.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              I can help with your current course, projects, or job applications.
            </p>
          )}
        </div>

        {/* Chat Interface */}
        <div className="space-y-4">
          <div className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">AI</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Hi! I'm your AI advisor. I can help you with:
                  </p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4 list-disc">
                    <li>Understanding course concepts</li>
                    <li>Project guidance and best practices</li>
                    <li>Job application strategies</li>
                    <li>Career path recommendations</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    For complex questions, I'll connect you with a human instructor.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask a question about your course, project, or career..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>

          {/* Quick Questions */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'How do I get unstuck?',
                'What should I learn next?',
                'Review my project approach',
                'Career advice',
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => setMessage(question)}
                  className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
