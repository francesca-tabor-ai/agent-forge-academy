/**
 * Find nearest city utility functions
 * 
 * Provides functions to:
 * 1. Find exact city match by normalized key
 * 2. Find nearest city by coordinates using Haversine formula
 * 3. Search cities by name
 */

import { createUserSupabaseClient } from '@/lib/supabase/server';

export interface City {
  id: string;
  name: string;
  normalized_key: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  banner_image_url: string | null;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find city by exact normalized key match
 */
export async function findCityByKey(
  normalizedKey: string
): Promise<City | null> {
  if (!normalizedKey) return null;

  const supabase = await createUserSupabaseClient();
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, normalized_key, country, latitude, longitude, banner_image_url')
    .eq('normalized_key', normalizedKey.toLowerCase().trim())
    .single();

  if (error || !data) {
    return null;
  }

  return data as City;
}

/**
 * Find nearest city by coordinates
 * Returns the city with the smallest distance, or null if no cities with coordinates exist
 */
export async function findNearestCityByCoordinates(
  latitude: number,
  longitude: number,
  maxDistanceKm: number = 500
): Promise<City | null> {
  const supabase = await createUserSupabaseClient();
  
  // Get all cities with coordinates
  const { data: cities, error } = await supabase
    .from('cities')
    .select('id, name, normalized_key, country, latitude, longitude, banner_image_url')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error || !cities || cities.length === 0) {
    return null;
  }

  // Calculate distance for each city and find the nearest
  let nearestCity: City | null = null;
  let minDistance = Infinity;

  for (const city of cities) {
    if (city.latitude === null || city.longitude === null) continue;

    const distance = calculateDistance(
      latitude,
      longitude,
      city.latitude,
      city.longitude
    );

    if (distance < minDistance && distance <= maxDistanceKm) {
      minDistance = distance;
      nearestCity = city as City;
    }
  }

  return nearestCity;
}

/**
 * Search cities by name (case-insensitive partial match)
 */
export async function searchCitiesByName(
  query: string,
  limit: number = 10
): Promise<City[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const supabase = await createUserSupabaseClient();
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, normalized_key, country, latitude, longitude, banner_image_url')
    .ilike('name', `%${query.trim()}%`)
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data as City[];
}

/**
 * Find city for a user's location string
 * Strategy:
 * 1. Try exact match by normalized key
 * 2. If no match and coordinates are available, try nearest city by coordinates
 * 3. Otherwise return null
 */
export async function findCityForLocation(
  location: string | null,
  userLatitude?: number | null,
  userLongitude?: number | null
): Promise<City | null> {
  if (!location) return null;

  // Normalize location to match city normalized_key format
  const normalized = location
    .toLowerCase()
    .split(',')[0] // Take first part (city name)
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, ' '); // Normalize whitespace

  // Try exact match first
  const exactMatch = await findCityByKey(normalized);
  if (exactMatch) {
    return exactMatch;
  }

  // If coordinates are provided, try to find nearest city
  if (userLatitude !== null && userLatitude !== undefined &&
      userLongitude !== null && userLongitude !== undefined) {
    const nearest = await findNearestCityByCoordinates(
      userLatitude,
      userLongitude,
      500 // Max 500km distance
    );
    if (nearest) {
      return nearest;
    }
  }

  return null;
}
