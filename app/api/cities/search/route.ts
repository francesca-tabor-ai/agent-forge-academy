import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { searchCitiesByName, findNearestCityByCoordinates } from '@/lib/cities/findNearestCity';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cities/search
 * 
 * Search for cities by name or find nearest city by coordinates
 * 
 * Query parameters:
 * - q: Search query (city name)
 * - lat: Latitude (for nearest city search)
 * - lng: Longitude (for nearest city search)
 * - limit: Maximum number of results (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // If coordinates are provided, find nearest city
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }

      const nearestCity = await findNearestCityByCoordinates(
        latitude,
        longitude,
        500 // Max 500km
      );

      if (nearestCity) {
        return NextResponse.json({ city: nearestCity });
      }

      return NextResponse.json({ city: null });
    }

    // If query is provided, search by name
    if (query) {
      const cities = await searchCitiesByName(query, limit);
      return NextResponse.json({ cities });
    }

    // No query or coordinates provided
    return NextResponse.json(
      { error: 'Please provide either a search query (q) or coordinates (lat, lng)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Cities Search API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
