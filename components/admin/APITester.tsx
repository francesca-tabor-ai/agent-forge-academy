'use client';

import { useState, useEffect, useRef } from 'react';

interface TestResult {
  status: number;
  body: any;
  latency: number;
  headers?: Record<string, string>;
}

interface User {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
}

export function APITester() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/jobs');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // User selection state
  const [userSearch, setUserSearch] = useState('');
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
  };

  const handleExecute = async () => {
    // Validate path
    if (!path || !path.startsWith('/api/')) {
      setError('Path must start with /api/');
      return;
    }

    // Validate JSON body if provided
    if (body.trim() && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        JSON.parse(body);
      } catch (e) {
        setError('Request body must be valid JSON');
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/api-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          path,
          body: body.trim() || undefined,
          user_id: selectedUser?.user_id || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to execute request');
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute request');
    } finally {
      setLoading(false);
    }
  };

  const formatJSON = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Request Configuration */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Request Configuration</h2>
        
        {/* Act as User */}
        <div>
          <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
            Act as User (Optional)
          </label>
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
                placeholder="Search by email..."
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
                    {user.role && (
                      <div className="text-xs text-ca-neutral-500">Role: {user.role}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="font-medium">Acting as:</span> {selectedUser.email}
              {selectedUser.full_name && ` (${selectedUser.full_name})`}
            </div>
          )}
          <p className="text-xs text-ca-neutral-500 mt-1">
            Select a user to test API endpoints as that user. Admin users cannot be impersonated.
          </p>
        </div>

        {/* Method and Path */}
        <div className="flex gap-4">
          <div className="w-32">
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Path
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/api/jobs"
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
            <p className="text-xs text-ca-neutral-500 mt-1">
              Must start with /api/
            </p>
          </div>
        </div>

        {/* JSON Body Editor */}
        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Request Body (JSON)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm h-32"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
          </div>
        )}

        {/* Execute Button */}
        <div>
          <button
            onClick={handleExecute}
            disabled={loading || !path}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Executing...' : 'Execute Request'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Response */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          
          {/* Status and Latency */}
          <div className="flex gap-6 items-center">
            <div>
              <span className="text-sm text-ca-neutral-500">Status: </span>
              <span className={`text-sm font-semibold ${getStatusColor(result.status)}`}>
                {result.status}
              </span>
            </div>
            <div>
              <span className="text-sm text-ca-neutral-500">Latency: </span>
              <span className="text-sm font-semibold text-ca-text">
                {result.latency}ms
              </span>
            </div>
          </div>

          {/* Response Body */}
          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Response Body
            </label>
            <pre className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-96 text-sm">
              {formatJSON(result.body)}
            </pre>
          </div>

          {/* Response Headers (optional) */}
          {result.headers && Object.keys(result.headers).length > 0 && (
            <details className="mt-4">
              <summary className="text-sm font-medium text-ca-neutral-700 cursor-pointer">
                Response Headers
              </summary>
              <pre className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-48 text-xs mt-2">
                {formatJSON(result.headers)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
