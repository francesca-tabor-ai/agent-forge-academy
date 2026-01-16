'use client';

import { useState } from 'react';
import { usePlayground } from '@/lib/tools/product-fundamentals-playground/usePlayground';

type Step = 
  | 'scenario'
  | 'research'
  | 'personas-problems'
  | 'journey-map'
  | 'roadmap'
  | 'sprint-plan'
  | 'uat-bugs'
  | 'export';

interface StepConfig {
  key: Step;
  label: string;
  description?: string;
}

const STEPS: StepConfig[] = [
  { key: 'scenario', label: 'Scenario', description: 'Define your product scenario' },
  { key: 'research', label: 'Research', description: 'Conduct market research' },
  { key: 'personas-problems', label: 'Personas & Problems', description: 'Identify personas and problems' },
  { key: 'journey-map', label: 'Journey Map', description: 'Map user journeys' },
  { key: 'roadmap', label: 'Roadmap', description: 'Create product roadmap' },
  { key: 'sprint-plan', label: 'Sprint Plan', description: 'Plan development sprints' },
  { key: 'uat-bugs', label: 'UAT & Bugs', description: 'User acceptance testing and bug tracking' },
  { key: 'export', label: 'Export', description: 'Export your work' },
];

export function ProductFundamentalsPlaygroundClient() {
  const { state, dispatch } = usePlayground();
  const [currentStep, setCurrentStep] = useState<Step>('scenario');

  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].key);
    }
  };

  const handleStepClick = (step: Step) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    const step = STEPS.find(s => s.key === currentStep);

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{step?.label}</h2>
          {step?.description && (
            <p className="text-gray-600">{step?.description}</p>
          )}
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[400px]">
          <p className="text-gray-500 text-sm mb-4">
            Placeholder content for {step?.label}. This section will contain the actual tool interface.
          </p>
          
          {/* Debug: Show state info */}
          <div className="mt-4 p-3 bg-white border border-gray-300 rounded text-xs text-gray-600">
            <strong>State Debug:</strong> Audit log entries: {state.auditLog.length}
            {state.scenario && ` | Scenario: ${state.scenario.title}`}
            {state.research && ` | Research: ${state.research.sourceType}`}
            {state.personas.length > 0 && ` | Personas: ${state.personas.length}`}
            {state.problems.length > 0 && ` | Problems: ${state.problems.length}`}
            {state.journey.length > 0 && ` | Journey stages: ${state.journey.length}`}
            {state.roadmap.length > 0 && ` | Roadmap items: ${state.roadmap.length}`}
            {state.stories.length > 0 && ` | Stories: ${state.stories.length}`}
            {state.bugs.length > 0 && ` | Bugs: ${state.bugs.length}`}
          </div>
          
          {currentStep === 'scenario' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Define your product scenario here. What problem are you solving? Who is your target audience?
              </p>
              {state.scenario && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Scenario:</h3>
                  <p className="text-sm text-gray-700"><strong>Title:</strong> {state.scenario.title}</p>
                  <p className="text-sm text-gray-700"><strong>Target User:</strong> {state.scenario.targetUser}</p>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'research' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Conduct market research. Analyze competitors, market trends, and user needs.
              </p>
              {state.research && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Research Notes:</h3>
                  <p className="text-sm text-gray-700"><strong>Source Type:</strong> {state.research.sourceType}</p>
                  <p className="text-sm text-gray-700 mt-2">{state.research.rawNotes || 'No notes yet'}</p>
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'personas-problems' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Identify key personas and their problems. Create detailed user personas and problem statements.
              </p>
              {state.personas.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Personas ({state.personas.length}):</h3>
                  {state.personas.map((p) => (
                    <div key={p.id} className="text-sm text-gray-700 mb-2">
                      <strong>{p.name}</strong> ({p.archetype})
                    </div>
                  ))}
                </div>
              )}
              {state.problems.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Problems ({state.problems.length}):</h3>
                  {state.problems.map((p) => (
                    <div key={p.id} className="text-sm text-gray-700 mb-2">
                      <strong>{p.who}</strong> needs {p.need}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'journey-map' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Map user journeys. Visualize how users interact with your product at each stage.
              </p>
              {state.journey.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Journey Stages ({state.journey.length}):</h3>
                  {state.journey.map((j) => (
                    <div key={j.id} className="text-sm text-gray-700 mb-2">
                      <strong>{j.name}</strong>: {j.userGoal}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'roadmap' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Create your product roadmap. Plan features, milestones, and timelines.
              </p>
              {state.roadmap.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Roadmap Items ({state.roadmap.length}):</h3>
                  {state.roadmap.map((r) => (
                    <div key={r.id} className="text-sm text-gray-700 mb-2">
                      <strong>{r.title}</strong> - {r.quadrant} ({r.horizon} term)
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'sprint-plan' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Plan development sprints. Break down work into manageable sprints with clear goals.
              </p>
              {state.sprints.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Sprints ({state.sprints.length}):</h3>
                  {state.sprints.map((s, idx) => (
                    <div key={idx} className="text-sm text-gray-700 mb-2">
                      <strong>Sprint {idx + 1}:</strong> {s.goal} ({s.capacityPoints} points)
                    </div>
                  ))}
                </div>
              )}
              {state.stories.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Stories ({state.stories.length}):</h3>
                  {state.stories.map((s) => (
                    <div key={s.id} className="text-sm text-gray-700 mb-2">
                      <strong>{s.title}</strong> ({s.points} points)
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'uat-bugs' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                User acceptance testing and bug tracking. Document test results and track issues.
              </p>
              {state.uatScenarios.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">UAT Scenarios ({state.uatScenarios.length}):</h3>
                  {state.uatScenarios.map((u) => (
                    <div key={u.id} className="text-sm text-gray-700 mb-2">
                      <strong>{u.title}</strong>
                    </div>
                  ))}
                </div>
              )}
              {state.bugs.length > 0 && (
                <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                  <h3 className="font-semibold text-gray-900 mb-2">Bugs ({state.bugs.length}):</h3>
                  {state.bugs.map((b) => (
                    <div key={b.id} className="text-sm text-gray-700 mb-2">
                      <strong>{b.title}</strong> - {b.severity}
                      {b.decision && ` (${b.decision})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {currentStep === 'export' && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Export your work. Download or share your product fundamentals documentation.
              </p>
              <div className="mt-4 p-4 bg-white border border-gray-300 rounded">
                <h3 className="font-semibold text-gray-900 mb-2">Audit Log ({state.auditLog.length} entries):</h3>
                <div className="max-h-48 overflow-y-auto text-xs text-gray-600 space-y-1">
                  {state.auditLog.slice(-10).map((entry, idx) => (
                    <div key={idx} className="border-b border-gray-200 pb-1">
                      <span className="font-mono text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      {' '}
                      <span className="font-semibold">{entry.step}</span>
                      {' '}
                      <span>{entry.action}</span>
                    </div>
                  ))}
                  {state.auditLog.length > 10 && (
                    <p className="text-gray-500 italic">... and {state.auditLog.length - 10} more entries</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Persistent Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-800 font-medium">
          AI suggests — you decide. All outputs are editable.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Stepper */}
        <div className="lg:w-64 border-r border-gray-200 bg-gray-50 p-6">
          <nav className="space-y-2" aria-label="Steps">
            {STEPS.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              const isAccessible = index <= currentStepIndex;

              return (
                <button
                  key={step.key}
                  onClick={() => isAccessible && handleStepClick(step.key)}
                  disabled={!isAccessible}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-brand-light text-white shadow-sm' 
                      : isCompleted
                      ? 'bg-white border border-gray-300 text-gray-900 hover:bg-gray-50'
                      : 'bg-white border border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                    ${isAccessible && !isActive ? 'hover:bg-gray-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                      ${isActive 
                        ? 'bg-white text-brand-light' 
                        : isCompleted
                        ? 'bg-brand-light text-white'
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {renderStepContent()}
          </div>

          {/* Footer with Next/Back */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentStepIndex === STEPS.length - 1}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
