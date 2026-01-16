/**
 * Pricing & Risk Lab - Type Definitions
 * 
 * Core types for the Pricing & Risk Lab simulation system.
 * These types define markets, segments, channels, payment methods, and simulation results.
 */

/**
 * Market represents a geographic market with baseline metrics
 */
export interface Market {
  code: string; // ISO country code (e.g., 'US', 'UK', 'DE')
  currency: string; // ISO currency code (e.g., 'USD', 'GBP', 'EUR')
  baselineConversion: number; // Baseline conversion rate (0-1, e.g., 0.025 = 2.5%)
  baselineFraudRate: number; // Baseline fraud rate (0-1, e.g., 0.015 = 1.5%)
}

/**
 * Segment represents a customer segment with risk and price sensitivity profiles
 */
export interface Segment {
  name: string;
  riskProfile: 'low' | 'medium' | 'high'; // Risk level of this segment
  priceSensitivity: number; // Price sensitivity coefficient (0-1, higher = more sensitive)
}

/**
 * Channel represents a sales/acquisition channel with conversion modifiers
 */
export interface Channel {
  name: string;
  baselineConversionModifier: number; // Multiplier for baseline conversion (e.g., 1.2 = 20% higher)
}

/**
 * PaymentMethod represents a payment method with approval and fraud modifiers
 */
export interface PaymentMethod {
  name: string;
  approvalModifier: number; // Multiplier for approval rate (e.g., 0.95 = 5% lower approval)
  fraudModifier: number; // Multiplier for fraud rate (e.g., 1.5 = 50% higher fraud)
}

/**
 * Pricing tier within a scenario
 */
export interface PricingTier {
  name: string;
  price: number; // Price in base currency
  minQuantity?: number; // Minimum quantity for this tier
  maxQuantity?: number; // Maximum quantity for this tier
}

/**
 * Discount configuration
 */
export interface Discount {
  type: 'percentage' | 'fixed';
  value: number; // Percentage (0-100) or fixed amount
  minPurchase?: number; // Minimum purchase amount to qualify
  applicableSegments?: string[]; // Segment names that qualify
  applicableMarkets?: string[]; // Market codes that qualify
}

/**
 * Regional pricing override
 */
export interface RegionalOverride {
  marketCode: string;
  priceAdjustment: number; // Percentage adjustment (e.g., 10 = 10% increase, -5 = 5% decrease)
  currencyOverride?: string; // Optional currency override
}

/**
 * PricingScenario represents a complete pricing configuration
 */
export interface PricingScenario {
  id: string;
  name: string;
  tiers: PricingTier[];
  discounts: Discount[];
  regionalOverrides: RegionalOverride[];
}

/**
 * SimulationSettings configure how the simulation runs
 */
export interface SimulationSettings {
  riskTolerance: 'low' | 'medium' | 'high'; // Risk tolerance level
  approvalThreshold: number; // Minimum approval rate to accept (0-1)
  fraudStrictness: number; // Fraud detection strictness (0-1, higher = stricter)
  timeHorizon: number; // Simulation time horizon in days
}

/**
 * Risk score distribution bucket
 */
export interface RiskScoreDistribution {
  range: string; // e.g., '0-20', '21-40', etc.
  count: number; // Number of transactions in this range
  percentage: number; // Percentage of total transactions
}

/**
 * SimulationResult contains the output metrics from a simulation run
 */
export interface SimulationResult {
  conversionRate: number; // Overall conversion rate (0-1)
  rpu: number; // Revenue per user (in base currency)
  revenue: number; // Total revenue (in base currency)
  fraudExposure: number; // Total value at risk from fraud (in base currency)
  fraudLoss: number; // Actual fraud losses (in base currency)
  approvalRate: number; // Payment approval rate (0-1)
  declineRate: number; // Payment decline rate (0-1)
  fpRate: number; // False positive rate (0-1) - legitimate transactions declined
  fnRate: number; // False negative rate (0-1) - fraudulent transactions approved
  frictionScore: number; // Customer friction score (0-1, higher = more friction)
  riskScoreDistribution: RiskScoreDistribution[]; // Distribution of risk scores
}

/**
 * Experiment status
 */
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed' | 'archived';

/**
 * ExperimentDraft represents a planned or running A/B test
 */
export interface ExperimentDraft {
  id: string;
  name: string;
  owner: string; // User ID or name
  hypothesis: string; // What we're testing
  metrics: string[]; // Key metrics to track (e.g., ['conversionRate', 'revenue', 'fraudLoss'])
  guardrails: {
    maxFraudRate?: number; // Maximum acceptable fraud rate
    minApprovalRate?: number; // Minimum acceptable approval rate
    minRevenue?: number; // Minimum revenue threshold
  };
  status: ExperimentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alert type
 */
export type AlertType = 
  | 'fraud_threshold_exceeded'
  | 'approval_rate_below_threshold'
  | 'revenue_drop'
  | 'conversion_anomaly'
  | 'risk_score_spike'
  | 'payment_method_issue';

/**
 * Alert severity
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Alert represents a triggered alert condition
 */
export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  triggeredBy: string; // What condition triggered this (e.g., 'fraudRate > 0.02')
  threshold: number; // Threshold value that was exceeded
  observed: number; // Observed value that triggered the alert
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}
