/**
 * Industry taxonomy for courses
 * 
 * This is a controlled vocabulary of industries that courses can be tagged with.
 * Courses can have multiple industries (e.g., a course might be relevant for both
 * E-commerce and SaaS).
 * 
 * Keep these labels stable; expand the list as needed.
 */
export const INDUSTRIES = [
  'E-commerce',
  'SaaS',
  'Marketplaces',
  'Finance',
  'Healthcare',
  'Media & Publishing',
  'DevTools',
  'Legal & Compliance',
  'Retail / CPG',
  'B2B Sales / RevOps',
] as const;

export type Industry = typeof INDUSTRIES[number];

/**
 * Check if a string is a valid industry
 */
export function isValidIndustry(value: string): value is Industry {
  return (INDUSTRIES as readonly string[]).includes(value);
}
