/**
 * Pricing & Risk Lab - Simulation Engine Tests
 * 
 * Tests for deterministic behavior and output validation
 */

import { runSimulation, compareSimulations } from './simEngine';
import { DEFAULT_MARKETS, DEFAULT_SEGMENTS, DEFAULT_CHANNELS, DEFAULT_PAYMENT_METHODS, DEFAULT_PRICING_SCENARIO } from './defaults';
import type { SimulationInputs } from './simEngine';

/**
 * Test that same inputs produce same outputs (deterministic)
 */
function testDeterministic() {
  const inputs: SimulationInputs = {
    market: DEFAULT_MARKETS[0], // US
    segment: DEFAULT_SEGMENTS[0], // Enterprise
    channel: DEFAULT_CHANNELS[0], // Organic Search
    paymentMethod: DEFAULT_PAYMENT_METHODS[0], // Credit Card
    pricingScenario: DEFAULT_PRICING_SCENARIO,
    settings: {
      riskTolerance: 'medium',
      approvalThreshold: 0.90,
      fraudStrictness: 0.5,
      timeHorizon: 30,
    },
    quantity: 1,
  };
  
  const result1 = runSimulation(inputs);
  const result2 = runSimulation(inputs);
  
  // Check that results are identical
  const isDeterministic = 
    result1.conversionRate === result2.conversionRate &&
    result1.rpu === result2.rpu &&
    result1.revenue === result2.revenue &&
    result1.fraudExposure === result2.fraudExposure &&
    result1.fraudLoss === result2.fraudLoss &&
    result1.approvalRate === result2.approvalRate &&
    result1.declineRate === result2.declineRate &&
    result1.fpRate === result2.fpRate &&
    result1.fnRate === result2.fnRate &&
    result1.frictionScore === result2.frictionScore;
  
  console.log('Deterministic test:', isDeterministic ? 'PASS' : 'FAIL');
  return isDeterministic;
}

/**
 * Test that outputs change meaningfully when inputs change
 */
function testInputSensitivity() {
  const baseInputs: SimulationInputs = {
    market: DEFAULT_MARKETS[0],
    segment: DEFAULT_SEGMENTS[0],
    channel: DEFAULT_CHANNELS[0],
    paymentMethod: DEFAULT_PAYMENT_METHODS[0],
    pricingScenario: DEFAULT_PRICING_SCENARIO,
    settings: {
      riskTolerance: 'medium',
      approvalThreshold: 0.90,
      fraudStrictness: 0.5,
      timeHorizon: 30,
    },
  };
  
  // Test 1: Higher price sensitivity segment should reduce conversion
  const highSensitivityInputs: SimulationInputs = {
    ...baseInputs,
    segment: DEFAULT_SEGMENTS[2], // Startup (high price sensitivity)
  };
  
  const baseResult = runSimulation(baseInputs);
  const highSensitivityResult = runSimulation(highSensitivityInputs);
  
  // Test 2: Higher fraud strictness should increase decline rate and fpRate
  const highStrictnessInputs: SimulationInputs = {
    ...baseInputs,
    settings: {
      ...baseInputs.settings,
      fraudStrictness: 0.9, // Much higher strictness
    },
  };
  
  const highStrictnessResult = runSimulation(highStrictnessInputs);
  
  // Test 3: Lower approval threshold should increase approval rate
  const lowThresholdInputs: SimulationInputs = {
    ...baseInputs,
    settings: {
      ...baseInputs.settings,
      approvalThreshold: 0.70, // Lower threshold
    },
  };
  
  const lowThresholdResult = runSimulation(lowThresholdInputs);
  
  const tests = [
    {
      name: 'High price sensitivity reduces conversion',
      pass: highSensitivityResult.conversionRate < baseResult.conversionRate,
    },
    {
      name: 'High fraud strictness increases decline rate',
      pass: highStrictnessResult.declineRate > baseResult.declineRate,
    },
    {
      name: 'High fraud strictness increases fpRate',
      pass: highStrictnessResult.fpRate > baseResult.fpRate,
    },
    {
      name: 'High fraud strictness reduces fnRate',
      pass: highStrictnessResult.fnRate < baseResult.fnRate,
    },
    {
      name: 'Lower approval threshold increases approval rate',
      pass: lowThresholdResult.approvalRate > baseResult.approvalRate,
    },
  ];
  
  const allPassed = tests.every((test) => test.pass);
  
  console.log('Input sensitivity tests:');
  tests.forEach((test) => {
    console.log(`  ${test.name}: ${test.pass ? 'PASS' : 'FAIL'}`);
  });
  
  return allPassed;
}

/**
 * Test that outputs are valid (no NaNs, no negatives, rates in 0-1)
 */
function testOutputValidity() {
  const inputs: SimulationInputs = {
    market: DEFAULT_MARKETS[0],
    segment: DEFAULT_SEGMENTS[0],
    channel: DEFAULT_CHANNELS[0],
    paymentMethod: DEFAULT_PAYMENT_METHODS[0],
    pricingScenario: DEFAULT_PRICING_SCENARIO,
    settings: {
      riskTolerance: 'medium',
      approvalThreshold: 0.90,
      fraudStrictness: 0.5,
      timeHorizon: 30,
    },
  };
  
  const result = runSimulation(inputs);
  
  const checks = [
    { name: 'conversionRate is not NaN', value: !isNaN(result.conversionRate) },
    { name: 'conversionRate >= 0', value: result.conversionRate >= 0 },
    { name: 'conversionRate <= 1', value: result.conversionRate <= 1 },
    { name: 'rpu is not NaN', value: !isNaN(result.rpu) },
    { name: 'rpu >= 0', value: result.rpu >= 0 },
    { name: 'revenue is not NaN', value: !isNaN(result.revenue) },
    { name: 'revenue >= 0', value: result.revenue >= 0 },
    { name: 'approvalRate is not NaN', value: !isNaN(result.approvalRate) },
    { name: 'approvalRate >= 0', value: result.approvalRate >= 0 },
    { name: 'approvalRate <= 1', value: result.approvalRate <= 1 },
    { name: 'declineRate is not NaN', value: !isNaN(result.declineRate) },
    { name: 'declineRate >= 0', value: result.declineRate >= 0 },
    { name: 'declineRate <= 1', value: result.declineRate <= 1 },
    { name: 'fpRate is not NaN', value: !isNaN(result.fpRate) },
    { name: 'fpRate >= 0', value: result.fpRate >= 0 },
    { name: 'fpRate <= 1', value: result.fpRate <= 1 },
    { name: 'fnRate is not NaN', value: !isNaN(result.fnRate) },
    { name: 'fnRate >= 0', value: result.fnRate >= 0 },
    { name: 'fnRate <= 1', value: result.fnRate <= 1 },
    { name: 'frictionScore is not NaN', value: !isNaN(result.frictionScore) },
    { name: 'frictionScore >= 0', value: result.frictionScore >= 0 },
    { name: 'frictionScore <= 1', value: result.frictionScore <= 1 },
    { name: 'fraudExposure >= 0', value: result.fraudExposure >= 0 },
    { name: 'fraudLoss >= 0', value: result.fraudLoss >= 0 },
    { name: 'riskScoreDistribution has 5 buckets', value: result.riskScoreDistribution.length === 5 },
  ];
  
  const allPassed = checks.every((check) => check.value);
  
  console.log('Output validity tests:');
  checks.forEach((check) => {
    if (!check.value) {
      console.log(`  ${check.name}: FAIL`);
    }
  });
  
  if (allPassed) {
    console.log('  All validity checks passed');
  }
  
  return allPassed;
}

/**
 * Run all tests
 */
export function runTests() {
  console.log('Running Pricing & Risk Lab simulation engine tests...\n');
  
  const deterministic = testDeterministic();
  console.log('');
  
  const sensitivity = testInputSensitivity();
  console.log('');
  
  const validity = testOutputValidity();
  console.log('');
  
  const allPassed = deterministic && sensitivity && validity;
  console.log(`Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return allPassed;
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}
