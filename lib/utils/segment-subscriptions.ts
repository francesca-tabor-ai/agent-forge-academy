/**
 * Segment subscription utilities
 * Maps segments to Stripe product/price IDs
 * 
 * Note: This is a placeholder implementation.
 * Replace with actual Stripe product/price IDs from STRIPE_SEGMENT_PRODUCTS.md
 * after creating products in Stripe Dashboard.
 */

import type { Segment, SegmentType } from '@/lib/types/segment';
import { getSegmentKey } from '@/lib/types/segment';

export interface SegmentSubscriptionConfig {
  productId: string;
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number; // in pence/cents
  annualPrice: number; // in pence/cents
  marketingCopy: string;
}

/**
 * Get subscription config for a segment
 * 
 * TODO: Replace placeholder IDs with actual Stripe product/price IDs
 * from STRIPE_SEGMENT_PRODUCTS.md after creating products in Stripe Dashboard
 */
export function getSegmentSubscriptionConfig(segment: Segment): SegmentSubscriptionConfig | null {
  const key = segment.key;
  const type = segment.type;
  
  // Placeholder implementation - replace with actual Stripe IDs
  // For now, return a default config structure
  const baseConfig: SegmentSubscriptionConfig = {
    productId: `prod_${type}_${key}`,
    monthlyPriceId: `price_monthly_${type}_${key}`,
    annualPriceId: `price_annual_${type}_${key}`,
    monthlyPrice: 4900, // £49 in pence
    annualPrice: 49000, // £490 in pence (save £98)
    marketingCopy: `Subscribe to ${segment.displayName} and get access to ${segment.includedCourseSlugs.length} courses.`,
  };
  
  // Type-specific pricing adjustments
  if (type === 'track') {
    // Tracks: £39-£59/month depending on track
    if (key.includes('ml-engineering') || key.includes('platform-engineering')) {
      baseConfig.monthlyPrice = 5900; // £59
      baseConfig.annualPrice = 59000; // £590
    } else if (key.includes('media-content') || key.includes('trust-regulation') || key.includes('vibe-engineering')) {
      baseConfig.monthlyPrice = 3900; // £39
      baseConfig.annualPrice = 39000; // £390
    }
  } else if (type === 'industry') {
    // Industries: £39-£59/month depending on industry
    if (key.includes('finance') || key.includes('healthcare') || key.includes('fintech')) {
      baseConfig.monthlyPrice = 5900; // £59
      baseConfig.annualPrice = 59000; // £590
    } else if (key.includes('media-publishing')) {
      baseConfig.monthlyPrice = 3900; // £39
      baseConfig.annualPrice = 39000; // £390
    }
  } else if (type === 'role') {
    // Roles: £39-£79/month depending on role
    if (key.includes('executive')) {
      baseConfig.monthlyPrice = 7900; // £79
      baseConfig.annualPrice = 79000; // £790
    } else if (key.includes('engineer') || key.includes('data-scientist') || key.includes('leader') || key.includes('director')) {
      baseConfig.monthlyPrice = 5900; // £59
      baseConfig.annualPrice = 59000; // £590
    } else if (key.includes('designer')) {
      baseConfig.monthlyPrice = 3900; // £39
      baseConfig.annualPrice = 39000; // £390
    }
  }
  
  return baseConfig;
}

/**
 * Get billing cycle from price ID
 */
export function getBillingCycleFromPriceId(priceId: string): 'monthly' | 'annual' {
  return priceId.includes('annual') ? 'annual' : 'monthly';
}

/**
 * Format price for display
 */
export function formatPrice(pence: number): string {
  return `£${(pence / 100).toFixed(0)}`;
}

/**
 * Calculate annual savings
 */
export function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  return monthlyTotal - annualPrice;
}
