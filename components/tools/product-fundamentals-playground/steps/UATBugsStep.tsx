'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { UATScenario, Bug, BugSeverity, BugDecision } from '@/lib/tools/product-fundamentals-playground/types';
import { PRELOADED_UAT_SCENARIOS } from '@/lib/tools/product-fundamentals-playground/uatScenarios';

interface UATBugsStepProps {
  state: {
    uatScenarios: UATScenario[];
    bugs: Bug[];
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

type ShipDecision = 'ship' | 'no-ship' | null;

export function UATBugsStep({ state, dispatch }: UATBugsStepProps) {
  const [editingBugId, setEditingBugId] = useState<string | 'new' | null>(null);
  const [shipDecision, setShipDecision] = useState<ShipDecision>(null);
  const [shipExplanation, setShipExplanation] = useState('');
  const [blockerOverrideRationale, setBlockerOverrideRationale] = useState('');

  // Bug form state
  const [bugForm, setBugForm] = useState<Omit<Bug, 'id'>>({
    title: '',
    severity: 'minor',
    reproSteps: [],
    expected: '',
    actual: '',
    linkedUATScenarioId: null,
    decision: null,
    rationale: null,
  });
  const [reproStepsInput, setReproStepsInput] = useState('');

  // Load UAT scenarios if not already loaded
  useEffect(() => {
    if (state.uatScenarios.length === 0) {
      dispatch({ type: 'SET_UAT_SCENARIOS', payload: PRELOADED_UAT_SCENARIOS });
    }
  }, [state.uatScenarios.length, dispatch]);

  const handleAddBug = () => {
    setEditingBugId('new');
    setBugForm({
      title: '',
      severity: 'minor',
      reproSteps: [],
      expected: '',
      actual: '',
      linkedUATScenarioId: null,
      decision: null,
      rationale: null,
    });
    setReproStepsInput('');
  };

  const handleEditBug = (bug: Bug) => {
    setEditingBugId(bug.id);
    setBugForm({
      title: bug.title,
      severity: bug.severity,
      reproSteps: bug.reproSteps,
      expected: bug.expected,
      actual: bug.actual,
      linkedUATScenarioId: bug.linkedUATScenarioId,
      decision: bug.decision,
      rationale: bug.rationale,
    });
    setReproStepsInput(bug.reproSteps.join('\n'));
  };

  const handleSaveBug = () => {
    if (!bugForm.title.trim()) {
      alert('Please enter a bug title');
      return;
    }

    const reproSteps = reproStepsInput.split('\n').filter(step => step.trim());
    if (reproSteps.length === 0) {
      alert('Please provide at least one reproduction step');
      return;
    }

    if (!bugForm.expected.trim() || !bugForm.actual.trim()) {
      alert('Please provide both expected and actual behavior');
      return;
    }

    if (!bugForm.decision) {
      alert('Please select an initial triage decision');
      return;
    }

    if (!bugForm.rationale || !bugForm.rationale.trim()) {
      alert('Please provide a rationale for the triage decision');
      return;
    }

    const bug: Bug = {
      id: editingBugId === 'new' ? `bug-${Date.now()}` : editingBugId!,
      title: bugForm.title.trim(),
      severity: bugForm.severity,
      reproSteps,
      expected: bugForm.expected.trim(),
      actual: bugForm.actual.trim(),
      linkedUATScenarioId: bugForm.linkedUATScenarioId,
      decision: bugForm.decision,
      rationale: bugForm.rationale.trim(),
    };

    if (editingBugId === 'new') {
      dispatch({ type: 'ADD_BUG', payload: bug });
    } else {
      dispatch({ type: 'UPDATE_BUG', payload: bug });
    }

    setEditingBugId(null);
  };

  const handleDeleteBug = (id: string) => {
    if (confirm('Are you sure you want to delete this bug?')) {
      dispatch({ type: 'DELETE_BUG', payload: id });
    }
  };

  const handleShipDecision = () => {
    if (!shipDecision) {
      alert('Please select a ship decision');
      return;
    }

    if (!shipExplanation.trim()) {
      alert('Please provide an explanation for your ship decision');
      return;
    }

    // Check for blocker bugs
    const blockerBugs = state.bugs.filter(b => b.severity === 'blocker' && b.decision !== 'fix-now');
    if (shipDecision === 'ship' && blockerBugs.length > 0 && !blockerOverrideRationale.trim()) {
      alert('Cannot ship with unresolved blocker bugs. Please provide an override rationale or resolve the blocker bugs.');
      return;
    }

    // Log ship decision for each blocker bug if shipping with override
    if (shipDecision === 'ship' && blockerBugs.length > 0 && blockerOverrideRationale.trim()) {
      blockerBugs.forEach(bug => {
        dispatch({
          type: 'SET_SHIP_DECISION',
          payload: {
            bugId: bug.id,
            decision: bug.decision,
            rationale: blockerOverrideRationale.trim(),
          },
        });
      });
    }

    // Log the overall ship decision
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      payload: {
        step: 'uat-bugs',
        action: 'ship_decision',
        metadata: {
          decision: shipDecision,
          explanation: shipExplanation,
          blockerBugsCount: blockerBugs.length,
          hasOverride: blockerBugs.length > 0 && blockerOverrideRationale.trim().length > 0,
        },
      },
    });

    alert(`Ship decision recorded: ${shipDecision === 'ship' ? 'SHIP' : 'NO-SHIP'}`);
  };

  // Check for blocker bugs
  const blockerBugs = state.bugs.filter(b => b.severity === 'blocker' && b.decision !== 'fix-now');
  const canShip = blockerBugs.length === 0 || blockerOverrideRationale.trim().length > 0;

  const severityColors: Record<BugSeverity, string> = {
    blocker: 'bg-red-100 text-red-800 border-red-300',
    major: 'bg-orange-100 text-orange-800 border-orange-300',
    minor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  const decisionLabels: Record<BugDecision, string> = {
    'fix-now': 'Fix Now',
    'fix-later': 'Fix Later',
    'wont-fix': "Won't Fix",
    'duplicate': 'Duplicate',
    'not-a-bug': 'Not a Bug',
  };

  return (
    <div className="space-y-6">
      {/* UAT Scenarios Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">UAT Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.uatScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <h4 className="font-semibold text-gray-900 mb-2">{scenario.title}</h4>
              <div className="text-sm text-gray-600 mb-2">
                <div className="font-medium mb-1">Steps:</div>
                <ol className="list-decimal list-inside space-y-1">
                  {scenario.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
              <div className="text-sm text-gray-700 mt-2">
                <strong>Expected:</strong> {scenario.expected}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bugs Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bugs</h3>
          <button
            onClick={handleAddBug}
            className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
          >
            + Log Bug
          </button>
        </div>

        {/* Bugs List */}
        <div className="space-y-3">
          {state.bugs.map((bug) => (
            <div
              key={bug.id}
              className={`border rounded-lg p-4 ${
                bug.severity === 'blocker'
                  ? 'border-red-300 bg-red-50'
                  : bug.severity === 'major'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${severityColors[bug.severity]}`}>
                      {bug.severity.toUpperCase()}
                    </span>
                    <h4 className="font-semibold text-gray-900">{bug.title}</h4>
                  </div>
                  {bug.linkedUATScenarioId && (
                    <div className="text-xs text-gray-600 mb-2">
                      Linked to: {state.uatScenarios.find(s => s.id === bug.linkedUATScenarioId)?.title || 'Unknown scenario'}
                    </div>
                  )}
                  <div className="text-sm text-gray-700 space-y-1 mb-2">
                    <div><strong>Repro Steps:</strong></div>
                    <ol className="list-decimal list-inside ml-4 space-y-1">
                      {bug.reproSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1 mb-2">
                    <div><strong>Expected:</strong> {bug.expected}</div>
                    <div><strong>Actual:</strong> {bug.actual}</div>
                  </div>
                  {bug.decision && (
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>Decision:</strong> {decisionLabels[bug.decision]}
                      {bug.rationale && (
                        <span className="ml-2 text-gray-600">- {bug.rationale}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditBug(bug)}
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBug(bug.id)}
                    className="px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {state.bugs.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No bugs logged yet. Click "Log Bug" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bug Editor */}
      {editingBugId && (
        <div className="border-2 border-brand-light rounded-lg p-6 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-4">
            {editingBugId === 'new' ? 'Log New Bug' : 'Edit Bug'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bug Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bugForm.title}
                onChange={(e) => setBugForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Login button does not respond to clicks"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity <span className="text-red-500">*</span>
                </label>
                <select
                  value={bugForm.severity}
                  onChange={(e) => setBugForm(prev => ({ ...prev, severity: e.target.value as BugSeverity }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link to UAT Scenario
                </label>
                <select
                  value={bugForm.linkedUATScenarioId || ''}
                  onChange={(e) => setBugForm(prev => ({ ...prev, linkedUATScenarioId: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="">None</option>
                  {state.uatScenarios.map(scenario => (
                    <option key={scenario.id} value={scenario.id}>{scenario.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reproduction Steps <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(One per line)</span>
              </label>
              <textarea
                value={reproStepsInput}
                onChange={(e) => setReproStepsInput(e.target.value)}
                placeholder="Step 1&#10;Step 2&#10;Step 3"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Behavior <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bugForm.expected}
                  onChange={(e) => setBugForm(prev => ({ ...prev, expected: e.target.value }))}
                  placeholder="What should happen"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Behavior <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bugForm.actual}
                  onChange={(e) => setBugForm(prev => ({ ...prev, actual: e.target.value }))}
                  placeholder="What actually happens"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Triage Decision <span className="text-red-500">*</span>
                </label>
                <select
                  value={bugForm.decision || ''}
                  onChange={(e) => setBugForm(prev => ({ ...prev, decision: e.target.value as BugDecision | null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="">Select decision</option>
                  <option value="fix-now">Fix Now</option>
                  <option value="fix-later">Fix Later</option>
                  <option value="wont-fix">Won't Fix</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="not-a-bug">Not a Bug</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rationale <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bugForm.rationale || ''}
                  onChange={(e) => setBugForm(prev => ({ ...prev, rationale: e.target.value }))}
                  placeholder="Explain the decision"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveBug}
                className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium"
              >
                Save Bug
              </button>
              <button
                onClick={() => setEditingBugId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship Decision Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ship Decision</h3>
        
        {/* Blocker Bugs Warning */}
        {blockerBugs.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-red-600 text-lg">⚠</span>
              <div className="flex-1">
                <div className="font-semibold text-red-800 mb-1">
                  {blockerBugs.length} Blocker Bug{blockerBugs.length > 1 ? 's' : ''} Unresolved
                </div>
                <div className="text-sm text-red-700 mb-3">
                  The following blocker bugs are not marked as "Fix Now":
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 mb-3">
                  {blockerBugs.map(bug => (
                    <li key={bug.id}>{bug.title} - Decision: {bug.decision ? decisionLabels[bug.decision] : 'None'}</li>
                  ))}
                </ul>
                <div>
                  <label className="block text-sm font-medium text-red-800 mb-2">
                    Override Rationale <span className="text-red-500">*</span>
                    <span className="text-xs text-red-600 font-normal ml-2">(Required to ship with blocker bugs)</span>
                  </label>
                  <textarea
                    value={blockerOverrideRationale}
                    onChange={(e) => setBlockerOverrideRationale(e.target.value)}
                    placeholder="Explain why it's acceptable to ship with unresolved blocker bugs..."
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decision <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shipDecision"
                    value="ship"
                    checked={shipDecision === 'ship'}
                    onChange={() => setShipDecision('ship')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Ship</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="shipDecision"
                    value="no-ship"
                    checked={shipDecision === 'no-ship'}
                    onChange={() => setShipDecision('no-ship')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm font-medium text-gray-700">No-Ship</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-2">(Required)</span>
              </label>
              <textarea
                value={shipExplanation}
                onChange={(e) => setShipExplanation(e.target.value)}
                placeholder="Explain your ship decision. What factors influenced this choice? What risks are being accepted or mitigated?"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
              />
              {!shipExplanation.trim() && (
                <p className="text-xs text-red-600 mt-1">This field is required and cannot be empty.</p>
              )}
            </div>

            {shipDecision === 'ship' && blockerBugs.length > 0 && !canShip && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Cannot ship:</strong> Please provide an override rationale for the unresolved blocker bugs above.
                </p>
              </div>
            )}

            <button
              onClick={handleShipDecision}
              disabled={!shipDecision || !shipExplanation.trim() || (shipDecision === 'ship' && !canShip)}
              className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Record Ship Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
