'use client';

import { useState } from 'react';
import type { RuleResult } from '@/lib/tools/content-systems-studio/types';
import type { UseContentSystemsStudioReturn } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';

interface RulesPanelProps {
  studio: UseContentSystemsStudioReturn;
  ruleResults: RuleResult[];
  onAcknowledgeWarnings?: (warningCodes: string[]) => void;
  showAcknowledgeCheckbox?: boolean;
}

export function RulesPanel({
  studio,
  ruleResults,
  onAcknowledgeWarnings,
  showAcknowledgeCheckbox = false,
}: RulesPanelProps) {
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState<Set<string>>(new Set());

  // Group results by status
  const blocked = ruleResults.filter((r) => r.status === 'block');
  const warnings = ruleResults.filter((r) => r.status === 'warn');
  const passed = ruleResults.filter((r) => r.status === 'pass');

  const handleWarningAcknowledge = (code: string, checked: boolean) => {
    const newAcknowledged = new Set(acknowledgedWarnings);
    if (checked) {
      newAcknowledged.add(code);
    } else {
      newAcknowledged.delete(code);
    }
    setAcknowledgedWarnings(newAcknowledged);

    if (onAcknowledgeWarnings) {
      onAcknowledgeWarnings(Array.from(newAcknowledged));
    }
  };

  const allWarningsAcknowledged = warnings.length > 0 && warnings.every((w) => acknowledgedWarnings.has(w.code));

  return (
    <div className="space-y-6">
      {/* No Black-Box Behavior Statement */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">No black-box behavior:</span> Every rule decision is explainable. 
              Rationale is always visible, and all automation is deterministic and inspectable.
            </p>
          </div>
        </div>
      </div>

      {/* Blocked Rules */}
      {blocked.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-3">
                Blocking Issues ({blocked.length})
              </h3>
              <div className="space-y-4">
                {blocked.map((result, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">{result.message}</p>
                        {result.fieldKey && (
                          <p className="text-xs text-red-600 mt-1">Field: {result.fieldKey}</p>
                        )}
                      </div>
                      <span className="ml-3 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                        {result.code}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-xs font-medium text-red-700 mb-1">Why this rule triggered:</p>
                      <p className="text-xs text-red-600 leading-relaxed">
                        {result.rationale || 'Rule triggered based on content validation criteria.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Rules */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-3">
                Warnings ({warnings.length})
              </h3>
              <div className="space-y-4">
                {warnings.map((result, index) => (
                  <div key={index} className="bg-white rounded-md p-3 border border-yellow-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {showAcknowledgeCheckbox && (
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acknowledgedWarnings.has(result.code)}
                              onChange={(e) => handleWarningAcknowledge(result.code, e.target.checked)}
                              className="mt-1 mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900">{result.message}</p>
                              {result.fieldKey && (
                                <p className="text-xs text-yellow-600 mt-1">Field: {result.fieldKey}</p>
                              )}
                            </div>
                          </label>
                        )}
                        {!showAcknowledgeCheckbox && (
                          <>
                            <p className="text-sm font-medium text-yellow-900">{result.message}</p>
                            {result.fieldKey && (
                              <p className="text-xs text-yellow-600 mt-1">Field: {result.fieldKey}</p>
                            )}
                          </>
                        )}
                      </div>
                      <span className="ml-3 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                        {result.code}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <p className="text-xs font-medium text-yellow-700 mb-1">Why this rule triggered:</p>
                      <p className="text-xs text-yellow-600 leading-relaxed">
                        {result.rationale || 'Rule triggered based on content validation criteria.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {showAcknowledgeCheckbox && warnings.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-md border border-yellow-200">
                  <p className="text-xs text-yellow-700">
                    {allWarningsAcknowledged
                      ? '✓ All warnings acknowledged'
                      : `Please acknowledge all ${warnings.length} warning(s) to proceed`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Passed Rules */}
      {passed.length > 0 && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-semibold text-green-800 mb-2">
                Passed Rules ({passed.length})
              </h3>
              <div className="space-y-2">
                {passed.map((result, index) => (
                  <div key={index} className="bg-white rounded-md p-2 border border-green-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-900">{result.message}</p>
                      <span className="ml-3 text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        {result.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {ruleResults.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">No rules have been evaluated yet.</p>
          <p className="text-xs text-gray-400 mt-1">Rules run automatically on save and workflow transitions.</p>
        </div>
      )}
    </div>
  );
}
