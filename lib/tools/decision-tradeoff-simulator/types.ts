/**
 * Types for Decision Trade-off Simulator
 */

/**
 * Trade-off dimensions that can be configured
 */
export type TradeoffDimension = 
  | 'performance-cost-latency'
  | 'speed-accuracy'
  | 'cost-coverage'
  | 'centralized-local'
  | 'realtime-batch'
  | 'personalization-privacy'
  | 'accuracy-diversity'
  | 'shortterm-longterm'
  | 'rules-ml'
  | 'flexibility-consistency';

/**
 * Decision scenario type
 */
export type DecisionScenario = 
  | 'ai-model-selection'
  | 'architecture-design'
  | 'personalization-strategy'
  | 'decisioning-approach'
  | 'scalability-planning'
  | 'cost-optimization'
  | 'custom';

/**
 * Trade-off settings
 */
export interface TradeoffSettings {
  // Performance-Cost-Latency triangle (0-100 each, normalized)
  performanceWeight: number; // 0-100
  costWeight: number; // 0-100
  latencyWeight: number; // 0-100
  
  // Speed vs Accuracy (0-100, 0 = accuracy, 100 = speed)
  speedVsAccuracy: number;
  
  // Cost vs Coverage (0-100, 0 = coverage, 100 = cost savings)
  costVsCoverage: number;
  
  // Centralized vs Local (0-100, 0 = local, 100 = centralized)
  centralizedVsLocal: number;
  
  // Real-time vs Batch (0-100, 0 = batch, 100 = real-time)
  realtimeVsBatch: number;
  
  // Personalization vs Privacy (0-100, 0 = privacy, 100 = personalization)
  personalizationVsPrivacy: number;
  
  // Accuracy vs Diversity (0-100, 0 = diversity, 100 = accuracy)
  accuracyVsDiversity: number;
  
  // Short-term vs Long-term (0-100, 0 = long-term, 100 = short-term)
  shorttermVsLongterm: number;
  
  // Rules vs ML (0-100, 0 = rules, 100 = ML)
  rulesVsMl: number;
  
  // Flexibility vs Consistency (0-100, 0 = consistency, 100 = flexibility)
  flexibilityVsConsistency: number;
}

/**
 * Simulation result metrics
 */
export interface SimulationResult {
  // Core metrics
  totalCost: number; // Monthly cost estimate
  averageLatency: number; // Milliseconds
  performanceScore: number; // 0-100
  
  // Quality metrics
  accuracyScore: number; // 0-100
  reliabilityScore: number; // 0-100
  scalabilityScore: number; // 0-100
  
  // Business metrics
  timeToMarket: number; // Days
  maintenanceComplexity: number; // 0-100 (higher = more complex)
  riskScore: number; // 0-100 (higher = more risk)
  
  // User experience metrics
  userSatisfaction: number; // 0-100
  personalizationLevel: number; // 0-100
  
  // Operational metrics
  operationalEfficiency: number; // 0-100
  flexibilityScore: number; // 0-100
  
  // Composite scores
  overallScore: number; // 0-100 weighted composite
  costEfficiencyScore: number; // 0-100 (performance per dollar)
}

/**
 * Snapshot of a scenario configuration and results
 */
export interface ScenarioSnapshot {
  id: string;
  name: string;
  timestamp: Date;
  scenario: DecisionScenario;
  settings: TradeoffSettings;
  result: SimulationResult;
  notes?: string;
}

/**
 * Comparison between two scenarios
 */
export interface ScenarioComparison {
  scenarioA: ScenarioSnapshot;
  scenarioB: ScenarioSnapshot;
  differences: {
    metric: keyof SimulationResult;
    difference: number;
    percentageChange: number;
  }[];
}
