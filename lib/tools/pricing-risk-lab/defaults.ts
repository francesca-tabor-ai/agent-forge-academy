/**
 * Pricing & Risk Lab - Default Settings
 * 
 * Default markets, segments, channels, payment methods, and baseline pricing scenarios.
 * All data is realistic for demo purposes.
 */

import type {
  Market,
  Segment,
  Channel,
  PaymentMethod,
  PricingScenario,
} from './types';

/**
 * Default markets with realistic baseline metrics
 */
export const DEFAULT_MARKETS: Market[] = [
  {
    code: 'US',
    currency: 'USD',
    baselineConversion: 0.028, // 2.8% conversion rate
    baselineFraudRate: 0.012, // 1.2% fraud rate
  },
  {
    code: 'UK',
    currency: 'GBP',
    baselineConversion: 0.024, // 2.4% conversion rate
    baselineFraudRate: 0.018, // 1.8% fraud rate (slightly higher)
  },
  {
    code: 'DE',
    currency: 'EUR',
    baselineConversion: 0.022, // 2.2% conversion rate
    baselineFraudRate: 0.015, // 1.5% fraud rate
  },
];

/**
 * Default customer segments with realistic risk and price sensitivity profiles
 */
export const DEFAULT_SEGMENTS: Segment[] = [
  {
    name: 'Enterprise',
    riskProfile: 'low',
    priceSensitivity: 0.15, // Low price sensitivity (willing to pay more)
  },
  {
    name: 'SMB',
    riskProfile: 'medium',
    priceSensitivity: 0.45, // Moderate price sensitivity
  },
  {
    name: 'Startup',
    riskProfile: 'high',
    priceSensitivity: 0.75, // High price sensitivity (very price-conscious)
  },
  {
    name: 'Individual',
    riskProfile: 'high',
    priceSensitivity: 0.85, // Very high price sensitivity
  },
  {
    name: 'Non-profit',
    riskProfile: 'low',
    priceSensitivity: 0.35, // Moderate price sensitivity with low risk
  },
];

/**
 * Default acquisition channels with realistic conversion modifiers
 */
export const DEFAULT_CHANNELS: Channel[] = [
  {
    name: 'Organic Search',
    baselineConversionModifier: 1.15, // 15% higher conversion
  },
  {
    name: 'Paid Search',
    baselineConversionModifier: 1.05, // 5% higher conversion
  },
  {
    name: 'Social Media',
    baselineConversionModifier: 0.85, // 15% lower conversion
  },
  {
    name: 'Email Marketing',
    baselineConversionModifier: 1.25, // 25% higher conversion (warm leads)
  },
  {
    name: 'Direct',
    baselineConversionModifier: 1.10, // 10% higher conversion
  },
  {
    name: 'Referral',
    baselineConversionModifier: 1.30, // 30% higher conversion (trusted source)
  },
  {
    name: 'Partner',
    baselineConversionModifier: 0.95, // 5% lower conversion
  },
];

/**
 * Default payment methods with realistic approval and fraud modifiers
 */
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: 'Credit Card',
    approvalModifier: 0.98, // 98% of baseline approval (2% lower due to declines)
    fraudModifier: 1.2, // 20% higher fraud rate
  },
  {
    name: 'Debit Card',
    approvalModifier: 0.95, // 95% of baseline approval (5% lower)
    fraudModifier: 1.0, // Baseline fraud rate
  },
  {
    name: 'PayPal',
    approvalModifier: 0.92, // 92% of baseline approval (8% lower)
    fraudModifier: 0.8, // 20% lower fraud rate (PayPal's fraud protection)
  },
  {
    name: 'Bank Transfer',
    approvalModifier: 0.99, // 99% of baseline approval (very high)
    fraudModifier: 0.5, // 50% lower fraud rate (very secure)
  },
  {
    name: 'Apple Pay',
    approvalModifier: 0.97, // 97% of baseline approval
    fraudModifier: 0.7, // 30% lower fraud rate (biometric security)
  },
  {
    name: 'Google Pay',
    approvalModifier: 0.96, // 96% of baseline approval
    fraudModifier: 0.75, // 25% lower fraud rate
  },
  {
    name: 'Cryptocurrency',
    approvalModifier: 0.85, // 85% of baseline approval (lower adoption)
    fraudModifier: 2.5, // 150% higher fraud rate (higher risk)
  },
];

/**
 * Default baseline pricing scenario
 */
export const DEFAULT_PRICING_SCENARIO: PricingScenario = {
  id: 'baseline-001',
  name: 'Baseline Pricing',
  tiers: [
    {
      name: 'Starter',
      price: 29.00,
      minQuantity: 1,
      maxQuantity: 10,
    },
    {
      name: 'Professional',
      price: 79.00,
      minQuantity: 11,
      maxQuantity: 50,
    },
    {
      name: 'Enterprise',
      price: 199.00,
      minQuantity: 51,
      maxQuantity: undefined, // No upper limit
    },
  ],
  discounts: [
    {
      type: 'percentage',
      value: 10, // 10% off
      minPurchase: 500,
      applicableSegments: ['Enterprise', 'SMB'],
    },
    {
      type: 'percentage',
      value: 20, // 20% off
      minPurchase: 1000,
      applicableSegments: ['Enterprise'],
    },
    {
      type: 'fixed',
      value: 50, // $50 off
      minPurchase: 200,
      applicableSegments: ['Non-profit'],
    },
  ],
  regionalOverrides: [
    {
      marketCode: 'UK',
      priceAdjustment: 5, // 5% increase for UK (accounting for VAT, etc.)
    },
    {
      marketCode: 'DE',
      priceAdjustment: 8, // 8% increase for Germany
    },
  ],
};

/**
 * Export all defaults for UI use
 */
export {
  DEFAULT_MARKETS as markets,
  DEFAULT_SEGMENTS as segments,
  DEFAULT_CHANNELS as channels,
  DEFAULT_PAYMENT_METHODS as paymentMethods,
  DEFAULT_PRICING_SCENARIO as baselinePricingScenario,
};
