/**
 * Content Systems Studio - Metrics Computation
 * 
 * Deterministic metrics computation from state and audit log.
 */

import type {
  ContentItem,
  WorkflowState,
  AuditEvent,
  RuleResult,
} from './types';
import type { ContentSystemsStudioState } from './state';

/**
 * Filter options for metrics
 */
export interface MetricsFilters {
  schemaId?: string;
  locale?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

/**
 * Content items per state
 */
export interface ItemsPerState {
  draft: number;
  review: number;
  approved: number;
  localised: number;
  total: number;
}

/**
 * Average time spent per workflow stage (in hours)
 */
export interface AvgTimePerStage {
  draft: number;
  review: number;
  approved: number;
  localised: number;
}

/**
 * Rule violations over time
 */
export interface RuleViolationsOverTime {
  date: string; // YYYY-MM-DD
  warnings: number;
  blocks: number;
}

/**
 * Variants generated per item
 */
export interface VariantsPerItem {
  itemId: string;
  itemTitle: string;
  variantCount: number;
}

/**
 * Computed metrics
 */
export interface ThroughputMetrics {
  itemsPerState: ItemsPerState;
  avgTimePerStage: AvgTimePerStage;
  ruleViolationsOverTime: RuleViolationsOverTime[];
  variantsPerItem: VariantsPerItem[];
}

/**
 * Get date range from filter
 */
function getDateRange(timeRange: '7d' | '30d' | '90d' | 'all'): Date | null {
  if (timeRange === 'all') {
    return null;
  }

  const now = new Date();
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return cutoff;
}

/**
 * Filter items by schema and locale
 */
function filterItems(
  items: ContentItem[],
  filters: MetricsFilters
): ContentItem[] {
  return items.filter((item) => {
    if (filters.schemaId && item.schemaId !== filters.schemaId) {
      return false;
    }
    if (filters.locale && item.locale !== filters.locale) {
      return false;
    }
    return true;
  });
}

/**
 * Filter audit events by time range
 */
function filterAuditEvents(
  events: AuditEvent[],
  timeRange: '7d' | '30d' | '90d' | 'all'
): AuditEvent[] {
  if (timeRange === 'all') {
    return events;
  }

  const cutoff = getDateRange(timeRange);
  if (!cutoff) {
    return events;
  }

  return events.filter((event) => event.timestamp >= cutoff);
}

/**
 * Compute content items per state
 */
function computeItemsPerState(
  items: ContentItem[],
  filters: MetricsFilters
): ItemsPerState {
  const filtered = filterItems(items, filters);

  const counts: ItemsPerState = {
    draft: 0,
    review: 0,
    approved: 0,
    localised: 0,
    total: filtered.length,
  };

  for (const item of filtered) {
    counts[item.status] = (counts[item.status] || 0) + 1;
  }

  return counts;
}

/**
 * Compute average time spent per workflow stage
 */
function computeAvgTimePerStage(
  items: ContentItem[],
  auditLog: AuditEvent[],
  filters: MetricsFilters
): AvgTimePerStage {
  const filtered = filterItems(items, filters);
  const filteredAudit = filterAuditEvents(auditLog, filters.timeRange || 'all');

  // Group audit events by item ID
  const itemEvents = new Map<string, AuditEvent[]>();
  for (const event of filteredAudit) {
    const itemId = event.metadata?.itemId as string | undefined;
    if (itemId && event.action === 'transition_state') {
      if (!itemEvents.has(itemId)) {
        itemEvents.set(itemId, []);
      }
      itemEvents.get(itemId)!.push(event);
    }
  }

  // Calculate time spent in each stage per item
  const stageTimes: Record<WorkflowState, number[]> = {
    draft: [],
    review: [],
    approved: [],
    localised: [],
  };

  for (const item of filtered) {
    const events = itemEvents.get(item.id) || [];
    
    // Sort events by timestamp
    const sortedEvents = [...events].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Calculate time in each stage
    let currentState: WorkflowState = 'draft';
    let stateStartTime = item.createdAt.getTime();

    for (const event of sortedEvents) {
      if (event.fromState && event.toState) {
        // Time spent in previous state
        const timeInState = event.timestamp.getTime() - stateStartTime;
        if (timeInState > 0) {
          stageTimes[event.fromState].push(timeInState);
        }

        // Update to new state
        currentState = event.toState;
        stateStartTime = event.timestamp.getTime();
      }
    }

    // Time spent in current state (until now)
    const now = new Date().getTime();
    const timeInCurrentState = now - stateStartTime;
    if (timeInCurrentState > 0) {
      stageTimes[currentState].push(timeInCurrentState);
    }
  }

  // Calculate averages (convert milliseconds to hours)
  const avgTimePerStage: AvgTimePerStage = {
    draft: 0,
    review: 0,
    approved: 0,
    localised: 0,
  };

  for (const [stage, times] of Object.entries(stageTimes)) {
    if (times.length > 0) {
      const sum = times.reduce((a, b) => a + b, 0);
      const avg = sum / times.length;
      avgTimePerStage[stage as WorkflowState] = avg / (1000 * 60 * 60); // Convert to hours
    }
  }

  return avgTimePerStage;
}

/**
 * Compute rule violations over time
 */
function computeRuleViolationsOverTime(
  auditLog: AuditEvent[],
  ruleResults: RuleResult[],
  filters: MetricsFilters
): RuleViolationsOverTime[] {
  const filteredAudit = filterAuditEvents(auditLog, filters.timeRange || 'all');

  // Group rule results by date (from audit log entries that triggered rules)
  const violationsByDate = new Map<string, { warnings: number; blocks: number }>();

  // Find audit events related to rule execution
  // We'll use the ruleResults and match them with audit timestamps
  // For simplicity, we'll use the most recent rule execution timestamp
  const latestRuleExecution = filteredAudit
    .filter((e) => e.action === 'run_rules' || e.metadata?.ruleResults)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  // Count rule violations from current rule results
  // In a real implementation, we'd track rule execution history
  // For now, we'll use the current rule results and distribute them over time
  const today = new Date().toISOString().split('T')[0];
  const warnings = ruleResults.filter((r) => r.status === 'warn').length;
  const blocks = ruleResults.filter((r) => r.status === 'block').length;

  if (warnings > 0 || blocks > 0) {
    violationsByDate.set(today, { warnings, blocks });
  }

  // Convert to array and sort by date
  const violations: RuleViolationsOverTime[] = Array.from(violationsByDate.entries())
    .map(([date, counts]) => ({
      date,
      warnings: counts.warnings,
      blocks: counts.blocks,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return violations;
}

/**
 * Compute variants generated per item
 */
function computeVariantsPerItem(
  auditLog: AuditEvent[],
  items: ContentItem[],
  filters: MetricsFilters
): VariantsPerItem[] {
  const filtered = filterItems(items, filters);
  const filteredAudit = filterAuditEvents(auditLog, filters.timeRange || 'all');

  // Count variants generated per item from audit log
  const variantCounts = new Map<string, number>();

  for (const event of filteredAudit) {
    if (event.action === 'generate_variant' || event.action === 'generate_variants') {
      const sourceItemId = event.metadata?.sourceItemId as string | undefined;
      if (sourceItemId) {
        variantCounts.set(sourceItemId, (variantCounts.get(sourceItemId) || 0) + 1);
      }
    }
  }

  // Create results with item titles
  const results: VariantsPerItem[] = filtered
    .map((item) => {
      const variantCount = variantCounts.get(item.id) || 0;
      
      // Get item title (first non-empty field)
      let itemTitle = 'Untitled';
      for (const value of Object.values(item.fields)) {
        if (value && String(value).trim()) {
          itemTitle = String(value).substring(0, 50);
          break;
        }
      }

      return {
        itemId: item.id,
        itemTitle,
        variantCount,
      };
    })
    .filter((r) => r.variantCount > 0) // Only show items with variants
    .sort((a, b) => b.variantCount - a.variantCount); // Sort by count descending

  return results;
}

/**
 * Compute all throughput metrics
 */
export function computeThroughputMetrics(
  state: ContentSystemsStudioState,
  filters: MetricsFilters = {}
): ThroughputMetrics {
  return {
    itemsPerState: computeItemsPerState(state.contentItems, filters),
    avgTimePerStage: computeAvgTimePerStage(
      state.contentItems,
      state.auditLog,
      filters
    ),
    ruleViolationsOverTime: computeRuleViolationsOverTime(
      state.auditLog,
      state.ruleResults,
      filters
    ),
    variantsPerItem: computeVariantsPerItem(
      state.auditLog,
      state.contentItems,
      filters
    ),
  };
}
