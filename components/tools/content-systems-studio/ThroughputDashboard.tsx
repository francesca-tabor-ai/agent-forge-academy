'use client';

import { useState, useMemo } from 'react';
import type { UseContentSystemsStudioReturn } from '@/lib/tools/content-systems-studio/useContentSystemsStudio';
import {
  computeThroughputMetrics,
  type MetricsFilters,
} from '@/lib/tools/content-systems-studio/metrics';

export function ThroughputDashboard({ studio }: { studio: UseContentSystemsStudioReturn }) {
  const [filters, setFilters] = useState<MetricsFilters>({
    timeRange: '30d',
  });

  const metrics = useMemo(
    () => computeThroughputMetrics(studio.state, filters),
    [studio.state, filters]
  );

  // Get unique schemas and locales for filters
  const availableSchemas = useMemo(() => {
    const schemaIds = new Set(studio.state.contentItems.map((item) => item.schemaId));
    return Array.from(schemaIds).map((id) => {
      const schema = studio.state.schemas.find((s) => s.id === id);
      return { id, name: schema?.name || id };
    });
  }, [studio.state]);

  const availableLocales = useMemo(() => {
    const locales = new Set(studio.state.contentItems.map((item) => item.locale));
    return Array.from(locales).sort();
  }, [studio.state]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Schema Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schema</label>
            <select
              value={filters.schemaId || ''}
              onChange={(e) =>
                setFilters({ ...filters, schemaId: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Schemas</option>
              {availableSchemas.map((schema) => (
                <option key={schema.id} value={schema.id}>
                  {schema.name}
                </option>
              ))}
            </select>
          </div>

          {/* Locale Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locale</label>
            <select
              value={filters.locale || ''}
              onChange={(e) =>
                setFilters({ ...filters, locale: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locales</option>
              {availableLocales.map((locale) => (
                <option key={locale} value={locale}>
                  {locale}
                </option>
              ))}
            </select>
          </div>

          {/* Time Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={filters.timeRange || 'all'}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  timeRange: e.target.value as '7d' | '30d' | '90d' | 'all',
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Items Per State */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Items Per State</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{metrics.itemsPerState.draft}</div>
            <div className="text-sm text-gray-600 mt-1">Draft</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{metrics.itemsPerState.review}</div>
            <div className="text-sm text-gray-600 mt-1">Review</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{metrics.itemsPerState.approved}</div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{metrics.itemsPerState.localised}</div>
            <div className="text-sm text-gray-600 mt-1">Localised</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-700">{metrics.itemsPerState.total}</div>
            <div className="text-sm text-gray-600 mt-1">Total</div>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="mt-6">
          <div className="flex items-end space-x-2 h-32">
            {(['draft', 'review', 'approved', 'localised'] as const).map((state) => {
              const count = metrics.itemsPerState[state];
              const max = Math.max(
                metrics.itemsPerState.draft,
                metrics.itemsPerState.review,
                metrics.itemsPerState.approved,
                metrics.itemsPerState.localised,
                1
              );
              const height = (count / max) * 100;

              const colors = {
                draft: 'bg-gray-400',
                review: 'bg-yellow-400',
                approved: 'bg-green-400',
                localised: 'bg-blue-400',
              };

              return (
                <div key={state} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full ${colors[state]} rounded-t transition-all`}
                    style={{ height: `${height}%` }}
                    title={`${state}: ${count}`}
                  />
                  <div className="text-xs text-gray-600 mt-2 capitalize">{state}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Average Time Per Stage */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Average Time Per Workflow Stage
        </h2>
        <div className="space-y-4">
          {(['draft', 'review', 'approved', 'localised'] as const).map((stage) => {
            const hours = metrics.avgTimePerStage[stage];
            const displayHours = hours > 0 ? hours.toFixed(1) : '0.0';

            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{stage}</span>
                  <span className="text-sm font-semibold text-gray-900">{displayHours} hours</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((hours / Math.max(...Object.values(metrics.avgTimePerStage), 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rule Violations Over Time */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rule Violations Over Time</h2>
        {metrics.ruleViolationsOverTime.length === 0 ? (
          <p className="text-sm text-gray-500">No rule violations recorded in the selected time range.</p>
        ) : (
          <div className="space-y-3">
            {metrics.ruleViolationsOverTime.map((violation) => (
              <div
                key={violation.date}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <span className="text-sm font-medium text-gray-700">{violation.date}</span>
                <div className="flex items-center space-x-4">
                  {violation.warnings > 0 && (
                    <span className="text-sm text-yellow-600 font-medium">
                      ⚠ {violation.warnings} warning{violation.warnings !== 1 ? 's' : ''}
                    </span>
                  )}
                  {violation.blocks > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      🚫 {violation.blocks} block{violation.blocks !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants Generated Per Item */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Variants Generated Per Item</h2>
        {metrics.variantsPerItem.length === 0 ? (
          <p className="text-sm text-gray-500">No variants generated in the selected time range.</p>
        ) : (
          <div className="space-y-3">
            {metrics.variantsPerItem.slice(0, 10).map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.itemTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {item.itemId.substring(0, 12)}...</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{item.variantCount}</div>
                  <div className="text-xs text-gray-500">variant{item.variantCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
            {metrics.variantsPerItem.length > 10 && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Showing top 10 of {metrics.variantsPerItem.length} items
              </p>
            )}
          </div>
        )}
      </div>

      {/* Value Proposition */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Dashboard Value</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Track content throughput across workflow stages</li>
          <li>• Identify bottlenecks in approval processes</li>
          <li>• Monitor rule compliance and quality trends</li>
          <li>• Measure variant generation productivity</li>
        </ul>
      </div>
    </div>
  );
}
