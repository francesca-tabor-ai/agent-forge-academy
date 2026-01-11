'use client';

import { useState } from 'react';

const cancellationReasons = [
  'Too expensive',
  'Not using it enough',
  'Found a better alternative',
  'Temporary break',
  'Other',
];

interface CancelSubscriptionModalProps {
  onConfirm: (reason?: string) => void;
  onClose: () => void;
  renewalDate: string;
  onDowngrade?: () => void;
  onPause?: () => void;
}

export function CancelSubscriptionModal({
  onConfirm,
  onClose,
  renewalDate,
  onDowngrade,
  onPause,
}: CancelSubscriptionModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCancel = () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    onConfirm(selectedReason || undefined);
  };

  if (!showConfirmation && !showAlternatives) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Cancel Subscription</h2>
          <p className="text-sm text-gray-600">
            We're sorry to see you go. What's the main reason for canceling?
          </p>
          <div className="space-y-2">
            {cancellationReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="text-brand-light"
                />
                <span className="text-sm text-gray-700">{reason}</span>
              </label>
            ))}
          </div>
          <div className="pt-4 space-y-2">
            {(onDowngrade || onPause) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-gray-900 mb-2">Before you go, consider:</p>
                <div className="space-y-2">
                  {onDowngrade && (
                    <button
                      onClick={() => {
                        onDowngrade();
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
                    >
                      Downgrade to a lower plan
                    </button>
                  )}
                  {onPause && (
                    <button
                      onClick={() => {
                        onPause();
                        onClose();
                      }}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
                    >
                      Pause subscription temporarily
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Confirm Cancellation</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            Your subscription will remain active until <strong>{formatDate(renewalDate)}</strong>.
            You'll continue to have full access to:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
            <li>All enrolled courses</li>
            <li>Your portfolio and projects</li>
            <li>Job applications and opportunities</li>
            <li>AI Advisor access</li>
          </ul>
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-900 mb-1">What you'll lose:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
              <li>Job access and matched opportunities</li>
              <li>AI Advisor usage</li>
              <li>Portfolio visibility to recruiters</li>
              <li>New course enrollments</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 pt-2">
            After {formatDate(renewalDate)}, your access will end and you won't be charged again.
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}
