'use client';

import { useState, useEffect } from 'react';
import type { RetrievedChunk, RetrievalDiagnostics } from './types';

interface Course {
  slug: string;
  name: string;
}

interface RAGInspectionResult {
  query: string;
  chunks: RetrievedChunk[];
  diagnostics: RetrievalDiagnostics;
  trustMetrics: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    hasHighConfidence: boolean;
    coverageScore: number;
    scoreDistribution: {
      high: number;
      medium: number;
      low: number;
    };
  };
  warnings: string[];
  recommendations: string[];
}

export function RAGTrustInspector() {
  const [query, setQuery] = useState('');
  const [courseSlug, setCourseSlug] = useState<string>('');
  const [limit, setLimit] = useState(5);
  const [minScore, setMinScore] = useState(0.5);
  const [useVectorSearch, setUseVectorSearch] = useState<boolean | undefined>(undefined);
  const [result, setResult] = useState<RAGInspectionResult | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load available courses
  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch('/api/rag/inspect');
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    }
    loadCourses();
  }, []);

  const handleInspect = async () => {
    if (!query.trim()) {
      return;
    }

    setIsInspecting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/rag/inspect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          courseSlug: courseSlug || undefined,
          limit,
          minScore,
          useVectorSearch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to inspect RAG system');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleInspect();
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">RAG Query Inspector</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Query
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter a query to test the RAG system (e.g., 'What is retrieval-augmented generation?')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                Course Filter (Optional)
              </label>
              <select
                id="course"
                value={courseSlug}
                onChange={(e) => setCourseSlug(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.slug} value={course.slug}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                Results Limit
              </label>
              <input
                id="limit"
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="minScore" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Score Threshold
              </label>
              <input
                id="minScore"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value) || 0.5)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMethod"
                    checked={useVectorSearch === undefined}
                    onChange={() => setUseVectorSearch(undefined)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Auto</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMethod"
                    checked={useVectorSearch === true}
                    onChange={() => setUseVectorSearch(true)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Vector</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="searchMethod"
                    checked={useVectorSearch === false}
                    onChange={() => setUseVectorSearch(false)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Keyword</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleInspect}
            disabled={!query.trim() || isInspecting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isInspecting ? 'Inspecting...' : 'Inspect RAG System'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to inspect
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Trust Metrics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Trust Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Average Score</div>
                <div className={`text-2xl font-bold ${
                  result.trustMetrics.averageScore >= 0.7 ? 'text-green-600' :
                  result.trustMetrics.averageScore >= 0.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {(result.trustMetrics.averageScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Coverage Score</div>
                <div className={`text-2xl font-bold ${
                  result.trustMetrics.coverageScore >= 0.8 ? 'text-green-600' :
                  result.trustMetrics.coverageScore >= 0.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {(result.trustMetrics.coverageScore * 100).toFixed(0)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className={`text-2xl font-bold ${
                  result.trustMetrics.hasHighConfidence ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {result.trustMetrics.hasHighConfidence ? 'High' : 'Medium'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Score Range</div>
                <div className="text-lg font-semibold text-gray-900">
                  {(result.trustMetrics.minScore * 100).toFixed(1)}% - {(result.trustMetrics.maxScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Score Distribution</div>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between">
                    <span>High (≥80%):</span>
                    <span className="font-semibold text-green-600">{result.trustMetrics.scoreDistribution.high}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medium (50-80%):</span>
                    <span className="font-semibold text-yellow-600">{result.trustMetrics.scoreDistribution.medium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low (&lt;50%):</span>
                    <span className="font-semibold text-red-600">{result.trustMetrics.scoreDistribution.low}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Retrieval Method</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {result.diagnostics.method}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Latency: {result.diagnostics.totalLatency}ms
                  {result.diagnostics.embeddingLatency && ` (embedding: ${result.diagnostics.embeddingLatency}ms)`}
                </div>
              </div>
            </div>
          </div>

          {/* Warnings and Recommendations */}
          {(result.warnings.length > 0 || result.recommendations.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Warnings</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    {result.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Retrieved Chunks */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Retrieved Chunks ({result.chunks.length})
            </h2>
            {result.chunks.length > 0 ? (
              <div className="space-y-4">
                {result.chunks.map((chunk, index) => (
                  <div
                    key={chunk.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          [{index + 1}] {chunk.metadata.title || chunk.lessonSlug}
                        </h4>
                        <div className="text-sm text-gray-600 space-x-2">
                          <span>{chunk.courseSlug}</span>
                          <span>•</span>
                          <span>{chunk.lessonSlug}</span>
                          {chunk.metadata.module && (
                            <>
                              <span>•</span>
                              <span>Module {chunk.metadata.module}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {chunk.score !== undefined && (
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          chunk.score >= 0.8 ? 'bg-green-100 text-green-700' :
                          chunk.score >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {(chunk.score * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{chunk.content}</p>
                    </div>
                    {chunk.metadata.sectionHeaders && chunk.metadata.sectionHeaders.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chunk.metadata.sectionHeaders.map((header, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                          >
                            {header}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No chunks retrieved</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
