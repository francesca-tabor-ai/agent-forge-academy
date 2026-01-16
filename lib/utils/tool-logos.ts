/**
 * Utility functions for tool logos
 * Handles logo URLs with fallback to initials
 */

/**
 * Get logo URL for a tool
 * Tries multiple sources in order:
 * 1. Provided logoUrl (from database)
 * 2. /public/logos/{toolSlug}.png
 * 3. Clearbit API
 * 4. Fallback to initials
 */
export function getToolLogoUrl(toolName: string, logoUrl?: string | null): string | null {
  // If logoUrl is provided and valid, use it
  if (logoUrl && logoUrl.trim()) {
    return logoUrl;
  }

  // Generate slug from tool name
  const toolSlug = toolName.toLowerCase().replace(/\s+/g, '-');
  
  // Try public logos directory
  const publicLogoPath = `/logos/${toolSlug}.png`;
  
  // For now, return clearbit URL as fallback
  // In production, you can check if public logo exists first
  const clearbitUrl = `https://logo.clearbit.com/${toolName.toLowerCase().replace(/\s+/g, '')}.com`;
  
  return clearbitUrl;
}

/**
 * Get tool initials for fallback display
 */
export function getToolInitials(toolName: string): string {
  const words = toolName.trim().split(/\s+/);
  if (words.length === 1) {
    // Single word: take first 2 letters
    return toolName.substring(0, 2).toUpperCase();
  }
  // Multiple words: take first letter of first 2 words
  return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/**
 * ToolLogo component props
 */
export interface ToolLogoProps {
  toolName: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}
