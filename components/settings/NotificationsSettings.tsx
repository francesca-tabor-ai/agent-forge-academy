'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NotificationsSettingsProps {
  studentProfileId: string;
  initialPreferences: {
    weeklyLearningEmailsEnabled: boolean;
    weeklyJobsEmailsEnabled: boolean;
    weeklyEmailDay: number;
    weeklyEmailHour: number;
  };
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

export function NotificationsSettings({
  studentProfileId,
  initialPreferences,
}: NotificationsSettingsProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleToggle = (field: 'weeklyLearningEmailsEnabled' | 'weeklyJobsEmailsEnabled') => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleDayChange = (day: number) => {
    setPreferences((prev) => ({
      ...prev,
      weeklyEmailDay: day,
    }));
  };

  const handleHourChange = (hour: number) => {
    setPreferences((prev) => ({
      ...prev,
      weeklyEmailHour: hour,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/email/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekly_learning_emails_enabled: preferences.weeklyLearningEmailsEnabled,
          weekly_jobs_emails_enabled: preferences.weeklyJobsEmailsEnabled,
          weekly_email_day: preferences.weeklyEmailDay,
          weekly_email_hour: preferences.weeklyEmailHour,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Learning Emails Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Weekly Learning Emails</h3>
          <p className="text-sm text-gray-600 mt-1">
            Get updates on your course progress and next lessons
          </p>
        </div>
        <button
          onClick={() => handleToggle('weeklyLearningEmailsEnabled')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            preferences.weeklyLearningEmailsEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.weeklyLearningEmailsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Jobs Emails Toggle */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">Weekly Jobs Emails</h3>
          <p className="text-sm text-gray-600 mt-1">
            Receive job opportunities matching your skills
          </p>
        </div>
        <button
          onClick={() => handleToggle('weeklyJobsEmailsEnabled')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            preferences.weeklyJobsEmailsEnabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              preferences.weeklyJobsEmailsEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Preferred Day/Time (Optional) */}
      {(preferences.weeklyLearningEmailsEnabled || preferences.weeklyJobsEmailsEnabled) && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Preferred Send Time</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose when you&apos;d like to receive weekly emails
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email-day" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                id="email-day"
                value={preferences.weeklyEmailDay}
                onChange={(e) => handleDayChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email-hour" className="block text-sm font-medium text-gray-700 mb-2">
                Hour (24-hour format)
              </label>
              <select
                id="email-hour"
                value={preferences.weeklyEmailHour}
                onChange={(e) => handleHourChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {HOURS.map((hour) => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <Link
          href="/student/subscription"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Subscription
        </Link>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-sm text-green-600">Saved!</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600">Error saving</span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
