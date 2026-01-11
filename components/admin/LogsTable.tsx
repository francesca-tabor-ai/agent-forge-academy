'use client';

import { useState, useEffect, useCallback } from 'react';

interface RequestLog {
  id: string;
  request_id: string;
  user_id: string | null;
  path: string;
  method: string;
  status: number;
  duration: number;
  error_stack: string | null;
  error_message: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface LogsResponse {
  logs: RequestLog[];
  total: number;
  offset: number;
  limit: number;
}

export function LogsTable() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pathFilter, setPathFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 100;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (pathFilter) {
        params.set('path', pathFilter);
      }
      if (statusFilter) {
        params.set('status', statusFilter);
      }
      params.set('offset', offset.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/logs?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch logs');
        }
        setLoading(false);
        return;
      }

      const data: LogsResponse = await response.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [pathFilter, statusFilter, offset, limit]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePathFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPathFilter(e.target.value);
    setOffset(0); // Reset to first page
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setOffset(0); // Reset to first page
  };

  const handlePreviousPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 400 && status < 500) return 'text-yellow-600 bg-yellow-50';
    if (status >= 500) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
            Filter by Endpoint
          </label>
          <select
            value={pathFilter}
            onChange={handlePathFilterChange}
            className="w-full px-3 py-2 border rounded-lg"
            style={{ borderColor: 'var(--ca-neutral-300)' }}
          >
            <option value="">All Endpoints</option>
            <option value="/api/jobs">/api/jobs</option>
            <option value="/api/portfolio/profile">/api/portfolio/profile</option>
            <option value="/api/ai-advisor/chat">/api/ai-advisor/chat</option>
          </select>
        </div>
        
        <div className="w-40">
          <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full px-3 py-2 border rounded-lg"
            style={{ borderColor: 'var(--ca-neutral-300)' }}
          >
            <option value="">All Status</option>
            <option value="200">200 OK</option>
            <option value="400">400 Bad Request</option>
            <option value="401">401 Unauthorized</option>
            <option value="404">404 Not Found</option>
            <option value="500">500 Server Error</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-ca-neutral-500">Loading logs...</p>
        </div>
      )}

      {/* Logs table */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
              <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-ca-neutral-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className={`hover:bg-gray-50 ${log.status >= 500 ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ca-text">
                        {log.request_id.substring(0, 20)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ca-text">
                        {log.path}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-text">
                        {log.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500">
                        {log.duration}ms
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {log.error_message ? (
                          <details className="cursor-pointer">
                            <summary className="text-red-600 hover:text-red-800">
                              {log.error_message.substring(0, 50)}...
                            </summary>
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-48">
                              {log.error_stack || log.error_message}
                            </div>
                          </details>
                        ) : (
                          <span className="text-ca-neutral-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-ca-neutral-500">
              Showing {logs.length > 0 ? offset + 1 : 0} to {Math.min(offset + limit, total)} of {total} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={offset === 0 || loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-ca-neutral-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={offset + limit >= total || loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
