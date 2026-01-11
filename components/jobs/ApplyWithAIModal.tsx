'use client';

import { useState } from 'react';
import Link from 'next/link';

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  matchingScore: number;
  status?: 'new' | 'unlocked' | 'recommended' | 'locked' | 'stretch';
  skills: string[];
}

interface ApplyWithAIModalProps {
  job: JobOpportunity | null;
  studentProfileId: string | null;
  onClose: () => void;
}

type Step = 'job-select' | 'cv' | 'cover-letter' | 'portfolio' | 'review';

export function ApplyWithAIModal({
  job,
  studentProfileId,
  onClose,
}: ApplyWithAIModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>(job ? 'cv' : 'job-select');
  const [selectedJob, setSelectedJob] = useState<JobOpportunity | null>(job);
  const [cvOption, setCvOption] = useState<'uploaded' | 'generate'>('generate');
  const [cvContent, setCvContent] = useState('');
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const steps: Array<{ key: Step; label: string }> = [
    { key: 'cv', label: 'CV' },
    { key: 'cover-letter', label: 'Cover Letter' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'review', label: 'Review & Export' },
  ];

  const currentStepIndex = job
    ? steps.findIndex(s => s.key === currentStep)
    : -1;

  const handleNext = () => {
    if (!job && currentStep === 'job-select' && selectedJob) {
      setCurrentStep('cv');
      return;
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    } else if (currentStep === 'cv' && !job) {
      setCurrentStep('job-select');
    }
  };

  const handleGenerateCV = async () => {
    // TODO: Implement CV generation API call
    setCvContent('Generated CV content will appear here...');
  };

  const handleGenerateCoverLetter = async () => {
    // TODO: Implement cover letter generation API call
    setCoverLetterContent('Generated cover letter content will appear here...');
  };

  const handleExport = (format: 'pdf' | 'docx' | 'clipboard') => {
    // TODO: Implement export functionality
    alert(`Exporting as ${format.toUpperCase()}...`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Apply with AI
              {selectedJob && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {selectedJob.title} at {selectedJob.company}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Step Indicator */}
          {job && (
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      idx <= currentStepIndex
                        ? 'bg-brand-light text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      idx <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && (
                    <span className="text-gray-400 mx-2">→</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 0: Job Selection (if no job provided) */}
          {currentStep === 'job-select' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a job to create an application pack, or create a general pack.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select Job
                </label>
                <select
                  value={selectedJob?.id || ''}
                  onChange={(e) => {
                    // TODO: Fetch job from API
                    if (e.target.value) {
                      // Mock job selection
                      setSelectedJob({
                        id: e.target.value,
                        title: 'Selected Job',
                        company: 'Company',
                        matchingScore: 75,
                        skills: [],
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                >
                  <option value="">-- Select a job --</option>
                  <option value="general">Create general application pack</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 1: CV */}
          {currentStep === 'cv' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 1: CV</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose CV Option
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="uploaded"
                        checked={cvOption === 'uploaded'}
                        onChange={(e) => setCvOption(e.target.value as 'uploaded' | 'generate')}
                        className="text-brand-light"
                      />
                      <span className="text-sm text-gray-700">Use uploaded CV</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="generate"
                        checked={cvOption === 'generate'}
                        onChange={(e) => setCvOption(e.target.value as 'uploaded' | 'generate')}
                        className="text-brand-light"
                      />
                      <span className="text-sm text-gray-700">Generate tailored CV</span>
                    </label>
                  </div>
                </div>

                {cvOption === 'generate' && (
                  <div>
                    <button
                      onClick={handleGenerateCV}
                      className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium mb-4"
                    >
                      Generate CV
                    </button>
                  </div>
                )}

                {cvContent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CV Preview (Editable)
                    </label>
                    <textarea
                      value={cvContent}
                      onChange={(e) => setCvContent(e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter */}
          {currentStep === 'cover-letter' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 2: Cover Letter</h3>
              <div className="space-y-4">
                <button
                  onClick={handleGenerateCoverLetter}
                  className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                >
                  Generate Tailored Cover Letter
                </button>

                {coverLetterContent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter Preview (Editable)
                    </label>
                    <textarea
                      value={coverLetterContent}
                      onChange={(e) => setCoverLetterContent(e.target.value)}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Portfolio */}
          {currentStep === 'portfolio' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 3: Tailor Portfolio</h3>
              <p className="text-sm text-gray-600">
                Select 1-3 projects to highlight (AI suggests defaults)
              </p>
              <div className="space-y-2">
                {/* TODO: Fetch actual projects from API */}
                {['Project 1', 'Project 2', 'Project 3'].map((project, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProjects([...selectedProjects, project]);
                        } else {
                          setSelectedProjects(selectedProjects.filter(p => p !== project));
                        }
                      }}
                      className="text-brand-light"
                    />
                    <span className="text-sm text-gray-700">{project}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  Preview: You can preview the tailored view vs default view before exporting.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review & Export */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Step 4: Review & Export</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Application Pack Summary</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ CV: {cvOption === 'generate' ? 'Generated' : 'Uploaded'}</li>
                    <li>✓ Cover Letter: {coverLetterContent ? 'Generated' : 'Not generated'}</li>
                    <li>✓ Portfolio Projects: {selectedProjects.length} selected</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleExport('pdf')}
                      className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Export as DOCX
                    </button>
                    <button
                      onClick={() => handleExport('clipboard')}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 'job-select' || !!(job && currentStepIndex === 0)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          {currentStep !== 'review' && (
            <button
              onClick={handleNext}
              disabled={!job && currentStep === 'job-select' && !selectedJob}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
