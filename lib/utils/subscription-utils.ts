/**
 * Client-safe subscription utility functions
 * These functions don't require server-only dependencies
 */

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

/**
 * Get billing cycle from price ID
 */
export function getBillingCycleFromPriceId(priceId: string): 'monthly' | 'annual' {
  return priceId.includes('annual') ? 'annual' : 'monthly';
}
