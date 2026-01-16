/**
 * Segment types for unified landing pages and subscriptions
 * 
 * A Segment represents a filterable grouping of courses:
 * - Track (category): e.g., "Agentic Systems", "AI Search & Visibility"
 * - Industry: e.g., "Finance", "Healthcare", "E-commerce"
 * - Role (Best For): e.g., "Engineers", "PMs", "Data Scientists"
 */

export type SegmentType = 'track' | 'industry' | 'role';

export interface Segment {
  type: SegmentType;
  key: string; // URL-friendly slug (e.g., "agentic-systems", "fintech", "pm")
  displayName: string; // Human-readable name (e.g., "Agentic Systems", "Fintech", "Product Managers")
  heroImageUrl: string; // Full-bleed hero image URL
  description: string; // Marketing copy for the landing page
  includedCourseSlugs: string[]; // Course slugs that match this segment
}

/**
 * Segment key normalization
 * Converts display names to URL-friendly slugs
 */
export function normalizeSegmentKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get segment key from display name or existing key
 */
export function getSegmentKey(type: SegmentType, nameOrKey: string): string {
  // If it's already a key-like string (lowercase, hyphens), use it
  if (/^[a-z0-9-]+$/.test(nameOrKey)) {
    return nameOrKey;
  }
  return normalizeSegmentKey(nameOrKey);
}
