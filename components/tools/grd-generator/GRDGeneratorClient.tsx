'use client';

import { useState, useReducer, useCallback } from 'react';
import { AlertCircle, CheckCircle, XCircle, Upload, FileText, Users, Shield, Lock, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import { grdReducer, initialState } from '@/lib/tools/grd-generator/state';
import { SignalExtractor } from '@/lib/tools/grd-generator/signalExtractor';
import { AIRiskClassifier } from '@/lib/tools/grd-generator/riskClassifier';
import { GRDGenerator } from '@/lib/tools/grd-generator/grdGenerator';
import { GapDetector } from '@/lib/tools/grd-generator/gapDetector';
import { SOPGenerator } from '@/lib/tools/grd-generator/sopGenerator';
import type { GRDGeneratorState, PRDInput, GRD, Gap } from '@/lib/tools/grd-generator/types';
import type { SOP } from '@/lib/tools/grd-generator/sopGenerator';

interface GRDGeneratorClientProps {
  toolId: string;
  studentProfileId: string;
}

export function GRDGeneratorClient({ 
  toolId, 
  studentProfileId 
}: GRDGeneratorClientProps) {
  const [state, dispatch] = useReducer(grdReducer, initialState);
  const [prdText, setPrdText] = useState('');
  const [prdReference, setPrdReference] = useState('PRD-2024-001');
  const [fileName, setFileName] = useState('');
  const [expandedSOP, setExpandedSOP] = useState<Record<string, boolean>>({});
  const [sops, setSOPs] = useState<Record<string, SOP> | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    // Handle PDF files
    if (file.type === 'application/pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple PDF text extraction - looks for text content between stream markers
        const decoder = new TextDecoder('utf-8');
        let text = decoder.decode(uint8Array);
        
        // Extract text from PDF structure (basic extraction)
        text = text.replace(/\/[A-Za-z]+\s*\[.*?\]/g, '');
        text = text.replace(/<<.*?>>/g, '');
        text = text.replace(/stream[\s\S]*?endstream/g, '');
        text = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
        text = text.replace(/\s+/g, ' ');
        text = text.trim();
        
        setPrdText(text);
      } catch (error) {
        alert('Error reading PDF. Please try copying and pasting the text instead.');
        console.error('PDF read error:', error);
      }
      return;
    }

    // Handle text files
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setPrdText(result);
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  }, []);

  const toggleSOP = useCallback((section: string) => {
    setExpandedSOP(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const handleGenerateGRD = useCallback(async () => {
    if (!prdText.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please provide PRD text' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Step 1: Extract signals
      const extractor = new SignalExtractor();
      const signals = await extractor.extractSignals(prdText);
      dispatch({ type: 'SET_SIGNALS', payload: signals });

      // Step 2: Classify AI risk
      const classifier = new AIRiskClassifier();
      const classification = classifier.classify(signals);
      dispatch({ type: 'SET_CLASSIFICATION', payload: classification });

      // Step 3: Generate GRD
      const generator = new GRDGenerator();
      const grd = generator.generate(prdReference, prdText, signals, classification);

      // Step 4: Detect gaps
      const gapDetector = new GapDetector();
      const gaps = gapDetector.detectGaps(grd, signals);
      grd.gaps = gaps;

      // Step 5: Generate SOPs
      const sopGenerator = new SOPGenerator();
      const generatedSOPs = sopGenerator.generateSOPs(signals, classification);
      setSOPs(generatedSOPs);

      dispatch({ type: 'SET_GRD', payload: grd });

      // Log tool run
      await logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          prdReference,
          prdTextLength: prdText.length,
        },
        outputs: {
          grdId: grd.prdReference,
          aiClass: grd.classification.aiClass,
          riskLevel: grd.classification.riskLevel,
          gapsCount: gaps.length,
        },
      });
    } catch (error) {
      console.error('GRD generation failed:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to generate GRD' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [prdText, prdReference, toolId, studentProfileId]);

  const handleExport = useCallback((format: 'json' | 'markdown') => {
    if (!state.grd) return;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(state.grd, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GRD-${state.grd.prdReference}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const markdown = generateMarkdown(state.grd);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GRD-${state.grd.prdReference}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [state.grd]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setPrdText('');
    setFileName('');
    setExpandedSOP({});
    setSOPs(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{state.error}</p>
        </div>
      )}

        {/* Step Indicator */}
        {state.grd && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              {[
                { key: 'upload', label: 'Upload PRD' },
                { key: 'review', label: 'Review GRD' },
                { key: 'gaps', label: 'Resolve Gaps' },
                { key: 'export', label: 'Export' },
              ].map((step, idx) => (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        state.currentStep === step.key
                          ? 'bg-brand-light text-white'
                          : idx < getStepIndex(state.currentStep)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {idx < getStepIndex(state.currentStep) ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs mt-2 text-gray-600">{step.label}</span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        idx < getStepIndex(state.currentStep) ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Step */}
        {!state.grd && (
          <UploadStep
            prdText={prdText}
            setPrdText={setPrdText}
            prdReference={prdReference}
            setPrdReference={setPrdReference}
            fileName={fileName}
            onFileUpload={handleFileUpload}
            onGenerate={handleGenerateGRD}
            isLoading={state.isLoading}
          />
        )}

        {/* Review Step */}
        {state.currentStep === 'review' && state.grd && (
          <ReviewStep
            grd={state.grd}
            sops={sops}
            expandedSOP={expandedSOP}
            onToggleSOP={toggleSOP}
            onNext={() => dispatch({ type: 'SET_STEP', payload: 'gaps' })}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 'upload' })}
          />
        )}

        {/* Gaps Step */}
        {state.currentStep === 'gaps' && state.grd && (
          <GapsStep
            grd={state.grd}
            onNext={() => dispatch({ type: 'SET_STEP', payload: 'export' })}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 'review' })}
          />
        )}

        {/* Export Step */}
        {state.currentStep === 'export' && state.grd && (
          <ExportStep
            grd={state.grd}
            onExport={handleExport}
            onBack={() => dispatch({ type: 'SET_STEP', payload: 'gaps' })}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

function getStepIndex(step: string): number {
  const steps = ['upload', 'review', 'gaps', 'export'];
  return steps.indexOf(step);
}

function UploadStep({
  prdText,
  setPrdText,
  prdReference,
  setPrdReference,
  fileName,
  onFileUpload,
  onGenerate,
  isLoading,
}: {
  prdText: string;
  setPrdText: (text: string) => void;
  prdReference: string;
  setPrdReference: (ref: string) => void;
  fileName: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-brand-light" size={24} />
        <h2 className="text-2xl font-semibold text-gray-900">Upload or Paste PRD</h2>
      </div>
      
      <div className="mb-6">
        <label 
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-light hover:bg-brand-light/5 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="text-gray-400 mb-2" size={32} />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PDF, TXT, MD, or any text file</p>
            {fileName && (
              <p className="text-sm text-brand-light font-semibold mt-2">
                ✓ {fileName}
              </p>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".txt,.md,.doc,.docx,.pdf,application/pdf,text/*"
            onChange={onFileUpload}
          />
        </label>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">OR</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <div className="mb-4">
        <label htmlFor="prd-reference" className="block text-sm font-medium text-gray-700 mb-2">
          PRD Reference ID
        </label>
        <input
          type="text"
          id="prd-reference"
          value={prdReference}
          onChange={(e) => setPrdReference(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-brand-light"
          placeholder="PRD-2024-001"
        />
      </div>
      
      <textarea
        value={prdText}
        onChange={(e) => setPrdText(e.target.value)}
        placeholder="Paste your PRD here...&#10;&#10;Include details about:&#10;• User type (internal/customer/regulator)&#10;• Decision impact (recommend/approve/advise)&#10;• Domain (finance/healthcare/employment)&#10;• Regions/markets&#10;• Data handling&#10;• Failure modes"
        className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-light focus:border-transparent resize-none font-mono text-sm"
      />
      
      <button
        onClick={onGenerate}
        disabled={!prdText.trim() || isLoading}
        className="mt-6 w-full bg-brand-light hover:bg-brand-light/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Analyzing PRD & Generating GRD with SOPs...
          </>
        ) : (
          <>
            <Shield size={20} />
            Generate GRD
          </>
        )}
      </button>
    </div>
  );
}

function ReviewStep({
  grd,
  sops,
  expandedSOP,
  onToggleSOP,
  onNext,
  onBack,
}: {
  grd: GRD;
  sops: Record<string, SOP> | null;
  expandedSOP: Record<string, boolean>;
  onToggleSOP: (section: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Classification */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lock className="text-red-600" size={24} />
            <h2 className="text-2xl font-semibold text-gray-900">AI Classification</h2>
          </div>
          <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
            🔒 Frozen
          </span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="font-semibold text-lg text-gray-900 mb-2">
            Class {grd.classification.aiClass} – {grd.classification.riskLevel}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Rationale:</strong> {grd.classification.rationale}
          </div>
          <div className="mt-3">
            <strong className="text-sm text-gray-700">Regulatory Triggers:</strong>
            <ul className="mt-1 space-y-1 ml-4 text-sm text-gray-600">
              {grd.classification.regulatoryTriggers.map((trigger, i) => (
                <li key={i}>• {trigger}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Standard Operating Procedures */}
      {sops && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Standard Operating Procedures</h2>
          <p className="text-gray-600 mb-6">Detailed implementation guides for each governance requirement</p>
          
          <div className="space-y-4">
            <SOPSection 
              title="Lineage & Traceability SOP" 
              sop={sops.lineage} 
              section="lineage"
              expanded={expandedSOP.lineage}
              onToggle={() => onToggleSOP('lineage')}
            />
            <SOPSection 
              title="Evaluation SOP" 
              sop={sops.evaluation} 
              section="evaluation"
              expanded={expandedSOP.evaluation}
              onToggle={() => onToggleSOP('evaluation')}
            />
            <SOPSection 
              title="Guardrails SOP" 
              sop={sops.guardrails} 
              section="guardrails"
              expanded={expandedSOP.guardrails}
              onToggle={() => onToggleSOP('guardrails')}
            />
            <SOPSection 
              title="Release Controls SOP" 
              sop={sops.release} 
              section="release"
              expanded={expandedSOP.release}
              onToggle={() => onToggleSOP('release')}
            />
            <SOPSection 
              title="Ownership & Accountability SOP" 
              sop={sops.ownership} 
              section="ownership"
              expanded={expandedSOP.ownership}
              onToggle={() => onToggleSOP('ownership')}
            />
            <SOPSection 
              title="Regulatory Compliance SOP" 
              sop={sops.regulatory} 
              section="regulatory"
              expanded={expandedSOP.regulatory}
              onToggle={() => onToggleSOP('regulatory')}
            />
          </div>
        </div>
      )}

      {/* Governance Requirements Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RequirementCard
          title="Lineage & Traceability"
          requirements={grd.lineageRequirements}
        />
        <RequirementCard
          title="Evaluation"
          requirements={grd.evaluationRequirements}
        />
        <RequirementCard
          title="Guardrails"
          requirements={grd.guardrails}
        />
        <RequirementCard
          title="Release Controls"
          requirements={grd.releaseControls}
        />
      </div>

      {/* Ownership */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="text-brand-light" size={24} />
          <h2 className="text-2xl font-semibold text-gray-900">Ownership & Accountability</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(grd.ownership).map(([role, owner]) => (
            <div key={role} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-xs text-gray-500 uppercase mb-1">{role}</div>
              <div className={`font-semibold ${owner === 'TBD' ? 'text-orange-600' : 'text-gray-900'}`}>
                {owner || 'TBD'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regulatory Mapping */}
      {Object.keys(grd.regulatoryMapping).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-purple-600" size={24} />
            <h2 className="text-2xl font-semibold text-gray-900">Regulatory Mapping</h2>
          </div>
          
          <div className="space-y-4">
            {Object.entries(grd.regulatoryMapping).map(([regulation, status]) => (
              <div key={regulation} className="border-l-4 border-purple-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{regulation}</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 font-medium transition-colors"
        >
          Review Gaps ({grd.gaps.length})
        </button>
      </div>
    </div>
  );
}

function SOPSection({
  title,
  sop,
  section,
  expanded,
  onToggle,
}: {
  title: string;
  sop: SOP;
  section: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="text-brand-light" size={24} />
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        {expanded ? (
          <ChevronUp className="text-gray-400" size={24} />
        ) : (
          <ChevronDown className="text-gray-400" size={24} />
        )}
      </button>
      
      {expanded && (
        <div className="p-6 pt-0 border-t border-gray-200">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-xs text-blue-600 font-semibold uppercase mb-1">Job Role</div>
              <div className="text-gray-900 font-medium">{sop.jobRole}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-xs text-purple-600 font-semibold uppercase mb-1">Tools Required</div>
              <div className="text-sm text-gray-700 space-y-1">
                {sop.tools.map((tool, i) => (
                  <div key={i}>• {tool}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-semibold text-gray-900 text-lg">Step-by-Step Instructions</h4>
            {sop.steps.map((step, i) => (
              <div key={i} className="border-l-4 border-brand-light pl-4">
                <div className="flex items-start gap-2 mb-3">
                  <span className="bg-brand-light text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <h5 className="font-semibold text-gray-900">{step.title}</h5>
                </div>
                <ul className="ml-8 space-y-2 text-sm text-gray-700">
                  {step.substeps.map((substep, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-brand-light mt-1">→</span>
                      <span>{substep}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <div className="text-xs text-green-700 font-semibold uppercase mb-2">Deliverables</div>
            <div className="flex flex-wrap gap-2">
              {sop.deliverables.map((deliverable, i) => (
                <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {deliverable}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementCard({
  title,
  requirements,
}: {
  title: string;
  requirements: any;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3 text-sm">
        {title === 'Lineage & Traceability' && (
          <>
            <div>
              <strong className="text-gray-700">Required fields:</strong>
              <ul className="mt-1 ml-4 text-gray-600 space-y-1">
                {requirements.requiredFields.map((f: string, i: number) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-gray-700">Retention:</strong>
              <span className="text-gray-600"> {requirements.retentionPeriodMonths} months</span>
            </div>
          </>
        )}
        {title === 'Evaluation' && (
          <>
            <div>
              <strong className="text-gray-700">Required tests:</strong>
              <ul className="mt-1 ml-4 text-gray-600 space-y-1">
                {requirements.mandatoryTests.map((t: string, i: number) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-gray-700">Cadence:</strong>
              <span className="text-gray-600"> {requirements.cadence}</span>
            </div>
          </>
        )}
        {title === 'Guardrails' && (
          <>
            <div>
              <strong className="text-green-700">Allowed:</strong>
              <ul className="mt-1 ml-4 text-gray-600 space-y-1">
                {requirements.allowedIntents.map((a: string, i: number) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong className="text-red-700">Disallowed:</strong>
              <ul className="mt-1 ml-4 text-gray-600 space-y-1">
                {requirements.disallowedIntents.map((d: string, i: number) => (
                  <li key={i}>• {d}</li>
                ))}
              </ul>
            </div>
          </>
        )}
        {title === 'Release Controls' && (
          <>
            <div>
              <strong className="text-gray-700">Stage:</strong>
              <span className="text-gray-600"> {requirements.stage}</span>
            </div>
            {requirements.userCap && (
              <div>
                <strong className="text-gray-700">User cap:</strong>
                <span className="text-gray-600"> {requirements.userCap} users</span>
              </div>
            )}
            <div>
              <strong className="text-gray-700">Geography:</strong>
              <span className="text-gray-600"> {requirements.geography.join(', ')}</span>
            </div>
            <div>
              <strong className="text-gray-700">Kill switch:</strong>
              <span className="text-gray-600"> {requirements.killSwitchRequired ? 'Required' : 'Not required'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function GapsStep({
  grd,
  onNext,
  onBack,
}: {
  grd: GRD;
  onNext: () => void;
  onBack: () => void;
}) {
  const severityColors = {
    blocker: 'bg-red-100 text-red-700 border-red-300',
    critical: 'bg-orange-100 text-orange-700 border-orange-300',
    high: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-300',
    low: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  const blockerGaps = grd.gaps.filter(g => g.severity === 'blocker');
  const criticalGaps = grd.gaps.filter(g => g.severity === 'critical');
  const otherGaps = grd.gaps.filter(g => g.severity !== 'blocker' && g.severity !== 'critical');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gap Analysis</h2>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-red-600">{blockerGaps.length}</div>
            <div>
              <div className="font-semibold text-gray-900">Blocker Gaps</div>
              <div className="text-sm text-gray-600">Must be resolved before release</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-orange-600">{criticalGaps.length}</div>
            <div>
              <div className="font-semibold text-gray-900">Critical Gaps</div>
              <div className="text-sm text-gray-600">Should be resolved before release</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-gray-600">{otherGaps.length}</div>
            <div>
              <div className="font-semibold text-gray-900">Other Gaps</div>
              <div className="text-sm text-gray-600">Recommended to address</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {[...blockerGaps, ...criticalGaps, ...otherGaps].map((gap, idx) => (
          <div
            key={idx}
            className={`bg-white border-2 rounded-lg p-4 ${severityColors[gap.severity]}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded uppercase bg-white/50">
                    {gap.severity}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-white/50">
                    {gap.category}
                  </span>
                </div>
                <p className="font-medium mb-1">{gap.description}</p>
                {gap.remediation && (
                  <p className="text-sm opacity-90 mt-2">{gap.remediation}</p>
                )}
                {gap.prdSection && (
                  <p className="text-xs opacity-75 mt-1">PRD Section: {gap.prdSection}</p>
                )}
                {gap.owner && (
                  <p className="text-xs opacity-75 mt-1">Owner: {gap.owner}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {grd.gaps.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-medium">No gaps detected! GRD is complete.</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="px-6 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 font-medium transition-colors"
        >
          Export GRD
        </button>
      </div>
    </div>
  );
}

function ExportStep({
  grd,
  onExport,
  onBack,
  onReset,
}: {
  grd: GRD;
  onExport: (format: 'json' | 'markdown') => void;
  onBack: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Export GRD</h2>
        <p className="text-gray-600 mb-6">
          Your Governance Requirements Document is ready. Choose a format to download.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onExport('json')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-all text-left w-full"
          >
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold text-gray-900 mb-1">JSON Format</h3>
            <p className="text-sm text-gray-600">
              Machine-readable format for integration with CI/CD and other tools
            </p>
          </button>

          <button
            onClick={() => onExport('markdown')}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-all text-left w-full"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900 mb-1">Markdown Format</h3>
            <p className="text-sm text-gray-600">
              Human-readable format for documentation and review
            </p>
          </button>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
        >
          Back
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}

function generateMarkdown(grd: GRD): string {
  return `# Governance Requirements Document (GRD)

**PRD Reference:** ${grd.prdReference}  
**Version:** ${grd.version}  
**Generated:** ${new Date(grd.createdAt).toLocaleDateString()}

---

## 1. AI Classification

**AI Class:** ${grd.classification.aiClass}  
**Risk Level:** ${grd.classification.riskLevel}

**Rationale:**  
${grd.classification.rationale}

**Regulatory Triggers:**
${grd.classification.regulatoryTriggers.map(t => `- ${t}`).join('\n')}

---

## 2. Lineage Requirements

**Required Fields:**
${grd.lineageRequirements.requiredFields.map(f => `- ${f}`).join('\n')}

**Retention Period:** ${grd.lineageRequirements.retentionPeriodMonths} months

**Audit Access:** ${grd.lineageRequirements.auditAccess.join(', ')}

---

## 3. Evaluation Requirements

**Mandatory Tests:**
${grd.evaluationRequirements.mandatoryTests.map(t => `- ${t}`).join('\n')}

**Thresholds:**
${Object.entries(grd.evaluationRequirements.thresholds).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**Cadence:** ${grd.evaluationRequirements.cadence}

---

## 4. Guardrails

**Allowed Intents:**
${grd.guardrails.allowedIntents.map(i => `- ${i}`).join('\n')}

**Disallowed Intents:**
${grd.guardrails.disallowedIntents.map(i => `- ${i}`).join('\n')}

**Escalation Rules:**
${grd.guardrails.escalationRules.map(r => `- **Condition:** ${r.condition} → **Action:** ${r.action}`).join('\n')}

**Refusal Patterns:**
${grd.guardrails.refusalPatterns.map(p => `- ${p}`).join('\n')}

---

## 5. Release Controls

**Stage:** ${grd.releaseControls.stage}  
**User Cap:** ${grd.releaseControls.userCap || 'Unlimited'}  
**Geography:** ${grd.releaseControls.geography.join(', ')}  
**Kill Switch Required:** ${grd.releaseControls.killSwitchRequired ? 'Yes' : 'No'}

---

## 6. Ownership

${Object.entries(grd.ownership).map(([role, owner]) => `**${role}:** ${owner || 'TBD'}`).join('\n')}

---

## 7. Regulatory Mapping

${Object.entries(grd.regulatoryMapping).map(([regulation, status]) => `**${regulation}:** ${status}`).join('\n')}

---

## 8. Gaps

${grd.gaps.length === 0 
  ? 'No gaps detected.' 
  : grd.gaps.map((gap, idx) => `
### Gap ${idx + 1}: ${gap.severity.toUpperCase()}

**Category:** ${gap.category}  
**Description:** ${gap.description}  
${gap.remediation ? `**Remediation:** ${gap.remediation}` : ''}  
${gap.owner ? `**Owner:** ${gap.owner}` : ''}  
${gap.prdSection ? `**PRD Section:** ${gap.prdSection}` : ''}
`).join('\n')}

---

*This GRD was automatically generated from PRD ${grd.prdReference}.*
`;
}
