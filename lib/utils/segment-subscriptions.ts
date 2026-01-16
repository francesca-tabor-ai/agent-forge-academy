/**
 * Segment subscription utilities
 * Maps segments to Stripe product/price IDs using content/subscriptions.md
 */

import type { Segment, SegmentType } from '@/lib/types/segment';
import { getSegmentKey } from '@/lib/types/segment';
import { getSubscriptionMetadata } from './subscription-metadata';

export interface SegmentSubscriptionConfig {
  productId: string;
  monthlyPriceId: string;
  annualPriceId: string;
  monthlyPrice: number; // in pence/cents
  annualPrice: number; // in pence/cents
  marketingCopy: string;
  displayPriceMonthly: string; // e.g., "£49/mo"
  displayPriceAnnual: string; // e.g., "£490/yr"
  currency: string;
  marketingBullets: string[];
}

/**
 * Parse display price string (e.g., "£49/mo") to pence
 */
function parsePriceToPence(priceStr: string): number {
  // Remove currency symbols and extract number
  const match = priceStr.match(/[\d,]+\.?\d*/);
  if (!match) return 0;
  
  const numStr = match[0].replace(/,/g, '');
  const num = parseFloat(numStr);
  
  // If it's monthly, multiply by 12 for annual comparison
  // But we want the actual price, so just convert to pence
  return Math.round(num * 100);
}

/**
 * Get subscription config for a segment from content/subscriptions.md
 */
export function getSegmentSubscriptionConfig(segment: Segment): SegmentSubscriptionConfig | null {
  const metadata = getSubscriptionMetadata(segment.type, segment.key);
  
  if (!metadata) {
    // Fallback to default if not found in subscriptions.md
    return {
      productId: `prod_${segment.type}_${segment.key}`,
      monthlyPriceId: `price_monthly_${segment.type}_${segment.key}`,
      annualPriceId: `price_annual_${segment.type}_${segment.key}`,
      monthlyPrice: 4900, // £49 in pence
      annualPrice: 49000, // £490 in pence
      marketingCopy: `Subscribe to ${segment.displayName} and get access to ${segment.includedCourseSlugs.length} courses.`,
      displayPriceMonthly: '£49/mo',
      displayPriceAnnual: '£490/yr',
      currency: 'GBP',
      marketingBullets: [],
    };
  }
  
  // Parse prices from display strings
  const monthlyPrice = parsePriceToPence(metadata.displayPriceMonthly);
  const annualPrice = parsePriceToPence(metadata.displayPriceAnnual);
  
  // Parse marketing bullets (semicolon-separated)
  const marketingBullets = metadata.marketingBullets
    .split(';')
    .map(b => b.trim())
    .filter(b => b.length > 0);
  
  return {
    productId: metadata.stripeProductId,
    monthlyPriceId: metadata.stripeMonthlyPriceId,
    annualPriceId: metadata.stripeAnnualPriceId,
    monthlyPrice,
    annualPrice,
    marketingCopy: `Subscribe to ${segment.displayName} and get access to ${segment.includedCourseSlugs.length} courses.`,
    displayPriceMonthly: metadata.displayPriceMonthly,
    displayPriceAnnual: metadata.displayPriceAnnual,
    currency: metadata.currency,
    marketingBullets,
  };
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
