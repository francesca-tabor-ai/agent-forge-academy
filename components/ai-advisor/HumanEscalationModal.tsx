'use client';

import { Message, ActiveContext } from './AIAdvisor';
import { useState } from 'react';

interface HumanEscalationModalProps {
  messages: Message[];
  activeContext: ActiveContext;
  onClose: () => void;
  onConfirm: () => void;
}

export function HumanEscalationModal({
  messages,
  activeContext,
  onClose,
  onConfirm,
}: HumanEscalationModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // TODO: Send escalation request to API
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
    onConfirm();
    setIsSubmitting(false);
  };

  const contextSummary = [
    activeContext.course && `Course: ${activeContext.course.title}`,
    activeContext.project && `Project: ${activeContext.project.title}`,
    activeContext.job && `Job: ${activeContext.job.title} at ${activeContext.job.company}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Connect with Human Advisor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            A human advisor will review your conversation and context to provide personalized help.
          </p>

          {/* What will be sent */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">What will be shared:</p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Last {Math.min(messages.length, 10)} messages from this conversation</li>
              {contextSummary && <li>Context: {contextSummary}</li>}
              {reason && <li>Your reason: {reason}</li>}
            </ul>
          </div>

          {/* Privacy note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-600">
              <strong>Privacy:</strong> We will never share passwords, API keys, or other sensitive credentials. 
              If you&apos;ve shared any secrets in this conversation, please redact them before escalating.
            </p>
          </div>

          {/* Reason input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Why do you need human help? (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., I'm stuck after multiple attempts, need help with account issues, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows={3}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Connect with Human Advisor'}
          </button>
        </div>
      </div>
    </div>
  );
}
