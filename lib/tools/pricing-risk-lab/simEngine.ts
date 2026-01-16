/**
 * Pricing & Risk Lab - Simulation Engine
 * 
 * Deterministic simulation engine that calculates pricing and risk metrics.
 * Same inputs always produce the same outputs (seeded pseudo-random).
 */

import type {
  Market,
  Segment,
  Channel,
  PaymentMethod,
  PricingScenario,
  SimulationSettings,
  SimulationResult,
  RiskScoreDistribution,
  PricingTier,
  Discount,
  RegionalOverride,
} from './types';

/**
 * Simulation inputs
 */
export interface SimulationInputs {
  market: Market;
  segment: Segment;
  channel: Channel;
  paymentMethod: PaymentMethod;
  pricingScenario: PricingScenario;
  settings: SimulationSettings;
  baselinePrice?: number; // Optional baseline price for comparison
  quantity?: number; // Optional quantity for tier selection
}

/**
 * Deterministic random number generator (seeded)
 * Uses a hash of inputs to generate a consistent seed
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate a random number between 0 and 1
   */
  random(): number {
    // Linear congruential generator
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate a random number between min and max
   */
  randomRange(min: number, max: number): number {
    return min + this.random() * (max - min);
  }
}

/**
 * Generate a deterministic seed from simulation inputs
 */
function generateSeed(inputs: SimulationInputs): number {
  const marketHash = inputs.market.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const segmentHash = inputs.segment.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const channelHash = inputs.channel.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const paymentHash = inputs.paymentMethod.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const scenarioHash = inputs.pricingScenario.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const settingsHash = 
    (inputs.settings.riskTolerance === 'low' ? 1 : inputs.settings.riskTolerance === 'medium' ? 2 : 3) * 1000 +
    inputs.settings.approvalThreshold * 100 +
    inputs.settings.fraudStrictness * 10 +
    inputs.settings.timeHorizon;
  
  return (marketHash + segmentHash + channelHash + paymentHash + scenarioHash + settingsHash) % 2147483647;
}

/**
 * Select the appropriate pricing tier based on quantity
 */
function selectPricingTier(tiers: PricingTier[], quantity: number = 1): PricingTier {
  // Find the first tier that matches the quantity range
  for (const tier of tiers) {
    const minQty = tier.minQuantity ?? 1;
    const maxQty = tier.maxQuantity ?? Infinity;
    if (quantity >= minQty && quantity <= maxQty) {
      return tier;
    }
  }
  // Default to the first tier if none match
  return tiers[0] || { name: 'Default', price: 0 };
}

/**
 * Calculate effective price after discounts and regional overrides
 */
function calculateEffectivePrice(
  basePrice: number,
  inputs: SimulationInputs,
  random: SeededRandom
): number {
  let price = basePrice;
  
  // Apply regional override if applicable
  const regionalOverride = inputs.pricingScenario.regionalOverrides.find(
    (ro) => ro.marketCode === inputs.market.code
  );
  if (regionalOverride) {
    price = price * (1 + regionalOverride.priceAdjustment / 100);
  }
  
  // Check for applicable discounts
  const applicableDiscounts = inputs.pricingScenario.discounts.filter((discount) => {
    // Check segment eligibility
    if (discount.applicableSegments && !discount.applicableSegments.includes(inputs.segment.name)) {
      return false;
    }
    // Check market eligibility
    if (discount.applicableMarkets && !discount.applicableMarkets.includes(inputs.market.code)) {
      return false;
    }
    // Check minimum purchase (using base price * quantity as proxy)
    if (discount.minPurchase && price * (inputs.quantity || 1) < discount.minPurchase) {
      return false;
    }
    return true;
  });
  
  // Apply the best discount (highest value)
  if (applicableDiscounts.length > 0) {
    let bestDiscount = applicableDiscounts[0];
    let bestDiscountValue = 0;
    
    for (const discount of applicableDiscounts) {
      let discountValue = 0;
      if (discount.type === 'percentage') {
        discountValue = price * (discount.value / 100);
      } else {
        discountValue = discount.value;
      }
      if (discountValue > bestDiscountValue) {
        bestDiscountValue = discountValue;
        bestDiscount = discount;
      }
    }
    
    if (bestDiscount.type === 'percentage') {
      price = price * (1 - bestDiscount.value / 100);
    } else {
      price = Math.max(0, price - bestDiscount.value);
    }
  }
  
  return Math.max(0, price); // Ensure non-negative
}

/**
 * Calculate conversion rate based on price and segment sensitivity
 */
function calculateConversionRate(
  inputs: SimulationInputs,
  effectivePrice: number,
  baselinePrice: number
): number {
  // Start with market baseline conversion
  let conversionRate = inputs.market.baselineConversion;
  
  // Apply channel modifier
  conversionRate = conversionRate * inputs.channel.baselineConversionModifier;
  
  // Apply price impact based on segment price sensitivity
  // Higher prices reduce conversion, more so for price-sensitive segments
  const priceChange = (effectivePrice - baselinePrice) / baselinePrice;
  const priceImpact = -priceChange * inputs.segment.priceSensitivity;
  conversionRate = conversionRate * (1 + priceImpact);
  
  // Ensure conversion rate stays within reasonable bounds (0-1)
  return Math.max(0, Math.min(1, conversionRate));
}

/**
 * Calculate fraud rate based on segment risk and payment method
 */
function calculateFraudRate(inputs: SimulationInputs): number {
  // Start with market baseline fraud rate
  let fraudRate = inputs.market.baselineFraudRate;
  
  // Apply segment risk profile modifier
  const riskModifier = inputs.segment.riskProfile === 'low' ? 0.7 : 
                       inputs.segment.riskProfile === 'medium' ? 1.0 : 1.5;
  fraudRate = fraudRate * riskModifier;
  
  // Apply payment method fraud modifier
  fraudRate = fraudRate * inputs.paymentMethod.fraudModifier;
  
  // Apply fraud strictness (higher strictness = lower actual fraud due to better detection)
  // But this also affects false positives
  fraudRate = fraudRate * (1 - inputs.settings.fraudStrictness * 0.3);
  
  return Math.max(0, Math.min(1, fraudRate));
}

/**
 * Calculate approval and decline rates
 */
function calculateApprovalDeclineRates(
  inputs: SimulationInputs,
  fraudRate: number
): { approvalRate: number; declineRate: number } {
  // Base approval rate from payment method
  let approvalRate = 0.95 * inputs.paymentMethod.approvalModifier; // 95% baseline
  
  // Adjust based on approval threshold setting
  // Lower threshold = more approvals
  const thresholdAdjustment = (0.95 - inputs.settings.approvalThreshold) * 0.5;
  approvalRate = approvalRate + thresholdAdjustment;
  
  // Fraud strictness reduces approval rate (stricter = more declines)
  approvalRate = approvalRate * (1 - inputs.settings.fraudStrictness * 0.2);
  
  // Ensure reasonable bounds
  approvalRate = Math.max(0.5, Math.min(0.99, approvalRate));
  
  const declineRate = 1 - approvalRate;
  
  return { approvalRate, declineRate };
}

/**
 * Calculate false positive and false negative rates
 */
function calculateFalsePositiveNegativeRates(
  inputs: SimulationInputs,
  fraudRate: number,
  declineRate: number
): { fpRate: number; fnRate: number } {
  // False positive rate: legitimate transactions declined
  // Higher fraud strictness = more false positives
  const baseFPRate = declineRate * 0.3; // 30% of declines are false positives at baseline
  const fpRate = baseFPRate * (1 + inputs.settings.fraudStrictness * 2);
  
  // False negative rate: fraudulent transactions approved
  // Higher fraud strictness = fewer false negatives
  const fnRate = fraudRate * (1 - inputs.settings.fraudStrictness * 0.8);
  
  return {
    fpRate: Math.max(0, Math.min(1, fpRate)),
    fnRate: Math.max(0, Math.min(1, fnRate)),
  };
}

/**
 * Calculate friction score (0-1, higher = more friction)
 */
function calculateFrictionScore(
  declineRate: number,
  fpRate: number,
  inputs: SimulationInputs
): number {
  // Friction from declines
  const declineFriction = declineRate * 0.6;
  
  // Friction from false positives (legitimate users declined)
  const falsePositiveFriction = fpRate * 0.4;
  
  // Additional friction from payment method issues
  const paymentFriction = (1 - inputs.paymentMethod.approvalModifier) * 0.2;
  
  const frictionScore = declineFriction + falsePositiveFriction + paymentFriction;
  
  return Math.max(0, Math.min(1, frictionScore));
}

/**
 * Generate risk score distribution (bucketed 0-100)
 */
function generateRiskScoreDistribution(
  inputs: SimulationInputs,
  fraudRate: number,
  random: SeededRandom
): RiskScoreDistribution[] {
  const buckets: RiskScoreDistribution[] = [
    { range: '0-20', count: 0, percentage: 0 },
    { range: '21-40', count: 0, percentage: 0 },
    { range: '41-60', count: 0, percentage: 0 },
    { range: '61-80', count: 0, percentage: 0 },
    { range: '81-100', count: 0, percentage: 0 },
  ];
  
  // Simulate 1000 transactions to generate distribution
  const numTransactions = 1000;
  const transactions: number[] = [];
  
  for (let i = 0; i < numTransactions; i++) {
    // Base risk score influenced by segment risk profile
    let riskScore = random.randomRange(0, 100);
    
    // Adjust based on segment risk
    if (inputs.segment.riskProfile === 'high') {
      riskScore = riskScore * 0.7 + 30; // Shift higher
    } else if (inputs.segment.riskProfile === 'low') {
      riskScore = riskScore * 0.6; // Shift lower
    }
    
    // Adjust based on payment method fraud modifier
    riskScore = riskScore * (0.5 + inputs.paymentMethod.fraudModifier * 0.3);
    
    // Adjust based on fraud strictness (stricter = higher scores)
    riskScore = riskScore * (1 + inputs.settings.fraudStrictness * 0.2);
    
    riskScore = Math.max(0, Math.min(100, riskScore));
    transactions.push(riskScore);
  }
  
  // Bucket the transactions
  for (const score of transactions) {
    if (score <= 20) {
      buckets[0].count++;
    } else if (score <= 40) {
      buckets[1].count++;
    } else if (score <= 60) {
      buckets[2].count++;
    } else if (score <= 80) {
      buckets[3].count++;
    } else {
      buckets[4].count++;
    }
  }
  
  // Calculate percentages
  for (const bucket of buckets) {
    bucket.percentage = (bucket.count / numTransactions) * 100;
  }
  
  return buckets;
}

/**
 * Run the simulation with given inputs
 */
export function runSimulation(inputs: SimulationInputs): SimulationResult {
  // Generate deterministic seed
  const seed = generateSeed(inputs);
  const random = new SeededRandom(seed);
  
  // Select pricing tier
  const tier = selectPricingTier(inputs.pricingScenario.tiers, inputs.quantity);
  const baselinePrice = inputs.baselinePrice || tier.price;
  
  // Calculate effective price
  const effectivePrice = calculateEffectivePrice(tier.price, inputs, random);
  
  // Calculate conversion rate
  const conversionRate = calculateConversionRate(inputs, effectivePrice, baselinePrice);
  
  // Calculate fraud rate
  const fraudRate = calculateFraudRate(inputs);
  
  // Calculate approval and decline rates
  const { approvalRate, declineRate } = calculateApprovalDeclineRates(inputs, fraudRate);
  
  // Calculate false positive and false negative rates
  const { fpRate, fnRate } = calculateFalsePositiveNegativeRates(inputs, fraudRate, declineRate);
  
  // Calculate revenue metrics
  // Simulate 10,000 visitors
  const numVisitors = 10000;
  const numConversions = Math.floor(numVisitors * conversionRate);
  const numApprovals = Math.floor(numConversions * approvalRate);
  
  const rpu = effectivePrice; // Revenue per user (converted)
  const revenue = numApprovals * rpu;
  
  // Calculate fraud exposure and loss
  const fraudExposure = numConversions * rpu * fraudRate;
  const fraudLoss = numApprovals * rpu * fnRate; // Only approved fraudulent transactions cause loss
  
  // Calculate friction score
  const frictionScore = calculateFrictionScore(declineRate, fpRate, inputs);
  
  // Generate risk score distribution
  const riskScoreDistribution = generateRiskScoreDistribution(inputs, fraudRate, random);
  
  // Ensure all rates are valid (no NaNs, no negatives)
  const result: SimulationResult = {
    conversionRate: isNaN(conversionRate) ? 0 : Math.max(0, conversionRate),
    rpu: isNaN(rpu) ? 0 : Math.max(0, rpu),
    revenue: isNaN(revenue) ? 0 : Math.max(0, revenue),
    fraudExposure: isNaN(fraudExposure) ? 0 : Math.max(0, fraudExposure),
    fraudLoss: isNaN(fraudLoss) ? 0 : Math.max(0, fraudLoss),
    approvalRate: isNaN(approvalRate) ? 0 : Math.max(0, Math.min(1, approvalRate)),
    declineRate: isNaN(declineRate) ? 0 : Math.max(0, Math.min(1, declineRate)),
    fpRate: isNaN(fpRate) ? 0 : Math.max(0, Math.min(1, fpRate)),
    fnRate: isNaN(fnRate) ? 0 : Math.max(0, Math.min(1, fnRate)),
    frictionScore: isNaN(frictionScore) ? 0 : Math.max(0, Math.min(1, frictionScore)),
    riskScoreDistribution,
  };
  
  return result;
}

/**
 * Compare baseline vs scenario simulation results
 */
export interface ComparisonResult {
  baseline: SimulationResult;
  scenario: SimulationResult;
  differences: {
    conversionRate: number;
    rpu: number;
    revenue: number;
    fraudExposure: number;
    fraudLoss: number;
    approvalRate: number;
    declineRate: number;
    fpRate: number;
    fnRate: number;
    frictionScore: number;
  };
}

export function compareSimulations(
  baselineInputs: SimulationInputs,
  scenarioInputs: SimulationInputs
): ComparisonResult {
  const baseline = runSimulation(baselineInputs);
  const scenario = runSimulation(scenarioInputs);
  
  return {
    baseline,
    scenario,
    differences: {
      conversionRate: scenario.conversionRate - baseline.conversionRate,
      rpu: scenario.rpu - baseline.rpu,
      revenue: scenario.revenue - baseline.revenue,
      fraudExposure: scenario.fraudExposure - baseline.fraudExposure,
      fraudLoss: scenario.fraudLoss - baseline.fraudLoss,
      approvalRate: scenario.approvalRate - baseline.approvalRate,
      declineRate: scenario.declineRate - baseline.declineRate,
      fpRate: scenario.fpRate - baseline.fpRate,
      fnRate: scenario.fnRate - baseline.fnRate,
      frictionScore: scenario.frictionScore - baseline.frictionScore,
    },
  };
}
