'use client';

import { useState } from 'react';
import { useClinicalSandbox } from '@/lib/tools/clinical-ai-sandbox/useClinicalSandbox';
import {
  evaluateBoundary,
  getRulesByAction,
  type BoundaryEvaluationResult,
} from '@/lib/tools/clinical-ai-sandbox/boundaryEngine';
import type { BoundaryAction, EscalationPath } from '@/lib/tools/clinical-ai-sandbox/types';

/**
 * Agent Boundary Explorer Component
 * 
 * Visual interface for exploring and testing agent boundaries in clinical AI systems.
 */
export function AgentBoundaryExplorer() {
  const { addAuditLogEntry } = useClinicalSandbox();
  const [testPrompt, setTestPrompt] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<BoundaryEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const allowedRules = getRulesByAction('allowed');
  const blockedRules = getRulesByAction('blocked');
  const conditionalRules = getRulesByAction('conditional');

  const handleTestPrompt = () => {
    if (!testPrompt.trim()) {
      return;
    }

    setIsEvaluating(true);
    
    // Evaluate boundary (deterministic)
    const result = evaluateBoundary(testPrompt);
    setEvaluationResult(result);

    // Append audit log entry
    addAuditLogEntry({
      module: 'agent-boundary-explorer',
      input: testPrompt,
      decision: result.action,
      reasons: result.reasons,
      escalation: result.escalation,
      metadata: {
        safeResponseTemplate: result.safeResponseTemplate,
        matchedRuleId: result.matchedRule?.id,
      },
    });

    setIsEvaluating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleTestPrompt();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Agent Boundary Explorer</h2>
        <p className="mt-2 text-gray-600">
          Explore the boundaries and limitations of AI agents in clinical settings. Understand where human oversight is critical.
        </p>
      </div>

      {/* Boundary Rules Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allowed Actions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            Allowed Actions
          </h3>
          <div className="space-y-4">
            {allowedRules.map((rule) => (
              <BoundaryRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Blocked Actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            Blocked Actions
          </h3>
          <div className="space-y-4">
            {blockedRules.map((rule) => (
              <BoundaryRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Conditional Actions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Conditional Actions
          </h3>
          <div className="space-y-4">
            {conditionalRules.map((rule) => (
              <BoundaryRuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>
      </div>

      {/* Test Prompt Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test a Prompt</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enter a prompt to see how the boundary engine evaluates it. The evaluation is deterministic and based on the rules above.
        </p>

        <div className="space-y-4">
          <textarea
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter a prompt to test (e.g., 'What are the symptoms of diabetes?')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />

          <button
            onClick={handleTestPrompt}
            disabled={!testPrompt.trim() || isEvaluating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isEvaluating ? 'Evaluating...' : 'Evaluate Prompt'}
          </button>
          <p className="text-xs text-gray-500">Press Cmd+Enter to evaluate</p>
        </div>

        {/* Evaluation Result */}
        {evaluationResult && (
          <div className="mt-6 p-4 rounded-lg border-2">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 ${
                evaluationResult.action === 'allowed' ? 'bg-green-500' :
                evaluationResult.action === 'blocked' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Decision: <span className={`${
                      evaluationResult.action === 'allowed' ? 'text-green-700' :
                      evaluationResult.action === 'blocked' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {evaluationResult.action.toUpperCase()}
                    </span>
                  </h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Escalation:</span>
                    <p className="text-gray-600 mt-1 capitalize">{evaluationResult.escalation}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reasons:</span>
                    <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                      {evaluationResult.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Safe Response Template:</span>
                    <p className="text-gray-600 mt-1 italic bg-gray-50 p-2 rounded border border-gray-200">
                      {evaluationResult.safeResponseTemplate}
                    </p>
                  </div>
                  {evaluationResult.matchedRule && (
                    <div>
                      <span className="font-medium text-gray-700">Matched Rule:</span>
                      <p className="text-gray-600 mt-1">{evaluationResult.matchedRule.id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Boundary Rule Card Component
 */
function BoundaryRuleCard({ rule }: { rule: { id: string; ruleStatement: string; whyExists: string; escalationPath: EscalationPath } }) {
  const escalationLabels: Record<EscalationPath, string> = {
    refusal: 'Refuse',
    clarify: 'Clarify',
    handoff: 'Human Handoff',
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-3">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-900">{rule.ruleStatement}</p>
        <p className="text-xs text-gray-600 italic">Why: {rule.whyExists}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Escalation:</span>
          <span className={`text-xs px-2 py-1 rounded ${
            rule.escalationPath === 'handoff' ? 'bg-red-100 text-red-700' :
            rule.escalationPath === 'clarify' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {escalationLabels[rule.escalationPath]}
          </span>
        </div>
      </div>
    </div>
  );
}
