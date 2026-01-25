/**
 * Profile Banner Image Resolver
 * 
 * Resolves banner image URLs for user profiles based on location/city.
 * Uses city banners from cities.md with safe fallback handling.
 */

import { resolveCityBanner } from './cityBanners';

/**
 * Default fallback banner image URL
 * Used when city/location cannot be resolved or image fails to load
 */
const FALLBACK_BANNER = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80';

/**
 * Get profile banner URL based on location or city
 * 
 * Priority:
 * 1. Check if location contains "london" (case-insensitive) - London first
 * 2. Check city field (normalized lookup)
 * 3. Try resolving location as city name
 * 4. Fallback to default banner
 * 
 * @param location - Full location string (e.g., "London, UK")
 * @param city - City name (e.g., "London")
 * @returns Banner image URL
 */
export function getProfileBannerUrl(
  location?: string | null,
  city?: string | null
): string {
  // First priority: Check if location contains "london" (case-insensitive)
  if (location) {
    const locLower = location.toLowerCase();
    if (locLower.includes('london')) {
      // Use the London banner from cityBanners
      return resolveCityBanner('london');
    }
  }

  // Second priority: Try city field (normalized lookup)
  if (city) {
    const cityBanner = resolveCityBanner(city);
    // Only use if it's not the default fallback
    if (cityBanner !== FALLBACK_BANNER) {
      return cityBanner;
    }
  }

  // Third priority: Try resolving location as city name (in case it's just a city name)
  if (location) {
    const locationBanner = resolveCityBanner(location);
    if (locationBanner !== FALLBACK_BANNER) {
      return locationBanner;
    }
  }

  // Fallback to default
  return FALLBACK_BANNER;
}
