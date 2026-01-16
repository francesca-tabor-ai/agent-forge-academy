'use client';

import { useState } from 'react';
import { useClinicalSandbox } from '@/lib/tools/clinical-ai-sandbox/useClinicalSandbox';
import {
  retrieveDocuments,
  generateAnswerWithCitations,
  type RAGQueryResult,
} from '@/lib/tools/clinical-ai-sandbox/ragEngine';

/**
 * RAG Console Component
 * 
 * Interface for testing and debugging RAG systems with full transparency.
 */
export function RAGConsole() {
  const { addAuditLogEntry } = useClinicalSandbox();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RAGQueryResult | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) {
      return;
    }

    setIsSearching(true);

    // Run deterministic retrieval
    const retrievalResult = retrieveDocuments(query.trim());
    setResult(retrievalResult);

    // Generate answer if coverage is sufficient
    if (retrievalResult.canAnswer) {
      const generatedAnswer = generateAnswerWithCitations(retrievalResult);
      setAnswer(generatedAnswer);
    } else {
      setAnswer('');
    }

    // Append audit log entry
    addAuditLogEntry({
      module: 'rag-console',
      input: query.trim(),
      decision: retrievalResult.canAnswer ? 'answer_with_citations' : 'refusal_insufficient_coverage',
      reasons: [
        `Confidence: ${(retrievalResult.confidence * 100).toFixed(1)}%`,
        `Retrieved ${retrievalResult.retrievedDocs.length} documents`,
        retrievalResult.hasSufficientCoverage
          ? 'Sufficient coverage for answer'
          : 'Insufficient coverage - refusal',
      ],
      metadata: {
        confidence: retrievalResult.confidence,
        docCount: retrievalResult.retrievedDocs.length,
        docIds: retrievalResult.retrievedDocs.map((r) => r.doc.id),
        docVersions: retrievalResult.retrievedDocs.map((r) => ({
          id: r.doc.id,
          title: r.doc.title,
          version: r.doc.version,
          updated_at: r.doc.updated_at.toISOString(),
        })),
        coverageGaps: retrievalResult.coverageGaps,
        matchedTerms: retrievalResult.retrievedDocs.flatMap((r) => r.matchedTerms),
      },
    });

    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">RAG Console</h2>
        <p className="mt-2 text-gray-600">
          Test and debug Retrieval-Augmented Generation systems for clinical knowledge. Query medical databases, review retrieved context, and evaluate response quality.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Query</h3>
        <div className="space-y-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter a query to search the document set (e.g., 'What is hypertension?')"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search Documents'}
          </button>
          <p className="text-xs text-gray-500">Press Cmd+Enter to search</p>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Retrieval Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Retrieval Results</h3>

            {/* Confidence Score */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Retrieval Confidence:</span>
                <span className={`text-lg font-bold ${
                  result.confidence >= 0.7 ? 'text-green-600' :
                  result.confidence >= 0.5 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.confidence >= 0.7 ? 'bg-green-500' :
                    result.confidence >= 0.5 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Coverage Gaps */}
            {result.coverageGaps.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">Coverage Gaps:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  {result.coverageGaps.map((gap, idx) => (
                    <li key={idx}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Retrieved Documents */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Retrieved Documents ({result.retrievedDocs.length}):
              </h4>
              {result.retrievedDocs.length > 0 ? (
                result.retrievedDocs.map((retrieval, index) => (
                  <div
                    key={retrieval.doc.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">
                          [{index + 1}] {retrieval.doc.title}
                        </h5>
                        <div className="text-sm text-gray-600 mt-1">
                          <span>Version {retrieval.doc.version}</span>
                          <span className="mx-2">•</span>
                          <span>
                            Updated: {retrieval.doc.updated_at.toLocaleDateString()}
                          </span>
                          <span className="mx-2">•</span>
                          <span>Relevance: {retrieval.relevanceScore}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{retrieval.doc.excerpt}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {retrieval.doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {retrieval.matchedTerms.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Matched terms: {retrieval.matchedTerms.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No documents retrieved</p>
              )}
            </div>
          </div>

          {/* Response Area */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
            {result.canAnswer && answer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Answer with Citations
                  </span>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded border border-gray-200">
                    {answer}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Out of Scope / Insufficient Coverage → Refusal
                  </span>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium mb-2">
                    Cannot provide an answer due to insufficient coverage.
                  </p>
                  <p className="text-red-700 text-sm">
                    The retrieved documents do not provide sufficient information to answer this query safely and accurately. 
                    This query is outside the scope of the available knowledge base or requires additional context that is not available.
                  </p>
                  {result.coverageGaps.length > 0 && (
                    <div className="mt-3">
                      <p className="text-red-800 font-medium text-sm mb-1">Specific gaps identified:</p>
                      <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                        {result.coverageGaps.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
