'use client';

import { useState } from 'react';

interface Diagnostic {
  endpoint: string;
  status: 'pass' | 'fail';
  requestId?: string;
  latency: number;
  error?: string;
}

interface DiagnosticsResponse {
  status: 'all_passed' | 'some_failed';
  diagnostics: Diagnostic[];
}

export function DiagnosticsRunner() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setDiagnostics(null);

    try {
      const response = await fetch('/api/admin/diagnostics', {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to run diagnostics');
        }
        setLoading(false);
        return;
      }

      const data: DiagnosticsResponse = await response.json();
      setDiagnostics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Diagnostics</h2>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {diagnostics && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`p-4 border-b ${
            diagnostics.status === 'all_passed' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${
                diagnostics.status === 'all_passed' ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {diagnostics.status === 'all_passed' ? '✓' : '⚠'}
              </span>
              <span className={`text-lg font-semibold ${
                diagnostics.status === 'all_passed' ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {diagnostics.status === 'all_passed' 
                  ? 'All Diagnostics Passed' 
                  : 'Some Diagnostics Failed'}
              </span>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {diagnostics.diagnostics.map((diagnostic, index) => (
              <div 
                key={index} 
                className={`p-4 hover:bg-gray-50 ${
                  diagnostic.status === 'fail' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${
                      diagnostic.status === 'pass' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {diagnostic.status === 'pass' ? '✓' : '✗'}
                    </span>
                    <span className="font-medium text-ca-text font-mono text-sm">
                      {diagnostic.endpoint}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    diagnostic.status === 'pass' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {diagnostic.status === 'pass' ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="ml-7 space-y-1 text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-ca-neutral-500">Latency:</span>
                    <span className="text-ca-text font-medium">{diagnostic.latency}ms</span>
                  </div>
                  {diagnostic.requestId && (
                    <div className="flex items-center gap-4">
                      <span className="text-ca-neutral-500">Request ID:</span>
                      <span className="text-ca-text font-mono text-xs">{diagnostic.requestId}</span>
                    </div>
                  )}
                  {diagnostic.error && (
                    <div className="flex items-start gap-4">
                      <span className="text-ca-neutral-500">Error:</span>
                      <span className="text-red-600 text-xs">{diagnostic.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
