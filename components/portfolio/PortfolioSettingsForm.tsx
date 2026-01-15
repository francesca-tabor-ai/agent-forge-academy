'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PortfolioSettingsFormProps {
  currentVisibility: 'private' | 'recruiters_only' | 'public';
  studentProfileId: string;
}

export function PortfolioSettingsForm({
  currentVisibility,
  studentProfileId,
}: PortfolioSettingsFormProps) {
  const router = useRouter();
  const [visibility, setVisibility] = useState<'private' | 'recruiters_only' | 'public'>(currentVisibility);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const visibilityOptions = [
    {
      value: 'private' as const,
      label: 'Private',
      icon: '🔒',
      description: 'Not visible to recruiters or other users. Only you can see your portfolio.',
      color: 'bg-gray-100 text-gray-700',
    },
    {
      value: 'recruiters_only' as const,
      label: 'Recruiters Only',
      icon: '👔',
      description: 'Visible to verified recruiters who can request contact. Not visible to other students.',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      value: 'public' as const,
      label: 'Public',
      icon: '🌐',
      description: 'Publicly visible to everyone, including other students and instructors.',
      color: 'bg-green-100 text-green-700',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/portfolio/visibility', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visibility,
          studentProfileId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update visibility settings');
      }

      setSuccess(true);
      // Refresh the page data
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating visibility:', err);
      setError(err.message || 'Failed to update visibility settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Visibility</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose who can see your portfolio and profile information.
          </p>
        </div>

        <div className="space-y-3">
          {visibilityOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                visibility === option.value
                  ? 'border-brand-light bg-brand-light/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={visibility === option.value}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {visibility === option.value && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${option.color}`}>
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Visibility settings updated successfully!
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || visibility === currentVisibility}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-light rounded-md hover:bg-brand-light/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
