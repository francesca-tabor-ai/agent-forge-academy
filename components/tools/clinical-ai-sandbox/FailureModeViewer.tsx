'use client';

import { useState } from 'react';
import { useClinicalSandbox } from '@/lib/tools/clinical-ai-sandbox/useClinicalSandbox';
import { evaluateBoundary } from '@/lib/tools/clinical-ai-sandbox/boundaryEngine';
import { retrieveDocuments, getRAGResponse, CONFIDENCE_THRESHOLD } from '@/lib/tools/clinical-ai-sandbox/ragEngine';
import {
  FAILURE_MODE_PROMPTS,
  getAllCategories,
  getPromptsByCategory,
  type FailureModePrompt,
  type FailureModeCategory,
} from '@/lib/tools/clinical-ai-sandbox/failurePrompts';
import type { BoundaryEvaluationResult } from '@/lib/tools/clinical-ai-sandbox/boundaryEngine';

/**
 * Failure Mode Viewer Component
 * 
 * Interface for analyzing common failure modes in clinical AI applications.
 * Shows how the system handles edge cases and unsafe prompts.
 */
export function FailureModeViewer() {
  const { addAuditLogEntry } = useClinicalSandbox();
  const [selectedCategory, setSelectedCategory] = useState<FailureModeCategory | 'all'>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<FailureModePrompt | null>(null);
  const [boundaryResult, setBoundaryResult] = useState<BoundaryEvaluationResult | null>(null);
  const [ragResult, setRagResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const categories = getAllCategories();
  const displayedPrompts =
    selectedCategory === 'all'
      ? FAILURE_MODE_PROMPTS
      : getPromptsByCategory(selectedCategory);

  const handleRunPrompt = (prompt: FailureModePrompt) => {
    setIsRunning(true);
    setSelectedPrompt(prompt);

    // Run through boundary engine
    const boundaryEvaluation = evaluateBoundary(prompt.prompt);
    setBoundaryResult(boundaryEvaluation);

    // Run through RAG engine if it's an informational query (allowed)
    let ragResponse: string | null = null;
    if (boundaryEvaluation.action === 'allowed') {
      const ragQueryResult = retrieveDocuments(prompt.prompt);
      ragResponse = getRAGResponse(ragQueryResult);
      setRagResult(ragResponse);
    } else {
      setRagResult(null);
    }

    // Append audit log entry
    addAuditLogEntry({
      module: 'failure-mode-viewer',
      input: prompt.prompt,
      decision: `${boundaryEvaluation.action}_${boundaryEvaluation.escalation}`,
      reasons: [
        ...boundaryEvaluation.reasons,
        `Category: ${prompt.category}`,
        `Risk Level: ${prompt.risk_level}`,
        `Expected: ${prompt.expectedBoundaryAction}/${prompt.expectedEscalation}`,
      ],
      escalation: boundaryEvaluation.escalation,
      metadata: {
        category: prompt.category,
        riskLevel: prompt.risk_level,
        expectedAction: prompt.expectedBoundaryAction,
        expectedEscalation: prompt.expectedEscalation,
        actualAction: boundaryEvaluation.action,
        actualEscalation: boundaryEvaluation.escalation,
        matchedRule: boundaryEvaluation.matchedRule?.id,
        safeResponseTemplate: boundaryEvaluation.safeResponseTemplate,
        ragResponse: ragResponse || null,
        confidence: boundaryEvaluation.action === 'allowed' ? retrieveDocuments(prompt.prompt).confidence : null,
      },
    });

    setIsRunning(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'blocked':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'allowed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'conditional':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Failure Mode Viewer</h2>
        <p className="mt-2 text-gray-600">
          Analyze common failure modes in clinical AI applications. Review case studies of system failures, edge cases, and learn how to implement robust error handling.
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preloaded Failure Mode Prompts</h3>
        <div className="space-y-3">
          {displayedPrompts.map((prompt, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(prompt.risk_level)}`}>
                      {prompt.risk_level.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {prompt.category.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{prompt.prompt}</p>
                  <p className="text-xs text-gray-600 italic">{prompt.description}</p>
                </div>
                <button
                  onClick={() => handleRunPrompt(prompt)}
                  disabled={isRunning}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Run
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedPrompt && boundaryResult && (
        <div className="space-y-4">
          {/* Boundary Evaluation Result */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Boundary Evaluation Result</h3>

            <div className="space-y-4">
              {/* Chosen Path */}
              <div className={`p-4 rounded-lg border-2 ${getActionColor(boundaryResult.action)}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Chosen Path:</span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-white">
                    {boundaryResult.action.toUpperCase()} → {boundaryResult.escalation.toUpperCase()}
                  </span>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-sm">Why this path:</span>
                  <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                    {boundaryResult.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Safe Response Template */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-medium text-sm text-gray-700">Safe Response Template:</span>
                <p className="text-sm text-gray-600 mt-2 italic">{boundaryResult.safeResponseTemplate}</p>
              </div>

              {/* Expected vs Actual */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="font-medium text-sm text-blue-900">Expected vs Actual:</span>
                <div className="mt-2 space-y-1 text-sm">
                  <div>
                    <span className="text-blue-700">Expected: </span>
                    <span className="font-medium">
                      {selectedPrompt.expectedBoundaryAction}/{selectedPrompt.expectedEscalation}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Actual: </span>
                    <span className="font-medium">
                      {boundaryResult.action}/{boundaryResult.escalation}
                    </span>
                  </div>
                  {boundaryResult.action === selectedPrompt.expectedBoundaryAction &&
                  boundaryResult.escalation === selectedPrompt.expectedEscalation ? (
                    <div className="text-green-700 font-medium">✓ Matches expected behavior</div>
                  ) : (
                    <div className="text-orange-700 font-medium">⚠ Does not match expected behavior</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RAG Result (if applicable) */}
          {boundaryResult.action === 'allowed' && ragResult && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">RAG Response</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{ragResult}</pre>
              </div>
            </div>
          )}

          {/* What Gets Logged */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What Gets Logged</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Module:</span>
                  <span className="text-gray-600 ml-2">failure-mode-viewer</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Input:</span>
                  <span className="text-gray-600 ml-2">{selectedPrompt.prompt}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Decision:</span>
                  <span className="text-gray-600 ml-2">
                    {boundaryResult.action}_{boundaryResult.escalation}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reasons:</span>
                  <ul className="list-disc list-inside text-gray-600 mt-1 ml-4 space-y-1">
                    {boundaryResult.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                    <li>Category: {selectedPrompt.category}</li>
                    <li>Risk Level: {selectedPrompt.risk_level}</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Escalation:</span>
                  <span className="text-gray-600 ml-2">{boundaryResult.escalation}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Metadata:</span>
                  <div className="text-gray-600 mt-1 ml-4 text-xs">
                    <div>• Category: {selectedPrompt.category}</div>
                    <div>• Risk Level: {selectedPrompt.risk_level}</div>
                    <div>• Expected: {selectedPrompt.expectedBoundaryAction}/{selectedPrompt.expectedEscalation}</div>
                    <div>• Actual: {boundaryResult.action}/{boundaryResult.escalation}</div>
                    {boundaryResult.matchedRule && (
                      <div>• Matched Rule: {boundaryResult.matchedRule.id}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
