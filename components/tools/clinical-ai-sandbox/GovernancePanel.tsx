'use client';

import { useState } from 'react';
import { useClinicalSandbox } from '@/lib/tools/clinical-ai-sandbox/useClinicalSandbox';
import type { AuditLogEntry } from '@/lib/tools/clinical-ai-sandbox/types';

/**
 * Governance Panel Component
 * 
 * DPIA-style risk summary and audit log viewer for clinical AI governance.
 */
export function GovernancePanel() {
  const { auditLog } = useClinicalSandbox();
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEntry(null);
  };

  const handleExportAuditLog = () => {
    const dataStr = JSON.stringify(auditLog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clinical-ai-sandbox-audit-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Governance Panel</h2>
        <p className="mt-2 text-gray-600">
          Understand regulatory requirements, compliance frameworks, and governance models for clinical AI. Explore audit trails, documentation standards, and risk management protocols.
        </p>
      </div>

      {/* DPIA-Style Risk Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Data Protection Impact Assessment (DPIA) Summary</h3>
        <p className="text-sm text-gray-600 mb-4 italic">
          This is a demonstration tool for educational purposes. This does not constitute a formal DPIA or regulatory approval.
        </p>

        <div className="space-y-6">
          {/* Purpose */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Purpose</h4>
            <p className="text-sm text-gray-700">
              The Clinical AI Sandbox is an educational demonstration tool designed to help users understand how AI systems can be designed with appropriate boundaries, safety measures, and governance in clinical settings. It demonstrates principles of responsible AI development, boundary enforcement, and audit logging.
            </p>
          </section>

          {/* Scope Limits */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Scope Limits</h4>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>This is a demonstration tool only - not intended for actual clinical use</li>
              <li>All responses are generated from a limited, curated document set</li>
              <li>System operates in a controlled, simulated environment</li>
              <li>No integration with real patient data systems or electronic health records</li>
              <li>All interactions are logged for educational and demonstration purposes</li>
            </ul>
          </section>

          {/* Data Handling */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Data Handling</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">No Patient Data</p>
              <p className="text-sm text-blue-800">
                This system does not process, store, or handle any real patient data. All interactions use simulated prompts and responses. The document set contains only general educational information, not patient-specific data. All audit logs contain only demonstration queries and system responses.
              </p>
            </div>
          </section>

          {/* Known Risks */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Known Risks</h4>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li><strong>Limited Knowledge Base:</strong> Responses are constrained to a small curated document set, which may not cover all medical topics</li>
              <li><strong>Deterministic Boundaries:</strong> Boundary rules are explicit but may not cover all edge cases</li>
              <li><strong>Educational Context:</strong> This is a demonstration tool and should not be used for actual medical decision-making</li>
              <li><strong>No Real-Time Updates:</strong> Document set is static and does not reflect real-time medical knowledge updates</li>
            </ul>
          </section>

          {/* Mitigations */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Mitigations</h4>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li><strong>Conservative Defaults:</strong> System defaults to blocking when uncertain</li>
              <li><strong>Confidence Thresholds:</strong> RAG responses only provided when confidence exceeds threshold</li>
              <li><strong>Explicit Boundaries:</strong> All boundary rules are inspectable and deterministic</li>
              <li><strong>Comprehensive Logging:</strong> All interactions are logged with full context</li>
              <li><strong>Human Escalation:</strong> System directs users to healthcare professionals for medical decisions</li>
              <li><strong>No Hallucinations:</strong> Responses only use retrieved excerpts, no generated content</li>
            </ul>
          </section>

          {/* Human Oversight */}
          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Human Oversight</h4>
            <p className="text-sm text-gray-700 mb-2">
              This system is designed to demonstrate principles of human oversight in clinical AI:
            </p>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
              <li>All medical decisions require human healthcare professional evaluation</li>
              <li>System explicitly refuses to provide diagnoses, treatment recommendations, or dosing</li>
              <li>High-risk scenarios trigger immediate escalation to human professionals</li>
              <li>Audit logs enable review of all system decisions and responses</li>
              <li>Boundary violations are logged and can be reviewed by governance teams</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Accountability Boundaries */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Accountability Boundaries</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* What System Does */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">What the System Does</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Provides general health information from curated documents</li>
              <li>• Retrieves relevant educational content with citations</li>
              <li>• Enforces explicit boundary rules deterministically</li>
              <li>• Logs all interactions for audit and review</li>
              <li>• Escalates high-risk queries to human professionals</li>
              <li>• Provides safe, supportive responses for symptom anxiety</li>
            </ul>
          </div>

          {/* What Humans Must Do */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">What Humans Must Do</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Make all medical diagnoses and treatment decisions</li>
              <li>• Provide medication dosing instructions</li>
              <li>• Evaluate emergency and high-risk situations</li>
              <li>• Handle crisis situations (self-harm, suicidal ideation)</li>
              <li>• Review audit logs for compliance and quality</li>
              <li>• Update and maintain boundary rules and document sets</li>
            </ul>
          </div>

          {/* What It Refuses */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-3">What It Refuses</h4>
            <ul className="text-sm text-red-800 space-y-2">
              <li>• Diagnose medical conditions</li>
              <li>• Recommend treatments or medications</li>
              <li>• Provide dosing instructions</li>
              <li>• Make medical decisions</li>
              <li>• Answer queries below confidence threshold</li>
              <li>• Generate content not in retrieved documents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Audit Log Viewer */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Audit Log</h3>
          <button
            onClick={handleExportAuditLog}
            disabled={auditLog.length === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Export Audit Log JSON
          </button>
        </div>

        {auditLog.length === 0 ? (
          <p className="text-gray-500 italic text-sm">No audit log entries yet. Run some prompts in other modules to generate entries.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Input Summary
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Decision
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escalation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLog.map((entry, index) => (
                  <tr
                    key={index}
                    onClick={() => handleRowClick(entry)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {entry.module}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {truncateText(entry.input, 60)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.decision.includes('blocked') || entry.decision.includes('refusal')
                          ? 'bg-red-100 text-red-700'
                          : entry.decision.includes('conditional')
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {entry.decision}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {entry.escalation || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Drawer */}
      {isDrawerOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Audit Log Entry Details</h3>
              <button
                onClick={handleCloseDrawer}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="font-medium text-gray-700">Timestamp:</span>
                <p className="text-gray-900">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Module:</span>
                <p className="text-gray-900">{selectedEntry.module}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Input:</span>
                <p className="text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">{selectedEntry.input}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Decision:</span>
                <p className="text-gray-900">{selectedEntry.decision}</p>
              </div>
              {selectedEntry.escalation && (
                <div>
                  <span className="font-medium text-gray-700">Escalation:</span>
                  <p className="text-gray-900 capitalize">{selectedEntry.escalation}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Reasons:</span>
                <ul className="list-disc list-inside text-gray-900 mt-2 space-y-1">
                  {selectedEntry.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
              {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Metadata:</span>
                  <pre className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-900 overflow-x-auto">
                    {JSON.stringify(selectedEntry.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
