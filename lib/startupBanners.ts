/**
 * Startup Banner Generator
 * 
 * Generates deterministic gradient-based banners for startups
 * Uses CSS gradients instead of external images for reliability
 */

/**
 * Predefined gradient palettes for startup banners
 * Each palette has 2-3 colors that work well together
 */
const GRADIENT_PALETTES = [
  // Blue tones
  { colors: ['#3B82F6', '#1E40AF', '#1E3A8A'], name: 'blue' },
  // Purple tones
  { colors: ['#8B5CF6', '#6D28D9', '#5B21B6'], name: 'purple' },
  // Green tones
  { colors: ['#10B981', '#059669', '#047857'], name: 'green' },
  // Orange tones
  { colors: ['#F59E0B', '#D97706', '#B45309'], name: 'orange' },
  // Pink tones
  { colors: ['#EC4899', '#DB2777', '#BE185D'], name: 'pink' },
  // Indigo tones
  { colors: ['#6366F1', '#4F46E5', '#4338CA'], name: 'indigo' },
  // Teal tones
  { colors: ['#14B8A6', '#0D9488', '#0F766E'], name: 'teal' },
  // Red tones
  { colors: ['#EF4444', '#DC2626', '#B91C1C'], name: 'red' },
  // Cyan tones
  { colors: ['#06B6D4', '#0891B2', '#0E7490'], name: 'cyan' },
  // Amber tones
  { colors: ['#F59E0B', '#D97706', '#B45309'], name: 'amber' },
];

/**
 * Generate a deterministic hash from a string
 * Returns a number between 0 and max
 */
function hashString(str: string, max: number = 1000): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % max;
}

/**
 * Generate a gradient banner style for a startup
 * 
 * @param startupId - Unique identifier for the startup
 * @param startupName - Name of the startup (optional, for additional variation)
 * @returns CSS gradient string and palette info
 */
export function generateStartupBanner(
  startupId: string,
  startupName?: string
): {
  gradient: string;
  palette: typeof GRADIENT_PALETTES[0];
  style: { background: string; backgroundSize: string; backgroundPosition: string };
} {
  // Use both ID and name for more variation
  const seed = hashString(startupId + (startupName || ''), GRADIENT_PALETTES.length);
  const palette = GRADIENT_PALETTES[seed];
  
  // Generate angle variation based on name
  const angleSeed = startupName ? hashString(startupName, 360) : hashString(startupId, 360);
  const angle = angleSeed; // 0-360 degrees
  
  // Create gradient with 2-3 colors
  const gradient = `linear-gradient(${angle}deg, ${palette.colors.join(', ')})`;
  
  return {
    gradient,
    palette,
    style: {
      background: gradient,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };
}

/**
 * Generate a gradient banner for a city/profile
 * Similar to startup banners but optimized for profile headers
 * 
 * @param city - City name (optional)
 * @param userId - User ID for deterministic generation
 * @returns CSS gradient string and style
 */
export function generateProfileBanner(
  city?: string | null,
  userId?: string
): {
  gradient: string;
  style: { background: string; backgroundSize: string; backgroundPosition: string };
} {
  // Use city if available, otherwise use userId
  const seedString = city || userId || 'default';
  const seed = hashString(seedString, GRADIENT_PALETTES.length);
  const palette = GRADIENT_PALETTES[seed];
  
  // Generate angle variation
  const angleSeed = hashString(seedString, 360);
  const angle = angleSeed;
  
  // Create gradient
  const gradient = `linear-gradient(${angle}deg, ${palette.colors.join(', ')})`;
  
  return {
    gradient,
    style: {
      background: gradient,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };
}
