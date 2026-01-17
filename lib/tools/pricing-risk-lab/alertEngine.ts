/**
 * Pricing & Risk Lab - Alert Engine
 * 
 * Detects anomalies in simulation results and generates alerts with severity levels.
 */

import type { ComparisonResult } from './simEngine';
import type {
  SimulationResult,
  Alert,
  AlertType,
  AlertSeverity,
} from './types';

/**
 * Alert configuration thresholds
 */
export interface AlertThresholds {
  minApprovalRate?: number; // Minimum acceptable approval rate (0-1)
  maxFraudLossLift?: number; // Maximum acceptable fraud loss increase (0-1, e.g., 0.1 = 10% increase)
  maxFpRate?: number; // Maximum acceptable false positive rate (0-1)
  maxFrictionScore?: number; // Maximum acceptable friction score (0-1)
  approvalRateDropThreshold?: number; // Threshold for sudden drop detection (0-1, e.g., 0.05 = 5% drop)
  fraudLossSpikeThreshold?: number; // Threshold for fraud loss spike (0-1, e.g., 0.2 = 20% increase)
}

/**
 * Alert context for attribution
 */
export interface AlertContext {
  scenarioId?: string;
  experimentName?: string;
  market?: string;
  segment?: string;
}

/**
 * Default alert thresholds
 */
export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  minApprovalRate: 0.85, // 85% minimum
  maxFraudLossLift: 0.15, // 15% maximum increase
  maxFpRate: 0.10, // 10% maximum
  maxFrictionScore: 0.20, // 20% maximum
  approvalRateDropThreshold: 0.05, // 5% drop triggers alert
  fraudLossSpikeThreshold: 0.20, // 20% increase triggers alert
};

/**
 * Generate unique alert ID
 */
function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Detect approval rate drop
 */
function detectApprovalRateDrop(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const drop = baseline.approvalRate - scenario.approvalRate;
  const dropThreshold = thresholds.approvalRateDropThreshold ?? DEFAULT_ALERT_THRESHOLDS.approvalRateDropThreshold!;
  const minApprovalRate = thresholds.minApprovalRate ?? DEFAULT_ALERT_THRESHOLDS.minApprovalRate!;

  // Check for sudden drop
  if (drop > dropThreshold) {
    let severity: AlertSeverity = 'warning';
    if (scenario.approvalRate < minApprovalRate) {
      severity = 'critical';
    } else if (drop > dropThreshold * 2) {
      severity = 'critical';
    } else if (drop > dropThreshold * 1.5) {
      severity = 'warning';
    } else {
      severity = 'info';
    }

    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    return {
      id: generateAlertId(),
      type: 'approval_rate_below_threshold',
      severity,
      message: `Approval rate dropped by ${(drop * 100).toFixed(2)}%${contextStr}. Current rate: ${(scenario.approvalRate * 100).toFixed(2)}%`,
      triggeredBy: `approvalRate drop > ${(dropThreshold * 100).toFixed(1)}%`,
      threshold: dropThreshold,
      observed: drop,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  // Check if below minimum threshold
  if (scenario.approvalRate < minApprovalRate) {
    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    return {
      id: generateAlertId(),
      type: 'approval_rate_below_threshold',
      severity: 'critical',
      message: `Approval rate ${(scenario.approvalRate * 100).toFixed(2)}% is below minimum threshold of ${(minApprovalRate * 100).toFixed(2)}%${contextStr}`,
      triggeredBy: `approvalRate < ${(minApprovalRate * 100).toFixed(1)}%`,
      threshold: minApprovalRate,
      observed: scenario.approvalRate,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

/**
 * Detect fraud loss spike
 */
function detectFraudLossSpike(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const fraudLossIncrease = scenario.fraudLoss - baseline.fraudLoss;
  const fraudLossLift = baseline.fraudLoss > 0 
    ? fraudLossIncrease / baseline.fraudLoss 
    : scenario.fraudLoss > 0 ? 1 : 0;
  
  const spikeThreshold = thresholds.fraudLossSpikeThreshold ?? DEFAULT_ALERT_THRESHOLDS.fraudLossSpikeThreshold!;
  const maxLift = thresholds.maxFraudLossLift ?? DEFAULT_ALERT_THRESHOLDS.maxFraudLossLift!;

  // Check for spike
  if (fraudLossLift > spikeThreshold) {
    let severity: AlertSeverity = 'warning';
    if (fraudLossLift > maxLift) {
      severity = 'critical';
    } else if (fraudLossLift > maxLift * 0.7) {
      severity = 'warning';
    } else {
      severity = 'info';
    }

    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    return {
      id: generateAlertId(),
      type: 'fraud_threshold_exceeded',
      severity,
      message: `Fraud loss increased by ${(fraudLossLift * 100).toFixed(2)}%${contextStr}. Current loss: $${scenario.fraudLoss.toFixed(2)} (was $${baseline.fraudLoss.toFixed(2)})`,
      triggeredBy: `fraudLoss lift > ${(spikeThreshold * 100).toFixed(1)}%`,
      threshold: spikeThreshold,
      observed: fraudLossLift,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  // Check if exceeds maximum lift
  if (fraudLossLift > maxLift) {
    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    return {
      id: generateAlertId(),
      type: 'fraud_threshold_exceeded',
      severity: 'critical',
      message: `Fraud loss increase ${(fraudLossLift * 100).toFixed(2)}% exceeds maximum allowed ${(maxLift * 100).toFixed(2)}%${contextStr}`,
      triggeredBy: `fraudLoss lift > ${(maxLift * 100).toFixed(1)}%`,
      threshold: maxLift,
      observed: fraudLossLift,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

/**
 * Detect chargeback proxy (fraud loss delta)
 */
function detectChargebackProxy(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const fraudLossDelta = scenario.fraudLoss - baseline.fraudLoss;
  const maxLift = thresholds.maxFraudLossLift ?? DEFAULT_ALERT_THRESHOLDS.maxFraudLossLift!;

  // Chargeback proxy: significant increase in fraud loss
  if (fraudLossDelta > 0 && baseline.fraudLoss > 0) {
    const lift = fraudLossDelta / baseline.fraudLoss;
    
    if (lift > maxLift * 0.5) { // Alert at 50% of max threshold
      const contextStr = context.experimentName 
        ? ` in experiment "${context.experimentName}"`
        : context.scenarioId 
        ? ` in scenario "${context.scenarioId}"`
        : '';

      return {
        id: generateAlertId(),
        type: 'fraud_threshold_exceeded',
        severity: lift > maxLift ? 'critical' : 'warning',
        message: `Chargeback proxy (fraud loss delta) increased by $${fraudLossDelta.toFixed(2)}${contextStr}. This may indicate higher chargeback risk.`,
        triggeredBy: `fraudLoss delta > ${(maxLift * 0.5 * 100).toFixed(1)}% of baseline`,
        threshold: maxLift * 0.5,
        observed: lift,
        timestamp: new Date(),
        acknowledged: false,
      };
    }
  }

  return null;
}

/**
 * Detect false positive rate threshold breach
 */
function detectFpRateThreshold(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const maxFpRate = thresholds.maxFpRate ?? DEFAULT_ALERT_THRESHOLDS.maxFpRate!;

  if (scenario.fpRate > maxFpRate) {
    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    const severity: AlertSeverity = scenario.fpRate > maxFpRate * 1.5 ? 'critical' : 'warning';

    return {
      id: generateAlertId(),
      type: 'payment_method_issue',
      severity,
      message: `False positive rate ${(scenario.fpRate * 100).toFixed(2)}% exceeds maximum threshold of ${(maxFpRate * 100).toFixed(2)}%${contextStr}. Legitimate transactions are being declined.`,
      triggeredBy: `fpRate > ${(maxFpRate * 100).toFixed(1)}%`,
      threshold: maxFpRate,
      observed: scenario.fpRate,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

/**
 * Detect friction score threshold breach
 */
function detectFrictionScoreThreshold(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const maxFrictionScore = thresholds.maxFrictionScore ?? DEFAULT_ALERT_THRESHOLDS.maxFrictionScore!;

  if (scenario.frictionScore > maxFrictionScore) {
    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    const severity: AlertSeverity = scenario.frictionScore > maxFrictionScore * 1.3 ? 'critical' : 'warning';

    return {
      id: generateAlertId(),
      type: 'conversion_anomaly',
      severity,
      message: `Friction score ${(scenario.frictionScore * 100).toFixed(2)}% exceeds maximum threshold of ${(maxFrictionScore * 100).toFixed(2)}%${contextStr}. Customer experience may be degraded.`,
      triggeredBy: `frictionScore > ${(maxFrictionScore * 100).toFixed(1)}%`,
      threshold: maxFrictionScore,
      observed: scenario.frictionScore,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

/**
 * Detect revenue drop
 */
function detectRevenueDrop(
  baseline: SimulationResult,
  scenario: SimulationResult,
  thresholds: AlertThresholds,
  context: AlertContext
): Alert | null {
  const revenueDrop = baseline.revenue - scenario.revenue;
  const revenueDropPercent = baseline.revenue > 0 
    ? revenueDrop / baseline.revenue 
    : 0;

  // Alert if revenue drops by more than 5%
  if (revenueDropPercent > 0.05) {
    const contextStr = context.experimentName 
      ? ` in experiment "${context.experimentName}"`
      : context.scenarioId 
      ? ` in scenario "${context.scenarioId}"`
      : '';

    const severity: AlertSeverity = revenueDropPercent > 0.15 ? 'critical' : revenueDropPercent > 0.10 ? 'warning' : 'info';

    return {
      id: generateAlertId(),
      type: 'revenue_drop',
      severity,
      message: `Revenue dropped by ${(revenueDropPercent * 100).toFixed(2)}%${contextStr}. Current revenue: $${scenario.revenue.toFixed(2)} (was $${baseline.revenue.toFixed(2)})`,
      triggeredBy: `revenue drop > 5%`,
      threshold: 0.05,
      observed: revenueDropPercent,
      timestamp: new Date(),
      acknowledged: false,
    };
  }

  return null;
}

/**
 * Generate alerts from comparison result
 */
export function generateAlerts(
  comparison: ComparisonResult,
  thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS,
  context: AlertContext = {}
): Alert[] {
  const alerts: Alert[] = [];

  const baseline = comparison.baseline;
  const scenario = comparison.scenario;

  // Run all detection functions
  const detectedAlerts = [
    detectApprovalRateDrop(baseline, scenario, thresholds, context),
    detectFraudLossSpike(baseline, scenario, thresholds, context),
    detectChargebackProxy(baseline, scenario, thresholds, context),
    detectFpRateThreshold(baseline, scenario, thresholds, context),
    detectFrictionScoreThreshold(baseline, scenario, thresholds, context),
    detectRevenueDrop(baseline, scenario, thresholds, context),
  ];

  // Filter out null alerts
  for (const alert of detectedAlerts) {
    if (alert) {
      alerts.push(alert);
    }
  }

  // Sort by severity (critical > warning > info)
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 3,
    warning: 2,
    info: 1,
  };

  alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

  return alerts;
}

/**
 * Generate alerts from multiple market comparisons (cohort/market deviation)
 */
export function generateMarketDeviationAlerts(
  comparisons: Map<string, ComparisonResult>, // market -> comparison
  thresholds: AlertThresholds = DEFAULT_ALERT_THRESHOLDS,
  context: AlertContext = {}
): Alert[] {
  const alerts: Alert[] = [];

  if (comparisons.size < 2) {
    return alerts; // Need at least 2 markets to detect deviation
  }

  // Calculate average metrics across markets
  const markets = Array.from(comparisons.keys());
  const avgApprovalRate = markets.reduce((sum, market) => {
    return sum + comparisons.get(market)!.scenario.approvalRate;
  }, 0) / markets.length;

  const avgFraudLoss = markets.reduce((sum, market) => {
    return sum + comparisons.get(market)!.scenario.fraudLoss;
  }, 0) / markets.length;

  // Check each market for significant deviation
  for (const [market, comparison] of comparisons.entries()) {
    const approvalDeviation = Math.abs(comparison.scenario.approvalRate - avgApprovalRate);
    const fraudDeviation = Math.abs(comparison.scenario.fraudLoss - avgFraudLoss) / (avgFraudLoss || 1);

    if (approvalDeviation > 0.10) { // 10% deviation
      alerts.push({
        id: generateAlertId(),
        type: 'conversion_anomaly',
        severity: approvalDeviation > 0.20 ? 'critical' : 'warning',
        message: `Market ${market} shows ${(approvalDeviation * 100).toFixed(2)}% deviation in approval rate from average across markets`,
        triggeredBy: `approvalRate deviation > 10% from market average`,
        threshold: 0.10,
        observed: approvalDeviation,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    if (fraudDeviation > 0.30) { // 30% deviation
      alerts.push({
        id: generateAlertId(),
        type: 'fraud_threshold_exceeded',
        severity: fraudDeviation > 0.50 ? 'critical' : 'warning',
        message: `Market ${market} shows ${(fraudDeviation * 100).toFixed(2)}% deviation in fraud loss from average across markets`,
        triggeredBy: `fraudLoss deviation > 30% from market average`,
        threshold: 0.30,
        observed: fraudDeviation,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
  }

  return alerts;
}
