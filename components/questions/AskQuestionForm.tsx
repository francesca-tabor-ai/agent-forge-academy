'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function AskQuestionForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    context_type: 'lesson' as 'lesson' | 'lab' | 'project',
    context_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          context_id: formData.context_id.trim() || null, // Allow empty context_id
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create question');
      }

      // Success - redirect to questions list
      router.push('/student/questions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title.trim().length > 0 && formData.body.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Ask a question</h1>
        <p className="text-sm text-gray-600">
          Include what you tried and what you expected. The more specific you are, the faster {"you&apos;ll"} get help.
        </p>
      </header>

      {/* Form Card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-gray-900">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Why is my Supabase query returning 500 on the detail page?"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-ca-gold transition-all"
            />
            <p className="text-xs text-gray-500">Keep it short and specific.</p>
          </div>

          {/* Details Field */}
          <div className="space-y-1.5">
            <label htmlFor="body" className="text-sm font-medium text-gray-900">
              Details
            </label>
            <textarea
              id="body"
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              placeholder={`What are you trying to do?
What happened?
What did you expect?
What have you tried so far?
(Include errors / screenshots if relevant)`}
              className="min-h-[160px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-ca-gold transition-all resize-y"
            />
            <p className="text-xs text-gray-500">
              Be specific about the problem, what {"you&apos;ve"} tried, and any error messages.
            </p>
          </div>

          {/* Context Fields - 2 column grid on desktop */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Context Type */}
            <div className="space-y-1.5">
              <label htmlFor="context_type" className="text-sm font-medium text-gray-900">
                Related to
              </label>
              <select
                id="context_type"
                value={formData.context_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    context_type: e.target.value as 'lesson' | 'lab' | 'project',
                    context_id: '', // Reset context_id when type changes
                  })
                }
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-ca-gold transition-all bg-white"
              >
                <option value="lesson">Lesson</option>
                <option value="lab">Lab</option>
                <option value="project">Project</option>
              </select>
            </div>

            {/* Context ID - Optional */}
            <div className="space-y-1.5">
              <label htmlFor="context_id" className="text-sm font-medium text-gray-900">
                Context ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="context_id"
                type="text"
                value={formData.context_id}
                onChange={(e) => setFormData({ ...formData, context_id: e.target.value })}
                placeholder="e.g., lesson-01, lab-02, project-capstone"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-ca-gold transition-all"
              />
              <p className="text-xs text-gray-500">
                Paste the lesson/lab/project ID from the URL if this question relates to specific content.
              </p>
            </div>
          </div>

          {/* Guidelines (Collapsible) */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <span>Guidelines for asking good questions</span>
              <span className="text-gray-400">{showGuidelines ? '−' : '+'}</span>
            </button>
            {showGuidelines && (
              <div className="mt-3 space-y-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900 mb-2">To get the best help:</p>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Include error messages or screenshots</li>
                  <li>Describe steps to reproduce the issue</li>
                  <li>Explain what you expected vs. what actually happened</li>
                  <li>Share what {"you&apos;ve"} already tried</li>
                  <li>Be specific and concise</li>
                </ul>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-gray-200">
            <Link
              href="/student/questions"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post question'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
