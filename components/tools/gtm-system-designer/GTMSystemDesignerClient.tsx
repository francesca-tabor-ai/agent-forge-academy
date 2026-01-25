'use client';

import { useState } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import { SystemArchitectureView } from './SystemArchitectureView';
import { RecommendationsPanel } from './RecommendationsPanel';
import { ToolStackBuilder } from './ToolStackBuilder';
import { IntegrationMapper } from './IntegrationMapper';

interface GTMSystemDesignerClientProps {
  toolId: string;
  studentProfileId: string;
}

type Step = 'context' | 'tools' | 'integrations' | 'friction' | 'results';

interface BusinessContext {
  targetAudience: string;
  budget: string;
  timeline: string;
  companyStage: string;
  teamSize: string;
}

interface ToolCategory {
  category: string;
  tools: string[];
}

interface Integration {
  from: string;
  to: string;
  type: string;
}

interface SystemDesign {
  systemMap: {
    nodes: Array<{
      id: string;
      label: string;
      category: string;
      description: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: string;
      description: string;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
  architecture: {
    overview: string;
    components: Array<{
      name: string;
      description: string;
      technologies: string[];
    }>;
    dataFlow: string;
    aiOpportunities: string[];
  };
  nextSteps: string[];
}

export function GTMSystemDesignerClient({
  toolId,
  studentProfileId,
}: GTMSystemDesignerClientProps) {
  const [currentStep, setCurrentStep] = useState<Step>('context');
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessContext, setBusinessContext] = useState<BusinessContext>({
    targetAudience: '',
    budget: '',
    timeline: '',
    companyStage: '',
    teamSize: '',
  });
  const [toolStack, setToolStack] = useState<ToolCategory[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [frictionPoints, setFrictionPoints] = useState<string[]>(['']);
  const [systemDesign, setSystemDesign] = useState<SystemDesign | null>(null);

  const handleContextSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setBusinessContext({
      targetAudience: formData.get('targetAudience') as string,
      budget: formData.get('budget') as string,
      timeline: formData.get('timeline') as string,
      companyStage: formData.get('companyStage') as string,
      teamSize: formData.get('teamSize') as string,
    });
    setCurrentStep('tools');
  };

  const handleToolsNext = () => {
    setCurrentStep('integrations');
  };

  const handleIntegrationsNext = () => {
    setCurrentStep('friction');
  };

  const handleFrictionChange = (index: number, value: string) => {
    const updated = [...frictionPoints];
    updated[index] = value;
    setFrictionPoints(updated);
  };

  const addFrictionPoint = () => {
    setFrictionPoints([...frictionPoints, '']);
  };

  const removeFrictionPoint = (index: number) => {
    if (frictionPoints.length > 1) {
      setFrictionPoints(frictionPoints.filter((_, i) => i !== index));
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/tools/gtm-system-designer/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessContext,
          toolStack: toolStack.filter((cat) => cat.tools.length > 0),
          integrations: integrations.filter((int) => int.from && int.to),
          frictionPoints: frictionPoints.filter((fp) => fp.trim() !== ''),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate system design');
      }

      const { design } = await response.json();
      setSystemDesign(design);

      // Log the tool run
      await logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          businessContext,
          toolStack,
          integrations,
          frictionPoints,
        },
        outputs: {
          systemMap: design.systemMap,
          recommendations: design.recommendations,
          architecture: design.architecture,
          nextSteps: design.nextSteps,
        },
      });

      setCurrentStep('results');
    } catch (error) {
      console.error('Error generating system design:', error);
      alert('Failed to generate system design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetDesign = () => {
    setCurrentStep('context');
    setSystemDesign(null);
    setBusinessContext({
      targetAudience: '',
      budget: '',
      timeline: '',
      companyStage: '',
      teamSize: '',
    });
    setToolStack([]);
    setIntegrations([]);
    setFrictionPoints(['']);
  };

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          {(['context', 'tools', 'integrations', 'friction', 'results'] as Step[]).map(
            (step, index) => {
              const stepLabels: Record<Step, string> = {
                context: 'Business Context',
                tools: 'Tool Stack',
                integrations: 'Integrations',
                friction: 'Friction Points',
                results: 'Results',
              };
              const stepIndex = ['context', 'tools', 'integrations', 'friction', 'results'].indexOf(step);
              const isActive = currentStep === step;
              const isCompleted = stepIndex < ['context', 'tools', 'integrations', 'friction', 'results'].indexOf(currentStep);

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? 'bg-brand-light text-white'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        isActive ? 'text-brand-light font-medium' : 'text-gray-500'
                      }`}
                    >
                      {stepLabels[step]}
                    </span>
                  </div>
                  {index < 4 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'context' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Business Context
          </h2>
          <p className="text-gray-600 mb-6">
            Tell us about your business to help us design the right GTM system for you.
          </p>
          <form onSubmit={handleContextSubmit} className="space-y-4">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                placeholder="e.g., B2B SaaS companies with 50-500 employees"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Budget
                </label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  placeholder="e.g., $50,000/year"
                />
              </div>

              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  placeholder="e.g., 6 months"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyStage" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Stage
                </label>
                <select
                  id="companyStage"
                  name="companyStage"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="">Select stage</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                  <option value="series-b">Series B+</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size
                </label>
                <select
                  id="teamSize"
                  name="teamSize"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                >
                  <option value="">Select size</option>
                  <option value="1-5">1-5 people</option>
                  <option value="6-20">6-20 people</option>
                  <option value="21-50">21-50 people</option>
                  <option value="51-200">51-200 people</option>
                  <option value="200+">200+ people</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
            >
              Next: Tool Stack
            </button>
          </form>
        </div>
      )}

      {currentStep === 'tools' && (
        <ToolStackBuilder
          toolStack={toolStack}
          onUpdate={setToolStack}
          onNext={handleToolsNext}
          onBack={() => setCurrentStep('context')}
        />
      )}

      {currentStep === 'integrations' && (
        <IntegrationMapper
          integrations={integrations}
          onUpdate={setIntegrations}
          onNext={handleIntegrationsNext}
          onBack={() => setCurrentStep('tools')}
        />
      )}

      {currentStep === 'friction' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Friction Points
          </h2>
          <p className="text-gray-600 mb-6">
            Identify manual workflows or pain points in your current GTM process.
          </p>

          <div className="space-y-4">
            {frictionPoints.map((point, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleFrictionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
                  placeholder="e.g., Manual lead enrichment takes 2 hours per day"
                />
                {frictionPoints.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFrictionPoint(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFrictionPoint}
              className="text-sm text-brand-light hover:text-brand-light/80 font-medium"
            >
              + Add another friction point
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setCurrentStep('integrations')}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate System Design'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'results' && systemDesign && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your GTM System Design</h2>
            <button
              onClick={resetDesign}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Create New Design
            </button>
          </div>

          <SystemArchitectureView design={systemDesign} />
          <RecommendationsPanel recommendations={systemDesign.recommendations} />
        </div>
      )}
    </div>
  );
}
