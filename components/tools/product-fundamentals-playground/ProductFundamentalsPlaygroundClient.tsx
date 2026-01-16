'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlayground } from '@/lib/tools/product-fundamentals-playground/usePlayground';
import { usePersistence } from '@/lib/tools/product-fundamentals-playground/usePersistence';
import { ScenarioStep } from './steps/ScenarioStep';
import { ResearchStep } from './steps/ResearchStep';
import { PersonasProblemsStep } from './steps/PersonasProblemsStep';
import { JourneyMapStep } from './steps/JourneyMapStep';
import { RoadmapStep } from './steps/RoadmapStep';
import { SprintPlanStep } from './steps/SprintPlanStep';
import { UATBugsStep } from './steps/UATBugsStep';
import { ExportStep } from './steps/ExportStep';

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
  const [caseId, setCaseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [caseTitle, setCaseTitle] = useState('Untitled Case');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize case from URL or create new
  useEffect(() => {
    const urlCaseId = searchParams.get('caseId');
    if (urlCaseId) {
      setCaseId(urlCaseId);
      loadCase(urlCaseId);
    } else {
      createNewCase();
    }
  }, [searchParams]);

  const createNewCase = async () => {
    try {
      const response = await fetch('/api/tools/product-fundamentals/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Untitled Case',
          state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      const data = await response.json();
      setCaseId(data.case.id);
      setCaseTitle(data.case.title);
      router.replace(`?caseId=${data.case.id}`, { scroll: false });
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating case:', err);
      setIsLoading(false);
      // Gracefully fallback - continue without persistence
    }
  };

  const loadCase = async (id: string) => {
    try {
      const response = await fetch(`/api/tools/product-fundamentals/cases/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Case doesn't exist, create new
          createNewCase();
          return;
        }
        throw new Error('Failed to load case');
      }

      const data = await response.json();
      if (data.case?.state) {
        // Load state into reducer
        dispatch({ type: 'LOAD_STATE', payload: data.case.state });
      }
      setCaseTitle(data.case.title || 'Untitled Case');
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading case:', err);
      setIsLoading(false);
      // Gracefully fallback - continue with empty state
    }
  };

  // Persistence hook
  const { isSaving, lastSaved, error: persistenceError } = usePersistence({
    caseId,
    state,
    enabled: !!caseId,
  });

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
          {currentStep === 'scenario' && (
            <ScenarioStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'research' && (
            <ResearchStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'personas-problems' && (
            <PersonasProblemsStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'journey-map' && (
            <JourneyMapStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'roadmap' && (
            <RoadmapStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'sprint-plan' && (
            <SprintPlanStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'uat-bugs' && (
            <UATBugsStep state={state} dispatch={dispatch} />
          )}
          
          {currentStep === 'export' && (
            <ExportStep state={state} />
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="text-gray-600">Loading case...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Persistent Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-blue-800 font-medium">
            AI suggests — you decide. All outputs are editable.
          </p>
          <div className="flex items-center gap-4 text-xs text-blue-700">
            {isSaving && (
              <span className="flex items-center gap-1">
                <span className="animate-spin">⏳</span>
                Saving...
              </span>
            )}
            {lastSaved && !isSaving && (
              <span className="text-green-700">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {persistenceError && (
              <span className="text-red-700">
                ⚠️ {persistenceError}
              </span>
            )}
            {!navigator.onLine && (
              <span className="text-orange-700">
                ⚠️ Offline - changes will save when online
              </span>
            )}
          </div>
        </div>
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
