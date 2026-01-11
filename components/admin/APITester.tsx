'use client';

import { useState } from 'react';

interface TestResult {
  status: number;
  body: any;
  latency: number;
  headers?: Record<string, string>;
}

export function APITester() {
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/jobs');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
