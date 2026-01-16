'use client';

import { useState, useMemo } from 'react';
import type { AuditLogEntry } from '@/lib/tools/pricing-risk-lab/state';

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: Date): string {
  return timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format action name for display
 */
function formatActionName(action: string): string {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * AuditPanel Component
 */
interface AuditPanelProps {
  auditLog: AuditLogEntry[];
  onClose?: () => void;
}

export function AuditPanel({ auditLog, onClose }: AuditPanelProps) {
  const [filter, setFilter] = useState<string>('all');

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(auditLog.map((entry) => entry.action)));

  // Filter audit log
  const filteredLog = useMemo(() => {
    if (filter === 'all') {
      return auditLog;
    }
    return auditLog.filter((entry) => entry.action === filter);
  }, [auditLog, filter]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Audit Log</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter */}
      {uniqueActions.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Action
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>
                {formatActionName(action)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Audit Log List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredLog.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No audit entries found.</p>
          </div>
        ) : (
          filteredLog.map((entry) => (
            <div
              key={entry.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {formatActionName(entry.action)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                </div>
              </div>
              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  <details className="cursor-pointer">
                    <summary className="font-medium text-gray-700 hover:text-gray-900">
                      View Details
                    </summary>
                    <div className="mt-2 pl-4 border-l-2 border-gray-200">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
        <p>
          Total entries: {auditLog.length} {filter !== 'all' && `(filtered: ${filteredLog.length})`}
        </p>
      </div>
    </div>
  );
}
