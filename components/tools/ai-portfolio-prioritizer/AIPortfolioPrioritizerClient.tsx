'use client';

import { useState } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import type { BusinessProblem, PrioritizationResult } from '@/lib/tools/ai-portfolio-prioritizer/analyzer';

interface AIPortfolioPrioritizerClientProps {
  toolId: string;
  studentProfileId: string;
}

export function AIPortfolioPrioritizerClient({
  toolId,
  studentProfileId,
}: AIPortfolioPrioritizerClientProps) {
  const [problems, setProblems] = useState<BusinessProblem[]>([
    { id: '1', title: '', description: '' },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PrioritizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addProblem = () => {
    setProblems([...problems, { id: Date.now().toString(), title: '', description: '' }]);
  };

  const removeProblem = (id: string) => {
    if (problems.length > 1) {
      setProblems(problems.filter(p => p.id !== id));
    }
  };

  const updateProblem = (id: string, field: keyof BusinessProblem, value: string) => {
    setProblems(problems.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const analyzePortfolio = async () => {
    // Validate problems
    const validProblems = problems.filter(p => p.title.trim() && p.description.trim());
    if (validProblems.length === 0) {
      setError('Please provide at least one problem with a title and description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/tools/ai-portfolio-prioritizer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problems: validProblems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze portfolio');
      }

      const data = await response.json();
      setResult(data.result);

      // Log tool run
      await logToolRunSafe({
        toolId,
        studentProfileId,
        inputs: {
          problemCount: validProblems.length,
          problems: validProblems.map(p => ({ title: p.title, description: p.description.substring(0, 200) })),
        },
        outputs: {
          summary: data.result.summary,
          topPriorities: data.result.problems.slice(0, 3).map((p: any) => ({
            title: validProblems.find(prob => prob.id === p.problemId)?.title,
            priorityScore: p.priorityScore,
            roiScore: p.roiScore,
            feasibilityScore: p.feasibilityScore,
          })),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 70) return 'High Priority';
    if (score >= 40) return 'Medium Priority';
    return 'Low Priority';
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Business Problems</h2>
          <button
            onClick={addProblem}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Problem
          </button>
        </div>

        <div className="space-y-4">
          {problems.map((problem, index) => (
            <div key={problem.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Problem {index + 1}</h3>
                {problems.length > 1 && (
                  <button
                    onClick={() => removeProblem(problem.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={problem.title}
                  onChange={(e) => updateProblem(problem.id, 'title', e.target.value)}
                  placeholder="e.g., Reduce customer churn by 20%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={problem.description}
                  onChange={(e) => updateProblem(problem.id, 'description', e.target.value)}
                  placeholder="Describe the business problem, its impact, and any relevant context..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact (Optional)
                </label>
                <input
                  type="text"
                  value={problem.impact || ''}
                  onChange={(e) => updateProblem(problem.id, 'impact', e.target.value)}
                  placeholder="e.g., Affects 10,000 customers, $2M annual revenue at risk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Constraints (Optional)
                </label>
                <input
                  type="text"
                  value={problem.constraints || ''}
                  onChange={(e) => updateProblem(problem.id, 'constraints', e.target.value)}
                  placeholder="e.g., Must be completed within 6 months, limited to $500K budget"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={analyzePortfolio}
            disabled={isAnalyzing}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing Portfolio...' : 'Analyze & Prioritize Portfolio'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Problems</div>
                <div className="text-2xl font-bold text-gray-900">{result.summary.totalProblems}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">High Priority</div>
                <div className="text-2xl font-bold text-green-700">{result.summary.highPriorityCount}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Medium Priority</div>
                <div className="text-2xl font-bold text-yellow-700">{result.summary.mediumPriorityCount}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Low Priority</div>
                <div className="text-2xl font-bold text-red-700">{result.summary.lowPriorityCount}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Average ROI Score</div>
                <div className="text-2xl font-bold text-blue-700">{result.summary.averageROI}/100</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Average Feasibility</div>
                <div className="text-2xl font-bold text-purple-700">{result.summary.averageFeasibility}/100</div>
              </div>
            </div>
          </div>

          {/* Insights */}
          {result.insights.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Insights</h2>
              <ul className="space-y-2">
                {result.insights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prioritized Problems */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prioritized Problems</h2>
            <div className="space-y-4">
              {result.problems.map((analysis, idx) => {
                const problem = problems.find(p => p.id === analysis.problemId);
                return (
                  <div
                    key={analysis.problemId}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-400">#{idx + 1}</span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {problem?.title || 'Unknown Problem'}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                              analysis.priorityScore
                            )}`}
                          >
                            {getPriorityLabel(analysis.priorityScore)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{problem?.description}</p>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Priority Score</div>
                        <div className="text-2xl font-bold text-blue-700">{Math.round(analysis.priorityScore)}/100</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">ROI Score</div>
                        <div className="text-2xl font-bold text-green-700">{Math.round(analysis.roiScore)}/100</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Feasibility Score</div>
                        <div className="text-2xl font-bold text-purple-700">{Math.round(analysis.feasibilityScore)}/100</div>
                      </div>
                    </div>

                    {/* ROI Breakdown */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">ROI Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Revenue Impact</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.roiBreakdown.potentialRevenue)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Cost Savings</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.roiBreakdown.costSavings)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Strategic Value</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.roiBreakdown.strategicValue)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Time to Value</div>
                          <div className="text-sm font-semibold">{analysis.roiBreakdown.timeToValue} months</div>
                        </div>
                      </div>
                    </div>

                    {/* Feasibility Breakdown */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Feasibility Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Tech Complexity</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.feasibilityBreakdown.technicalComplexity)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Resources Needed</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.feasibilityBreakdown.resourceRequirements)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Risk Level</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.feasibilityBreakdown.riskLevel)}/100</div>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <div className="text-xs text-gray-600">Dependencies</div>
                          <div className="text-sm font-semibold">{Math.round(analysis.feasibilityBreakdown.dependencies)}/100</div>
                        </div>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Analysis Reasoning</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{analysis.reasoning}</p>
                    </div>

                    {/* Timeline & Cost */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Estimated Timeline</div>
                        <div className="text-sm font-semibold text-gray-900">{analysis.estimatedTimeline}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Estimated Cost</div>
                        <div className="text-sm font-semibold text-gray-900">{analysis.estimatedCost}</div>
                      </div>
                    </div>

                    {/* Risks & Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.keyRisks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Risks</h4>
                          <ul className="space-y-1">
                            {analysis.keyRisks.map((risk, riskIdx) => (
                              <li key={riskIdx} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-red-500 mt-1">•</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {analysis.recommendations.map((rec, recIdx) => (
                              <li key={recIdx} className="text-xs text-gray-600 flex items-start gap-1">
                                <span className="text-green-500 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
