'use client';

import {
  CLINICAL_AI_SANDBOX_MODULES,
  getModuleById,
  ClinicalSandboxProvider,
  useClinicalSandbox,
} from '@/lib/tools/clinical-ai-sandbox';
import { AgentBoundaryExplorer } from '@/components/tools/clinical-ai-sandbox/AgentBoundaryExplorer';
import { RAGConsole } from '@/components/tools/clinical-ai-sandbox/RAGConsole';
import { FailureModeViewer } from '@/components/tools/clinical-ai-sandbox/FailureModeViewer';
import { GovernancePanel } from '@/components/tools/clinical-ai-sandbox/GovernancePanel';

function ClinicalAISandboxContent() {
  const { activeModule, setActiveModule } = useClinicalSandbox();
  const currentModule = getModuleById(activeModule);

  if (!currentModule) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clinical AI Sandbox</h1>
      </div>

      {/* Persistent Disclaimer Banner */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">
              Demo only. Not medical advice. No diagnosis/treatment/dosing.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6">
        {/* Left Sidebar Navigation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <nav className="space-y-2">
            {CLINICAL_AI_SANDBOX_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeModule === module.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {module.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Content Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {activeModule === 'agent-boundary-explorer' ? (
            <AgentBoundaryExplorer />
          ) : activeModule === 'rag-console' ? (
            <RAGConsole />
          ) : activeModule === 'failure-mode-viewer' ? (
            <FailureModeViewer />
          ) : activeModule === 'governance-panel' ? (
            <GovernancePanel />
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {currentModule.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {currentModule.description}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClinicalAISandboxClient() {
  return (
    <ClinicalSandboxProvider>
      <ClinicalAISandboxContent />
    </ClinicalSandboxProvider>
  );
}
