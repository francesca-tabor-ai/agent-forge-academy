'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  slug: string;
  title: string;
  access_tier: 'Essential' | 'Professional' | 'None';
  is_published: boolean;
}

export function EntitlementsTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingAllowlist, setSettingAllowlist] = useState(false);
  const [allowlistResult, setAllowlistResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/entitlements/courses');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch courses');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSetEssentialAllowlist = async () => {
    if (!confirm('This will set the Essential tier allowlist to the 5 known Essential courses. Continue?')) {
      return;
    }

    setSettingAllowlist(true);
    setAllowlistResult(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/entitlements/set-essential-allowlist', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to set allowlist');
        setAllowlistResult({ success: false, message: data.error || 'Failed to set allowlist' });
        setSettingAllowlist(false);
        return;
      }

      setAllowlistResult({
        success: true,
        message: `Successfully set Essential allowlist. ${data.updated} courses configured.`,
      });

      // Refresh courses list
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set allowlist');
      setAllowlistResult({ success: false, message: err instanceof Error ? err.message : 'Failed to set allowlist' });
    } finally {
      setSettingAllowlist(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Essential':
        return 'text-blue-600 bg-blue-50';
      case 'Professional':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-ca-neutral-500">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Course Access Tiers</h2>
        <button
          onClick={handleSetEssentialAllowlist}
          disabled={settingAllowlist}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {settingAllowlist ? 'Setting Allowlist...' : 'Set Essential Allowlist'}
        </button>
      </div>

      {/* Result message */}
      {allowlistResult && (
        <div className={`p-4 rounded-lg ${
          allowlistResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={allowlistResult.success ? 'text-green-800' : 'text-red-800'}>
            {allowlistResult.message}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Courses table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                Access Tier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-ca-neutral-500">
                  No courses found
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-ca-text">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ca-neutral-500">
                    {course.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(course.access_tier)}`}>
                      {course.access_tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.is_published 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-600 bg-gray-50'
                    }`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
