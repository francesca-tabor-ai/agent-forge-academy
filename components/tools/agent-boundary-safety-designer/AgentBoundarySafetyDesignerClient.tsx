'use client';

import { useState } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import {
  evaluateBoundary,
  createBoundaryRule,
  createKeywordEvaluator,
  createRegexEvaluator,
  getRulesByAction,
  validateRule,
  type BoundaryRule,
  type BoundaryEvaluationResult,
  type BoundaryAction,
  type EscalationPath,
  type EvaluationMethod,
} from '@/lib/tools/agent-boundary-safety-designer/boundaryEngine';
import type { BoundaryTestCase, BoundaryTestResult } from '@/lib/tools/agent-boundary-safety-designer/types';

interface AgentBoundarySafetyDesignerClientProps {
  toolId: string;
  studentProfileId: string;
}

type ViewMode = 'design' | 'test' | 'export';

export function AgentBoundarySafetyDesignerClient({
  toolId,
  studentProfileId,
}: AgentBoundarySafetyDesignerClientProps) {
  const [rules, setRules] = useState<BoundaryRule[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('design');
  const [editingRule, setEditingRule] = useState<BoundaryRule | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<BoundaryEvaluationResult | null>(null);
  const [testCases, setTestCases] = useState<BoundaryTestCase[]>([]);
  const [testResults, setTestResults] = useState<BoundaryTestResult[]>([]);

  const handleAddRule = () => {
    const newRule = createBoundaryRule(
      `rule-${Date.now()}`,
      'New Rule',
      'Rule description',
      'blocked',
      'Rule statement',
      'Why this rule exists',
      'refusal',
      'keyword',
      createKeywordEvaluator([]),
      { priority: 100 }
    );
    setEditingRule(newRule);
  };

  const handleSaveRule = (rule: BoundaryRule) => {
    const validation = validateRule(rule);
    if (!validation.valid) {
      alert(`Validation errors:\n${validation.errors.join('\n')}`);
      return;
    }

    setRules(prev => {
      const existingIndex = prev.findIndex(r => r.id === rule.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = rule;
        return updated;
      }
      return [...prev, rule];
    });
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(prev => prev.filter(r => r.id !== ruleId));
    }
  };

  const handleTestPrompt = () => {
    if (!testPrompt.trim()) {
      return;
    }

    const result = evaluateBoundary(testPrompt, rules);
    setTestResult(result);

    // Log the test
    logToolRunSafe({
      toolId,
      studentProfileId,
      inputs: {
        testPrompt,
        ruleCount: rules.length,
      },
      outputs: {
        action: result.action,
        escalation: result.escalation,
        matchedRuleId: result.matchedRule?.id,
      },
    });
  };

  const handleRunTestCases = () => {
    if (testCases.length === 0) {
      alert('No test cases defined. Please add test cases first.');
      return;
    }

    const results: BoundaryTestResult[] = testCases.map(testCase => {
      try {
        const actual = evaluateBoundary(testCase.prompt, rules);
        const passed =
          actual.action === testCase.expectedAction &&
          actual.escalation === testCase.expectedEscalation;

        return {
          testCase,
          actual,
          passed,
        };
      } catch (error) {
        return {
          testCase,
          actual: {
            action: 'blocked',
            escalation: 'refusal',
            reasons: ['Test execution error'],
            safeResponseTemplate: 'Error during test execution',
          },
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    setTestResults(results);

    // Log test suite run
    logToolRunSafe({
      toolId,
      studentProfileId,
      inputs: {
        testCaseCount: testCases.length,
        ruleCount: rules.length,
      },
      outputs: {
        passed: results.filter(r => r.passed).length,
        failed: results.filter(r => !r.passed).length,
        results: results.map(r => ({
          testCaseId: r.testCase.id,
          passed: r.passed,
        })),
      },
    });
  };

  const handleExport = () => {
    const config = {
      name: 'Agent Boundary Configuration',
      description: 'Boundary rules for AI agent safety',
      domain: 'general',
      rules: rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        action: rule.action,
        ruleStatement: rule.ruleStatement,
        whyExists: rule.whyExists,
        escalationPath: rule.escalationPath,
        evaluationMethod: rule.evaluationMethod,
        priority: rule.priority,
        safeResponseTemplate: rule.safeResponseTemplate,
        keywords: rule.keywords,
        regexPattern: rule.regexPattern,
        metadata: rule.metadata,
      })),
      testCases: testCases,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boundary-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log export
    logToolRunSafe({
      toolId,
      studentProfileId,
      inputs: {
        ruleCount: rules.length,
        testCaseCount: testCases.length,
      },
      outputs: {
        exported: true,
        exportFormat: 'json',
      },
    });
  };

  const allowedRules = getRulesByAction(rules, 'allowed');
  const blockedRules = getRulesByAction(rules, 'blocked');
  const conditionalRules = getRulesByAction(rules, 'conditional');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Boundary & Safety Designer</h2>
        <p className="text-gray-600 mb-4">
          Design safe boundaries and safety mechanisms for AI agents. Create rules that define what agents can and cannot do, 
          with explicit escalation paths for safety-critical situations.
        </p>

        {/* View Mode Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setViewMode('design')}
            className={`px-4 py-2 font-medium text-sm ${
              viewMode === 'design'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Design Rules
          </button>
          <button
            onClick={() => setViewMode('test')}
            className={`px-4 py-2 font-medium text-sm ${
              viewMode === 'test'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Test Boundaries
          </button>
          <button
            onClick={() => setViewMode('export')}
            className={`px-4 py-2 font-medium text-sm ${
              viewMode === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Export Configuration
          </button>
        </div>
      </div>

      {/* Design Mode */}
      {viewMode === 'design' && (
        <div className="space-y-6">
          {/* Rules Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Allowed ({allowedRules.length})</h3>
              <p className="text-sm text-green-700">Rules that permit agent actions</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Blocked ({blockedRules.length})</h3>
              <p className="text-sm text-red-700">Rules that prevent agent actions</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Conditional ({conditionalRules.length})</h3>
              <p className="text-sm text-yellow-700">Rules that require additional context</p>
            </div>
          </div>

          {/* Rules List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Boundary Rules</h3>
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Rule
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No rules defined yet. Click &quot;Add Rule&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rules
                  .sort((a, b) => a.priority - b.priority)
                  .map(rule => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      onEdit={() => setEditingRule(rule)}
                      onDelete={() => handleDeleteRule(rule.id)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Rule Editor */}
          {editingRule && (
            <RuleEditor
              rule={editingRule}
              onSave={handleSaveRule}
              onCancel={() => setEditingRule(null)}
            />
          )}
        </div>
      )}

      {/* Test Mode */}
      {viewMode === 'test' && (
        <div className="space-y-6">
          {/* Single Prompt Test */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Test Single Prompt</h3>
            <div className="space-y-4">
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a prompt to test against your boundary rules..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
              <button
                onClick={handleTestPrompt}
                disabled={!testPrompt.trim() || rules.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Test Prompt
              </button>
            </div>

            {testResult && (
              <TestResultDisplay result={testResult} />
            )}
          </div>

          {/* Test Cases */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Test Cases</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newCase: BoundaryTestCase = {
                      id: `test-${Date.now()}`,
                      prompt: '',
                      expectedAction: 'blocked',
                      expectedEscalation: 'refusal',
                      description: '',
                    };
                    setTestCases([...testCases, newCase]);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  + Add Test Case
                </button>
                <button
                  onClick={handleRunTestCases}
                  disabled={testCases.length === 0 || rules.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Run All Tests
                </button>
              </div>
            </div>

            {testCases.length > 0 && (
              <div className="space-y-4 mb-4">
                {testCases.map((testCase, index) => (
                  <TestCaseEditor
                    key={testCase.id}
                    testCase={testCase}
                    onChange={(updated) => {
                      const updatedCases = [...testCases];
                      updatedCases[index] = updated;
                      setTestCases(updatedCases);
                    }}
                    onDelete={() => {
                      setTestCases(testCases.filter(tc => tc.id !== testCase.id));
                    }}
                  />
                ))}
              </div>
            )}

            {testResults.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Results ({testResults.filter(r => r.passed).length}/{testResults.length} passed)
                </h4>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        result.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{result.testCase.description || result.testCase.prompt}</p>
                          <p className="text-sm text-gray-600 mt-1">Prompt: &quot;{result.testCase.prompt}&quot;</p>
                          <p className="text-sm mt-2">
                            Expected: <span className="font-medium">{result.testCase.expectedAction}</span> /{' '}
                            <span className="font-medium">{result.testCase.expectedEscalation}</span>
                          </p>
                          <p className="text-sm">
                            Actual: <span className="font-medium">{result.actual.action}</span> /{' '}
                            <span className="font-medium">{result.actual.escalation}</span>
                          </p>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">Error: {result.error}</p>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.passed
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {result.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export Mode */}
      {viewMode === 'export' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Export Configuration</h3>
          <p className="text-gray-600 mb-6">
            Export your boundary configuration as JSON. This can be imported into your agent system or shared with your team.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Configuration Summary</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Total Rules: {rules.length}</li>
                <li>• Allowed Rules: {allowedRules.length}</li>
                <li>• Blocked Rules: {blockedRules.length}</li>
                <li>• Conditional Rules: {conditionalRules.length}</li>
                <li>• Test Cases: {testCases.length}</li>
              </ul>
            </div>

            <button
              onClick={handleExport}
              disabled={rules.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Export Configuration as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Rule Card Component
 */
function RuleCard({
  rule,
  onEdit,
  onDelete,
}: {
  rule: BoundaryRule;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const actionColors = {
    allowed: 'bg-green-50 border-green-200 text-green-900',
    blocked: 'bg-red-50 border-red-200 text-red-900',
    conditional: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  const escalationLabels: Record<EscalationPath, string> = {
    refusal: 'Refuse',
    clarify: 'Clarify',
    handoff: 'Human Handoff',
    quarantine: 'Quarantine',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${actionColors[rule.action]}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg">{rule.name}</h4>
            <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
              Priority: {rule.priority}
            </span>
          </div>
          <p className="text-sm mb-2">{rule.description}</p>
          <p className="text-sm font-medium mb-1">{rule.ruleStatement}</p>
          <p className="text-xs italic mb-2">Why: {rule.whyExists}</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Method: {rule.evaluationMethod}</span>
            <span>Escalation: {escalationLabels[rule.escalationPath]}</span>
            {rule.keywords && rule.keywords.length > 0 && (
              <span>Keywords: {rule.keywords.length}</span>
            )}
            {rule.regexPattern && <span>Regex: {rule.regexPattern.substring(0, 30)}...</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm bg-white border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Rule Editor Component
 */
function RuleEditor({
  rule,
  onSave,
  onCancel,
}: {
  rule: BoundaryRule;
  onSave: (rule: BoundaryRule) => void;
  onCancel: () => void;
}) {
  const [editedRule, setEditedRule] = useState<BoundaryRule>(rule);

  const handleEvaluationMethodChange = (method: EvaluationMethod) => {
    let evaluator: (prompt: string) => boolean;
    
    switch (method) {
      case 'keyword':
        evaluator = createKeywordEvaluator(editedRule.keywords || []);
        break;
      case 'regex':
        evaluator = createRegexEvaluator(editedRule.regexPattern || '');
        break;
      default:
        evaluator = () => false;
    }
    
    setEditedRule({ ...editedRule, evaluationMethod: method, evaluator });
  };

  const handleKeywordsChange = (keywords: string) => {
    const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    const evaluator = createKeywordEvaluator(keywordArray);
    setEditedRule({ ...editedRule, keywords: keywordArray, evaluator });
  };

  const handleRegexChange = (pattern: string) => {
    try {
      const evaluator = createRegexEvaluator(pattern);
      setEditedRule({ ...editedRule, regexPattern: pattern, evaluator });
    } catch (error) {
      // Invalid regex, but allow user to continue editing
      setEditedRule({ ...editedRule, regexPattern: pattern });
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit Rule</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
          <input
            type="text"
            value={editedRule.name}
            onChange={(e) => setEditedRule({ ...editedRule, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={editedRule.description}
            onChange={(e) => setEditedRule({ ...editedRule, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={editedRule.action}
              onChange={(e) => setEditedRule({ ...editedRule, action: e.target.value as BoundaryAction })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="allowed">Allowed</option>
              <option value="blocked">Blocked</option>
              <option value="conditional">Conditional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escalation Path</label>
            <select
              value={editedRule.escalationPath}
              onChange={(e) => setEditedRule({ ...editedRule, escalationPath: e.target.value as EscalationPath })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="refusal">Refusal</option>
              <option value="clarify">Clarify</option>
              <option value="handoff">Human Handoff</option>
              <option value="quarantine">Quarantine</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rule Statement</label>
          <input
            type="text"
            value={editedRule.ruleStatement}
            onChange={(e) => setEditedRule({ ...editedRule, ruleStatement: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Requests for diagnosis are strictly blocked"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Why This Rule Exists</label>
          <textarea
            value={editedRule.whyExists}
            onChange={(e) => setEditedRule({ ...editedRule, whyExists: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            placeholder="e.g., Diagnosis requires clinical examination and professional judgment"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              value={editedRule.priority}
              onChange={(e) => setEditedRule({ ...editedRule, priority: parseInt(e.target.value) || 100 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower number = higher priority</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evaluation Method</label>
            <select
              value={editedRule.evaluationMethod}
              onChange={(e) => handleEvaluationMethodChange(e.target.value as EvaluationMethod)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="keyword">Keyword Matching</option>
              <option value="regex">Regex Pattern</option>
              <option value="custom">Custom Function</option>
            </select>
          </div>
        </div>

        {editedRule.evaluationMethod === 'keyword' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
            <input
              type="text"
              value={editedRule.keywords?.join(', ') || ''}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., diagnose, treatment, prescription"
            />
          </div>
        )}

        {editedRule.evaluationMethod === 'regex' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Regex Pattern</label>
            <input
              type="text"
              value={editedRule.regexPattern || ''}
              onChange={(e) => handleRegexChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="e.g., (diagnose|treatment|prescribe)"
            />
            {editedRule.regexPattern && (
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  try {
                    new RegExp(editedRule.regexPattern!);
                    return '✓ Valid regex';
                  } catch {
                    return '✗ Invalid regex';
                  }
                })()}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Safe Response Template</label>
          <textarea
            value={editedRule.safeResponseTemplate}
            onChange={(e) => setEditedRule({ ...editedRule, safeResponseTemplate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="Response template shown when this rule matches"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <button
            onClick={() => onSave(editedRule)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Rule
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Test Result Display Component
 */
function TestResultDisplay({ result }: { result: BoundaryEvaluationResult }) {
  const actionColors = {
    allowed: 'bg-green-50 border-green-200 text-green-900',
    blocked: 'bg-red-50 border-red-200 text-red-900',
    conditional: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border-2 ${actionColors[result.action]}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-4 h-4 rounded-full mt-1 ${
          result.action === 'allowed' ? 'bg-green-500' :
          result.action === 'blocked' ? 'bg-red-500' :
          'bg-yellow-500'
        }`}></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold">
              Decision: <span className="uppercase">{result.action}</span>
            </h4>
            <span className="px-2 py-1 text-xs font-medium bg-white rounded-full capitalize">
              {result.escalation}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Reasons:</span>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {result.reasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Safe Response:</span>
              <p className="mt-1 italic bg-white p-2 rounded border border-gray-200">
                {result.safeResponseTemplate}
              </p>
            </div>
            {result.matchedRule && (
              <div>
                <span className="font-medium">Matched Rule:</span>
                <p className="mt-1">{result.matchedRule.name} ({result.matchedRule.id})</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Test Case Editor Component
 */
function TestCaseEditor({
  testCase,
  onChange,
  onDelete,
}: {
  testCase: BoundaryTestCase;
  onChange: (testCase: BoundaryTestCase) => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <input
            type="text"
            value={testCase.prompt}
            onChange={(e) => onChange({ ...testCase, prompt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Test prompt"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={testCase.description}
            onChange={(e) => onChange({ ...testCase, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Test case description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Action</label>
          <select
            value={testCase.expectedAction}
            onChange={(e) => onChange({ ...testCase, expectedAction: e.target.value as BoundaryAction })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="allowed">Allowed</option>
            <option value="blocked">Blocked</option>
            <option value="conditional">Conditional</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Escalation</label>
          <select
            value={testCase.expectedEscalation}
            onChange={(e) => onChange({ ...testCase, expectedEscalation: e.target.value as EscalationPath })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="refusal">Refusal</option>
            <option value="clarify">Clarify</option>
            <option value="handoff">Human Handoff</option>
            <option value="quarantine">Quarantine</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
