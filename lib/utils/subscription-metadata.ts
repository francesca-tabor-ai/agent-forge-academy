/**
 * Parse subscription metadata from content/subscriptions.md
 * 
 * Format: segment_type | segment_key | display_name | stripe_product_id | stripe_monthly_price_id | stripe_annual_price_id | display_price_monthly | display_price_annual | currency | marketing_bullets
 */

import 'server-only';

import { readFileSync } from 'fs';
import { join } from 'path';

export interface SubscriptionMetadata {
  segmentType: 'track' | 'industry' | 'role';
  segmentKey: string;
  displayName: string;
  stripeProductId: string;
  stripeMonthlyPriceId: string;
  stripeAnnualPriceId: string;
  displayPriceMonthly: string;
  displayPriceAnnual: string;
  currency: string;
  marketingBullets: string;
}

let cachedMetadata: Map<string, SubscriptionMetadata> | null = null;

/**
 * Parse subscriptions.md file and return a map of segment_key -> metadata
 */
function parseSubscriptionMetadata(): Map<string, SubscriptionMetadata> {
  if (cachedMetadata) {
    return cachedMetadata;
  }

  const metadata = new Map<string, SubscriptionMetadata>();

  try {
    const filePath = join(process.cwd(), 'content', 'subscriptions.md');
    const content = readFileSync(filePath, 'utf-8');
    
    let currentSection: 'track' | 'industry' | 'role' | null = null;
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and markdown headers
      if (!trimmed || trimmed.startsWith('#')) {
        // Detect section changes
        if (trimmed.includes('TRACK SUBSCRIPTIONS')) {
          currentSection = 'track';
        } else if (trimmed.includes('INDUSTRY SUBSCRIPTIONS')) {
          currentSection = 'industry';
        } else if (trimmed.includes('ROLE SUBSCRIPTIONS')) {
          currentSection = 'role';
        }
        continue;
      }

      // Skip code block markers
      if (trimmed.startsWith('```')) {
        continue;
      }

      // Parse format: segment_type | segment_key | display_name | stripe_product_id | stripe_monthly_price_id | stripe_annual_price_id | display_price_monthly | display_price_annual | currency | marketing_bullets
      if (trimmed.includes('|')) {
        const parts = trimmed.split('|').map((p) => p.trim());
        if (parts.length >= 10 && currentSection) {
          const [
            segmentType,
            segmentKey,
            displayName,
            stripeProductId,
            stripeMonthlyPriceId,
            stripeAnnualPriceId,
            displayPriceMonthly,
            displayPriceAnnual,
            currency,
            ...marketingBulletsParts
          ] = parts;

          // Validate segment type matches current section
          if (segmentType === currentSection) {
            const key = `${segmentType}:${segmentKey}`;
            metadata.set(key, {
              segmentType: segmentType as 'track' | 'industry' | 'role',
              segmentKey,
              displayName,
              stripeProductId,
              stripeMonthlyPriceId,
              stripeAnnualPriceId,
              displayPriceMonthly,
              displayPriceAnnual,
              currency,
              marketingBullets: marketingBulletsParts.join(';'),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error parsing content/subscriptions.md:', error);
    // Return empty map if file can't be read
  }

  cachedMetadata = metadata;
  return metadata;
}

/**
 * Get subscription metadata for a segment
 */
export function getSubscriptionMetadata(
  segmentType: 'track' | 'industry' | 'role',
  segmentKey: string
): SubscriptionMetadata | null {
  const metadata = parseSubscriptionMetadata();
  const key = `${segmentType}:${segmentKey}`;
  return metadata.get(key) || null;
}

/**
 * Get Stripe price ID for a segment and billing period
 */
export function getStripePriceId(
  segmentType: 'track' | 'industry' | 'role',
  segmentKey: string,
  billingPeriod: 'monthly' | 'annual'
): string | null {
  const metadata = getSubscriptionMetadata(segmentType, segmentKey);
  if (!metadata) {
    return null;
  }

  return billingPeriod === 'annual' 
    ? metadata.stripeAnnualPriceId 
    : metadata.stripeMonthlyPriceId;
}

/**
 * Get all subscription metadata
 */
export function getAllSubscriptionMetadata(): SubscriptionMetadata[] {
  const metadata = parseSubscriptionMetadata();
  return Array.from(metadata.values());
}
