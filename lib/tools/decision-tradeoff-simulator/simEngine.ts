/**
 * Simulation engine for Decision Trade-off Simulator
 */

import type { TradeoffSettings, SimulationResult, DecisionScenario } from './types';

/**
 * Calculate simulation result based on trade-off settings
 */
export function runSimulation(
  settings: TradeoffSettings,
  scenario: DecisionScenario = 'custom'
): SimulationResult {
  // Normalize performance-cost-latency weights
  const totalWeight = settings.performanceWeight + settings.costWeight + settings.latencyWeight;
  const normalizedPerf = totalWeight > 0 ? settings.performanceWeight / totalWeight : 0.33;
  const normalizedCost = totalWeight > 0 ? settings.costWeight / totalWeight : 0.33;
  const normalizedLatency = totalWeight > 0 ? settings.latencyWeight / totalWeight : 0.34;

  // Base calculations
  const speedFactor = settings.speedVsAccuracy / 100;
  const accuracyFactor = 1 - speedFactor;
  
  const costSavingsFactor = settings.costVsCoverage / 100;
  const coverageFactor = 1 - costSavingsFactor;
  
  const centralizedFactor = settings.centralizedVsLocal / 100;
  const localFactor = 1 - centralizedFactor;
  
  const realtimeFactor = settings.realtimeVsBatch / 100;
  const batchFactor = 1 - realtimeFactor;
  
  const personalizationFactor = settings.personalizationVsPrivacy / 100;
  const privacyFactor = 1 - personalizationFactor;
  
  const accuracyFactor2 = settings.accuracyVsDiversity / 100;
  const diversityFactor = 1 - accuracyFactor2;
  
  const shorttermFactor = settings.shorttermVsLongterm / 100;
  const longtermFactor = 1 - shorttermFactor;
  
  const mlFactor = settings.rulesVsMl / 100;
  const rulesFactor = 1 - mlFactor;
  
  const flexibilityFactor = settings.flexibilityVsConsistency / 100;
  const consistencyFactor = 1 - flexibilityFactor;

  // Calculate Total Cost (monthly, in thousands)
  // Base cost scales with performance, real-time, ML usage, and coverage
  const baseCost = 10; // Base $10k/month
  const performanceCost = normalizedPerf * 20; // Higher performance = higher cost
  const realtimeCost = realtimeFactor * 15; // Real-time is more expensive
  const mlCost = mlFactor * 25; // ML models cost more
  const coverageCost = coverageFactor * 10; // More coverage = more cost
  const totalCost = baseCost + performanceCost + realtimeCost + mlCost + coverageCost;

  // Calculate Average Latency (milliseconds)
  // Lower latency with batch, rules-based, and lower performance requirements
  const baseLatency = 100; // Base 100ms
  const performanceLatency = normalizedPerf * 200; // Higher performance = lower latency
  const batchLatency = batchFactor * 500; // Batch adds latency
  const mlLatency = mlFactor * 300; // ML adds latency
  const centralizedLatency = centralizedFactor * 50; // Centralized can add network latency
  const averageLatency = baseLatency + performanceLatency + batchLatency + mlLatency + centralizedLatency;

  // Calculate Performance Score (0-100)
  const performanceScore = Math.min(100, normalizedPerf * 100 + accuracyFactor * 30 + realtimeFactor * 20);

  // Calculate Accuracy Score (0-100)
  const accuracyScore = Math.min(100, accuracyFactor * 100 + mlFactor * 20 - speedFactor * 30);

  // Calculate Reliability Score (0-100)
  const reliabilityScore = Math.min(100, rulesFactor * 40 + consistencyFactor * 30 + longtermFactor * 30);

  // Calculate Scalability Score (0-100)
  const scalabilityScore = Math.min(100, centralizedFactor * 40 + batchFactor * 30 + mlFactor * 30);

  // Calculate Time to Market (days)
  const baseTimeToMarket = 30;
  const rulesTimeToMarket = rulesFactor * -10; // Rules faster to implement
  const mlTimeToMarket = mlFactor * 20; // ML takes longer
  const flexibilityTimeToMarket = flexibilityFactor * -5; // Flexibility can speed up
  const timeToMarket = Math.max(5, baseTimeToMarket + rulesTimeToMarket + mlTimeToMarket + flexibilityTimeToMarket);

  // Calculate Maintenance Complexity (0-100)
  const maintenanceComplexity = Math.min(100, 
    mlFactor * 40 + 
    flexibilityFactor * 30 + 
    centralizedFactor * 20 + 
    realtimeFactor * 10
  );

  // Calculate Risk Score (0-100)
  const riskScore = Math.min(100,
    mlFactor * 30 + // ML can be unpredictable
    flexibilityFactor * 20 + // Flexibility can introduce risk
    shorttermFactor * 25 + // Short-term focus can create long-term risk
    (1 - privacyFactor) * 15 + // Less privacy = more risk
    (1 - reliabilityScore / 100) * 10
  );

  // Calculate User Satisfaction (0-100)
  const userSatisfaction = Math.min(100,
    personalizationFactor * 40 +
    accuracyFactor * 30 +
    (1 - averageLatency / 1000) * 20 + // Lower latency = better UX
    diversityFactor * 10
  );

  // Calculate Personalization Level (0-100)
  const personalizationLevel = Math.min(100, personalizationFactor * 100);

  // Calculate Operational Efficiency (0-100)
  const operationalEfficiency = Math.min(100,
    centralizedFactor * 30 +
    batchFactor * 25 +
    consistencyFactor * 25 +
    (1 - maintenanceComplexity / 100) * 20
  );

  // Calculate Flexibility Score (0-100)
  const flexibilityScore = Math.min(100, flexibilityFactor * 100);

  // Calculate Cost Efficiency Score (performance per dollar)
  const costEfficiencyScore = Math.min(100, (performanceScore / Math.max(1, totalCost / 10)) * 10);

  // Calculate Overall Score (weighted composite)
  const overallScore = Math.min(100,
    (performanceScore * 0.20) +
    (accuracyScore * 0.15) +
    (reliabilityScore * 0.15) +
    (userSatisfaction * 0.15) +
    (costEfficiencyScore * 0.15) +
    ((100 - riskScore) * 0.10) +
    (scalabilityScore * 0.10)
  );

  return {
    totalCost,
    averageLatency,
    performanceScore,
    accuracyScore,
    reliabilityScore,
    scalabilityScore,
    timeToMarket,
    maintenanceComplexity,
    riskScore,
    userSatisfaction,
    personalizationLevel,
    operationalEfficiency,
    flexibilityScore,
    overallScore,
    costEfficiencyScore,
  };
}

/**
 * Get default settings for a scenario type
 */
export function getDefaultSettings(scenario: DecisionScenario): TradeoffSettings {
  switch (scenario) {
    case 'ai-model-selection':
      return {
        performanceWeight: 40,
        costWeight: 30,
        latencyWeight: 30,
        speedVsAccuracy: 30, // Favor accuracy
        costVsCoverage: 50,
        centralizedVsLocal: 70, // Centralized models
        realtimeVsBatch: 80, // Real-time inference
        personalizationVsPrivacy: 60,
        accuracyVsDiversity: 70, // Favor accuracy
        shorttermVsLongterm: 40, // Balance
        rulesVsMl: 80, // ML-driven
        flexibilityVsConsistency: 40,
      };
    
    case 'architecture-design':
      return {
        performanceWeight: 35,
        costWeight: 35,
        latencyWeight: 30,
        speedVsAccuracy: 50,
        costVsCoverage: 50,
        centralizedVsLocal: 60,
        realtimeVsBatch: 50,
        personalizationVsPrivacy: 50,
        accuracyVsDiversity: 50,
        shorttermVsLongterm: 50,
        rulesVsMl: 50,
        flexibilityVsConsistency: 50,
      };
    
    case 'personalization-strategy':
      return {
        performanceWeight: 30,
        costWeight: 40,
        latencyWeight: 30,
        speedVsAccuracy: 40,
        costVsCoverage: 60, // Favor cost
        centralizedVsLocal: 70,
        realtimeVsBatch: 70, // Real-time personalization
        personalizationVsPrivacy: 70, // Favor personalization
        accuracyVsDiversity: 60, // Favor accuracy
        shorttermVsLongterm: 50,
        rulesVsMl: 70, // ML for personalization
        flexibilityVsConsistency: 60,
      };
    
    case 'decisioning-approach':
      return {
        performanceWeight: 40,
        costWeight: 30,
        latencyWeight: 30,
        speedVsAccuracy: 60, // Favor speed for decisions
        costVsCoverage: 50,
        centralizedVsLocal: 50,
        realtimeVsBatch: 70, // Real-time decisions
        personalizationVsPrivacy: 50,
        accuracyVsDiversity: 50,
        shorttermVsLongterm: 50,
        rulesVsMl: 50,
        flexibilityVsConsistency: 50,
      };
    
    case 'scalability-planning':
      return {
        performanceWeight: 35,
        costWeight: 40,
        latencyWeight: 25,
        speedVsAccuracy: 50,
        costVsCoverage: 40, // Favor coverage
        centralizedVsLocal: 80, // Centralized for scale
        realtimeVsBatch: 40, // Batch for scale
        personalizationVsPrivacy: 50,
        accuracyVsDiversity: 50,
        shorttermVsLongterm: 30, // Long-term focus
        rulesVsMl: 60,
        flexibilityVsConsistency: 40, // Consistency for scale
      };
    
    case 'cost-optimization':
      return {
        performanceWeight: 25,
        costWeight: 50,
        latencyWeight: 25,
        speedVsAccuracy: 50,
        costVsCoverage: 70, // Favor cost savings
        centralizedVsLocal: 50,
        realtimeVsBatch: 30, // Batch for cost savings
        personalizationVsPrivacy: 30, // Favor privacy (less data = less cost)
        accuracyVsDiversity: 50,
        shorttermVsLongterm: 50,
        rulesVsMl: 30, // Rules are cheaper
        flexibilityVsConsistency: 50,
      };
    
    default: // 'custom'
      return {
        performanceWeight: 33,
        costWeight: 33,
        latencyWeight: 34,
        speedVsAccuracy: 50,
        costVsCoverage: 50,
        centralizedVsLocal: 50,
        realtimeVsBatch: 50,
        personalizationVsPrivacy: 50,
        accuracyVsDiversity: 50,
        shorttermVsLongterm: 50,
        rulesVsMl: 50,
        flexibilityVsConsistency: 50,
      };
  }
}
