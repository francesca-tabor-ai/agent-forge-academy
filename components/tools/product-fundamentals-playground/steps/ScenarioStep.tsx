'use client';

import { useState, useEffect } from 'react';
import type { PlaygroundAction } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import type { CaseScenario } from '@/lib/tools/product-fundamentals-playground/types';
import { PRELOADED_SCENARIOS } from '@/lib/tools/product-fundamentals-playground/scenarios';

interface ScenarioStepProps {
  state: {
    scenario: CaseScenario | null;
  };
  dispatch: React.Dispatch<PlaygroundAction>;
}

export function ScenarioStep({ state, dispatch }: ScenarioStepProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | 'custom' | null>(
    state.scenario?.id || null
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTargetUser, setCustomTargetUser] = useState('');
  const [constraints, setConstraints] = useState<string[]>(
    state.scenario?.constraints || []
  );
  const [constraintsInput, setConstraintsInput] = useState(
    state.scenario?.constraints.join(', ') || ''
  );

  // Load existing scenario data if present
  useEffect(() => {
    if (state.scenario) {
      if (PRELOADED_SCENARIOS.find(s => s.id === state.scenario!.id)) {
        setSelectedScenarioId(state.scenario.id);
      } else {
        setSelectedScenarioId('custom');
        setCustomTitle(state.scenario.title);
        setCustomPrompt(state.scenario.prompt);
        setCustomTargetUser(state.scenario.targetUser);
        setConstraints(state.scenario.constraints);
        setConstraintsInput(state.scenario.constraints.join(', '));
      }
    }
  }, [state.scenario]);

  const handleScenarioSelect = (scenarioId: string | 'custom') => {
    setSelectedScenarioId(scenarioId);
    // Load constraints from preloaded scenario if selected
    if (scenarioId !== 'custom') {
      const preloaded = PRELOADED_SCENARIOS.find(s => s.id === scenarioId);
      if (preloaded) {
        setConstraints(preloaded.constraints);
        setConstraintsInput(preloaded.constraints.join(', '));
      }
    }
  };

  const handleConstraintsChange = (value: string) => {
    setConstraintsInput(value);
    const parsed = value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
    setConstraints(parsed);
  };

  const handleSave = () => {
    let scenario: CaseScenario;

    if (selectedScenarioId === 'custom') {
      if (!customTitle.trim() || !customPrompt.trim() || !customTargetUser.trim()) {
        alert('Please fill in all required fields: Title, Prompt, and Target User');
        return;
      }
      scenario = {
        id: `custom-${Date.now()}`,
        title: customTitle.trim(),
        prompt: customPrompt.trim(),
        constraints,
        targetUser: customTargetUser.trim(),
      };
    } else {
      const preloaded = PRELOADED_SCENARIOS.find(s => s.id === selectedScenarioId);
      if (!preloaded) {
        alert('Please select a scenario');
        return;
      }
      scenario = {
        ...preloaded,
        constraints, // Allow editing constraints even for preloaded scenarios
      };
    }

    dispatch({
      type: 'SET_SCENARIO',
      payload: scenario,
    });
  };

  const selectedPreloadedScenario = selectedScenarioId && selectedScenarioId !== 'custom'
    ? PRELOADED_SCENARIOS.find(s => s.id === selectedScenarioId)
    : null;

  return (
    <div className="space-y-6">
      {/* Preloaded Scenarios */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Choose a Preloaded Scenario</h3>
        <div className="space-y-2">
          {PRELOADED_SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioSelect(scenario.id)}
              className={`
                w-full text-left p-4 border-2 rounded-lg transition-colors
                ${selectedScenarioId === scenario.id
                  ? 'border-brand-light bg-brand-light/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={selectedScenarioId === scenario.id}
                  onChange={() => handleScenarioSelect(scenario.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 mb-1">{scenario.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{scenario.prompt}</div>
                  <div className="text-xs text-gray-500">
                    <strong>Target User:</strong> {scenario.targetUser}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario Option */}
      <div>
        <button
          onClick={() => handleScenarioSelect('custom')}
          className={`
            w-full text-left p-4 border-2 rounded-lg transition-colors
            ${selectedScenarioId === 'custom'
              ? 'border-brand-light bg-brand-light/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              checked={selectedScenarioId === 'custom'}
              onChange={() => handleScenarioSelect('custom')}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">Custom Scenario</div>
              <div className="text-sm text-gray-600 mt-1">
                Create your own product scenario from scratch
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Custom Scenario Form */}
      {selectedScenarioId === 'custom' && (
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scenario Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., AI-Powered Customer Support Platform"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scenario Prompt <span className="text-red-500">*</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe the product you want to build, the problem it solves, and the value it provides..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target User <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customTargetUser}
              onChange={(e) => setCustomTargetUser(e.target.value)}
              placeholder="e.g., Small business owners (5-50 employees) managing customer support"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
            />
          </div>
        </div>
      )}

      {/* Constraints Input (shown for both preloaded and custom) */}
      {selectedScenarioId && (
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Constraints (Optional)
            <span className="text-xs text-gray-500 font-normal ml-2">
              Comma-separated list of constraints, requirements, or limitations
            </span>
          </label>
          <input
            type="text"
            value={constraintsInput}
            onChange={(e) => handleConstraintsChange(e.target.value)}
            placeholder="e.g., Must work offline, Budget: $100k, Launch in 6 months"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
          />
          {constraints.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {constraints.map((constraint, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {constraint}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preview/Current Scenario */}
      {(selectedPreloadedScenario || (selectedScenarioId === 'custom' && customTitle)) && (
        <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Scenario Preview</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong className="text-gray-700">Title:</strong>{' '}
              <span className="text-gray-900">
                {selectedPreloadedScenario?.title || customTitle || 'Not set'}
              </span>
            </div>
            <div>
              <strong className="text-gray-700">Target User:</strong>{' '}
              <span className="text-gray-900">
                {selectedPreloadedScenario?.targetUser || customTargetUser || 'Not set'}
              </span>
            </div>
            {constraints.length > 0 && (
              <div>
                <strong className="text-gray-700">Constraints:</strong>{' '}
                <span className="text-gray-900">{constraints.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* What Good Looks Like Checklist */}
      <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">What Good Looks Like</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Clear problem statement that identifies a real user need</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Specific target user segment (not &quot;everyone&quot;)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Realistic constraints that reflect business reality</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Prompt describes the &quot;what&quot; and &quot;why&quot;, not just features</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Scenario is scoped appropriately (not too broad or too narrow)</span>
          </li>
        </ul>
      </div>

      {/* Save Button */}
      {selectedScenarioId && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
          >
            Save Scenario
          </button>
        </div>
      )}
    </div>
  );
}
