/**
 * City Banner Image Resolver
 * 
 * Maps city names (normalized keys) to banner image URLs
 * Generated from content/cities.md at build time
 */

// Try to import generated mapping, fallback to empty object if not generated yet
let CITY_BANNER_MAP: Record<string, string> = {};

try {
  // Import generated mapping (created at build time from content/cities.md)
  const generated = require('./cityBanners.generated');
  CITY_BANNER_MAP = generated.CITY_BANNER_MAP || {};
} catch (error) {
  // Fallback: use hardcoded mapping if generated file doesn't exist yet
  // This allows the app to work before the first build
  CITY_BANNER_MAP = {
  // Major cities
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1515895309288-a3815ab7cf81?w=1920&q=80',
  'chicago': 'https://images.unsplash.com/photo-1494522358652-f8ccf2ff46f0?w=1920&q=80',
  'boston': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80',
  'seattle': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'austin': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1920&q=80',
  'denver': 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1920&q=80',
  'miami': 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=1920&q=80',
  'toronto': 'https://images.unsplash.com/photo-1531326111166-855395867b2d?w=1920&q=80',
  'vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=1920&q=80',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'berlin': 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1920&q=80',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1920&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80',
  'rome': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&q=80',
  'milan': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&q=80',
  'dublin': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80',
  'edinburgh': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'melbourne': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'hong kong': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
  'tel aviv': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
  'stockholm': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'copenhagen': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'zurich': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
  'lisbon': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80',
  'porto': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80',
  'warsaw': 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1920&q=80',
  'prague': 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1920&q=80',
  'budapest': 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=1920&q=80',
  'athens': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1920&q=80',
  'istanbul': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
  'mumbai': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'bangalore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'delhi': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1920&q=80',
  'sao paulo': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'rio de janeiro': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'buenos aires': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80',
  'mexico city': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80',
  'montreal': 'https://images.unsplash.com/photo-1531326111166-855395867b2d?w=1920&q=80',
  'calgary': 'https://images.unsplash.com/photo-1531326111166-855395867b2d?w=1920&q=80',
  'ottawa': 'https://images.unsplash.com/photo-1531326111166-855395867b2d?w=1920&q=80',
  };
}

/**
 * Default banner image URL
 * Used when city is not found in the mapping or city is null
 */
const DEFAULT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80';

/**
 * Resolve banner image URL for a given city
 * 
 * @param city - Normalized city key (e.g., "london", "new york")
 * @returns Banner image URL (city-specific or default)
 */
export function resolveCityBanner(city: string | null | undefined): string {
  if (!city || typeof city !== 'string') {
    return DEFAULT_BANNER_IMAGE;
  }

  const normalizedCity = city.toLowerCase().trim();
  
  // Direct lookup
  if (CITY_BANNER_MAP[normalizedCity]) {
    return CITY_BANNER_MAP[normalizedCity];
  }

  // Fallback to default
  return DEFAULT_BANNER_IMAGE;
}

/**
 * Get all available cities with banner images
 * Useful for debugging or admin interfaces
 */
export function getAvailableCities(): string[] {
  return Object.keys(CITY_BANNER_MAP).sort();
}

/**
 * Check if a city has a custom banner image
 */
export function hasCityBanner(city: string | null | undefined): boolean {
  if (!city || typeof city !== 'string') {
    return false;
  }

  const normalizedCity = city.toLowerCase().trim();
  return CITY_BANNER_MAP.hasOwnProperty(normalizedCity);
}
