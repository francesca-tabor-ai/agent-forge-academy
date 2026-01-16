'use client';

import {
  CLINICAL_AI_SANDBOX_MODULES,
  getModuleById,
  ClinicalSandboxProvider,
  useClinicalSandbox,
} from '@/lib/tools/clinical-ai-sandbox';
import { getModeCopy } from '@/lib/tools/clinical-ai-sandbox/modeCopy';
import { AgentBoundaryExplorer } from '@/components/tools/clinical-ai-sandbox/AgentBoundaryExplorer';
import { RAGConsole } from '@/components/tools/clinical-ai-sandbox/RAGConsole';
import { FailureModeViewer } from '@/components/tools/clinical-ai-sandbox/FailureModeViewer';
import { GovernancePanel } from '@/components/tools/clinical-ai-sandbox/GovernancePanel';
import { VoiceInteractionDemo } from '@/components/tools/clinical-ai-sandbox/VoiceInteractionDemo';

function ClinicalAISandboxContent() {
  const { activeModule, setActiveModule, viewingMode, setViewingMode } = useClinicalSandbox();
  const currentModule = getModuleById(activeModule);
  const modeCopy = getModeCopy(viewingMode);

  if (!currentModule) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{modeCopy.header.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{modeCopy.header.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Viewing Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewingMode('regulator')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewingMode === 'regulator'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Regulator Mode
            </button>
            <button
              onClick={() => setViewingMode('hiring-panel')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewingMode === 'hiring-panel'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hiring Panel Mode
            </button>
          </div>
        </div>
      </div>

      {/* Mode Emphasis Indicators */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">{modeCopy.emphasis.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-blue-800">{modeCopy.emphasis.secondary}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
            <span className="text-sm text-blue-700">{modeCopy.emphasis.tertiary}</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-blue-800">{modeCopy.description}</p>
      </div>

      {/* Shareable Demo Link Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            <span className="text-sm font-medium text-green-900">Shareable Demo Link</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // Could show a toast notification here
            }}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Copy Link
          </button>
        </div>
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
          ) : activeModule === 'voice-interaction-demo' ? (
            <VoiceInteractionDemo />
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
