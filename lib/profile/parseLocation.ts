/**
 * Parse location string to extract city and country
 * 
 * Examples:
 * - "London, UK" -> { city: "london", country: "UK" }
 * - "San Francisco, CA" -> { city: "san francisco", country: "CA" }
 * - "New York" -> { city: "new york", country: null }
 * - "Remote" -> { city: null, country: null }
 * 
 * @param location - Location string (e.g., "London, UK")
 * @returns Object with normalized city key and country
 */
export function parseLocation(location: string | null | undefined): {
  city: string | null;
  country: string | null;
} {
  if (!location || typeof location !== 'string') {
    return { city: null, country: null };
  }

  const trimmed = location.trim();
  if (trimmed.length === 0) {
    return { city: null, country: null };
  }

  // Handle special cases
  const lowerLocation = trimmed.toLowerCase();
  if (lowerLocation === 'remote' || lowerLocation === 'hybrid' || lowerLocation === 'onsite') {
    return { city: null, country: null };
  }

  // Split by comma
  const parts = trimmed.split(',').map(part => part.trim()).filter(part => part.length > 0);

  if (parts.length === 0) {
    return { city: null, country: null };
  }

  // First part is city (everything before the first comma)
  const cityRaw = parts[0];
  
  // Normalize city: lowercase, remove special chars except spaces and hyphens
  const cityNormalized = cityRaw
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars except word chars, spaces, hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Second part (if exists) is country/state
  const country = parts.length > 1 ? parts[1] : null;

  return {
    city: cityNormalized.length > 0 ? cityNormalized : null,
    country: country || null,
  };
}
