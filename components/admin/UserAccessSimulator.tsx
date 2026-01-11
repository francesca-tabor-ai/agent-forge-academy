'use client';

import { useState, useEffect, useRef } from 'react';

interface User {
  user_id: string;
  email: string | null;
  full_name: string | null;
}

interface CourseAccess {
  id: string;
  slug: string;
  title: string;
  has_access: boolean;
  reason: string;
}

interface SimulationResult {
  user: {
    id: string;
    email: string;
    full_name: string | null;
  };
  subscription: {
    tier: string;
    status: string;
    current_period_end: string | null;
  } | null;
  courses: CourseAccess[];
}

export function UserAccessSimulator() {
  const [userSearch, setUserSearch] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search users for autocomplete
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (userSearch.length < 2) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(userSearch)}&limit=10`);
        const data = await response.json();
        setUserSuggestions(data.users || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error searching users:', err);
        setUserSuggestions([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [userSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearch(user.email || user.user_id);
    setShowSuggestions(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setUserSearch('');
    setUserSuggestions([]);
    setSimulationResult(null);
    setError(null);
  };

  const handleSimulate = async () => {
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }

    setLoading(true);
    setError(null);
    setSimulationResult(null);

    try {
      const response = await fetch(`/api/admin/entitlements/simulate?user_id=${encodeURIComponent(selectedUser.user_id)}`);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to simulate access');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSimulationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to simulate access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Simulate User Access</h2>

      {/* User selector */}
      <div className="relative" ref={suggestionsRef}>
        <div className="flex gap-2">
          <input
            type="text"
            value={userSearch}
            onChange={(e) => {
              setUserSearch(e.target.value);
              if (selectedUser) {
                setSelectedUser(null);
              }
            }}
            onFocus={() => {
              if (userSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search user by email..."
            className="flex-1 px-3 py-2 border rounded-lg"
            style={{ borderColor: 'var(--ca-neutral-300)' }}
          />
          {selectedUser && (
            <button
              onClick={handleClearUser}
              className="px-3 py-2 text-sm text-ca-neutral-500 hover:text-ca-text"
              title="Clear user selection"
            >
              ✕
            </button>
          )}
          <button
            onClick={handleSimulate}
            disabled={!selectedUser || loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Simulating...' : 'Simulate Access'}
          </button>
        </div>

        {/* Autocomplete suggestions */}
        {showSuggestions && userSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto"
               style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {userSuggestions.map((user) => (
              <button
                key={user.user_id}
                onClick={() => handleUserSelect(user)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              >
                <div className="font-medium text-sm">{user.email}</div>
                {user.full_name && (
                  <div className="text-xs text-ca-neutral-500">{user.full_name}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
          <span className="font-medium">Selected:</span> {selectedUser.email}
          {selectedUser.full_name && ` (${selectedUser.full_name})`}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Simulation results */}
      {simulationResult && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">User Information</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Email:</span> {simulationResult.user.email}</p>
              {simulationResult.user.full_name && (
                <p><span className="font-medium">Name:</span> {simulationResult.user.full_name}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Subscription</h3>
            {simulationResult.subscription ? (
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Tier:</span> {simulationResult.subscription.tier}</p>
                <p><span className="font-medium">Status:</span> {simulationResult.subscription.status}</p>
                {simulationResult.subscription.current_period_end && (
                  <p><span className="font-medium">Period End:</span> {new Date(simulationResult.subscription.current_period_end).toLocaleString()}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-ca-neutral-500">No active subscription</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Course Access</h3>
            <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--ca-neutral-300)' }}>
              <table className="min-w-full divide-y text-sm">
                <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Course</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Slug</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Access</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                  {simulationResult.courses.map((course) => (
                    <tr 
                      key={course.id} 
                      className={course.has_access ? 'bg-green-50' : 'bg-red-50'}
                    >
                      <td className="px-4 py-2 font-medium">{course.title}</td>
                      <td className="px-4 py-2 font-mono text-xs text-ca-neutral-500">{course.slug}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          course.has_access 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-red-600 bg-red-100'
                        }`}>
                          {course.has_access ? 'Unlocked' : 'Locked'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-ca-neutral-600">{course.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
