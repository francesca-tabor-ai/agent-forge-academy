'use client';

import { ActiveContext } from './AIAdvisor';

interface QuickActionsProps {
  activeContext: ActiveContext;
  onAction: (prompt: string) => void;
}

export function QuickActions({ activeContext, onAction }: QuickActionsProps) {
  const learningActions = [
    {
      label: 'Explain this lesson in plain English',
      prompt: activeContext.course
        ? `Explain the current lesson in ${activeContext.course.title} in plain English.`
        : 'Explain this lesson in plain English.',
    },
    {
      label: 'Quiz me on the key concepts',
      prompt: activeContext.course
        ? `Create a quiz on key concepts from ${activeContext.course.title}.`
        : 'Quiz me on the key concepts.',
    },
    {
      label: 'Give me a practice task',
      prompt: activeContext.course
        ? `Give me a practice task related to ${activeContext.course.title}.`
        : 'Give me a practice task.',
    },
  ];

  const projectActions = [
    {
      label: 'Review my architecture',
      prompt: activeContext.project
        ? `Review the architecture for my project: ${activeContext.project.title}.`
        : 'Review my project architecture.',
    },
    {
      label: 'Suggest improvements and risks',
      prompt: activeContext.project
        ? `Suggest improvements and potential risks for my project: ${activeContext.project.title}.`
        : 'Suggest improvements and risks for my project.',
    },
    {
      label: 'Help me write my project description',
      prompt: activeContext.project
        ? `Help me write a compelling project description for: ${activeContext.project.title}.`
        : 'Help me write my project description.',
    },
  ];

  const careerActions = [
    {
      label: 'Tailor my CV for this role',
      prompt: activeContext.job
        ? `Help me tailor my CV for the ${activeContext.job.title} role at ${activeContext.job.company}.`
        : 'Help me tailor my CV for this role.',
    },
    {
      label: 'Write a cover letter for this job',
      prompt: activeContext.job
        ? `Help me write a cover letter for the ${activeContext.job.title} role at ${activeContext.job.company}.`
        : 'Help me write a cover letter for this job.',
    },
    {
      label: 'Mock interview questions',
      prompt: activeContext.job
        ? `Give me mock interview questions for the ${activeContext.job.title} role at ${activeContext.job.company}.`
        : 'Give me mock interview questions for this role.',
    },
  ];

  // Show actions based on context
  const showLearning = activeContext.course;
  const showProject = activeContext.project;
  const showCareer = activeContext.job;

  // If no context, show general actions
  if (!showLearning && !showProject && !showCareer) {
    return (
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">Quick Actions:</p>
        <div className="flex flex-wrap gap-2">
          {learningActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action.prompt)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {action.label}
            </button>
          ))}
          {projectActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action.prompt)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {action.label}
            </button>
          ))}
          {careerActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onAction(action.prompt)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showLearning && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Learning:</p>
          <div className="flex flex-wrap gap-2">
            {learningActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showProject && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Projects:</p>
          <div className="flex flex-wrap gap-2">
            {projectActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCareer && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Career:</p>
          <div className="flex flex-wrap gap-2">
            {careerActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction(action.prompt)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
