import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

// Force dynamic rendering - this route uses cookies for authentication
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface StartupFilters {
  search?: string;
  revenueRange?: string;
  vibeScore?: string;
  technicalDifficulty?: string;
  niche?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

// Map revenue range enum values to display format
const formatRevenueRange = (range: string | null): string => {
  if (!range) return '';
  const map: Record<string, string> = {
    'pre_revenue': 'Pre-revenue',
    '$1_10k': '$1K-$10K MRR',
    '$10_50k': '$10K-$50K MRR',
    '$50k_plus': '$50K+ MRR',
  };
  return map[range] || range;
};

// Map technical difficulty enum to display format
const formatTechnicalDifficulty = (difficulty: string | null): string => {
  if (!difficulty) return '';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

// Map status enum to display format
const formatStatus = (status: string | null): string => {
  if (!status) return '';
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('Unauthorized access to /api/startups - no user found');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view startups.' },
        { status: 401 }
      );
    }

    // Fetch user's bookmarked startup IDs
    const { data: bookmarks } = await supabase
      .from('startup_bookmarks')
      .select('startup_id')
      .eq('user_id', user.id);

    const bookmarkedStartupIds = new Set(
      (bookmarks || []).map((b: any) => b.startup_id)
    );

    const { searchParams } = new URL(request.url);
    const filters: StartupFilters = {
      search: searchParams.get('search') || undefined,
      revenueRange: searchParams.get('revenueRange') || undefined,
      vibeScore: searchParams.get('vibeScore') || undefined,
      technicalDifficulty: searchParams.get('technicalDifficulty') || undefined,
      niche: searchParams.get('niche') || undefined,
      status: searchParams.get('status') || undefined,
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
    };

    // Build query
    let query = supabase
      .from('startups')
      .select(`
        id,
        name,
        tagline,
        description,
        status,
        revenue_range,
        vibe_score,
        logo_url,
        website_url,
        launch_year,
        pricing_model,
        target_customer,
        founders:founder_id (
          id,
          name,
          bio
        ),
        build_estimates (
          technical_difficulty
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      // Search in startup name, tagline, description, target_customer, and founder name
      query = query.or(`name.ilike.${searchTerm},tagline.ilike.${searchTerm},description.ilike.${searchTerm},target_customer.ilike.${searchTerm}`);
      // Also search in founder name via join
      // Note: Supabase doesn't support OR with joins directly, so we'll filter founders separately if needed
    }

    if (filters.revenueRange && filters.revenueRange !== 'All') {
      query = query.eq('revenue_range', filters.revenueRange);
    }

    if (filters.vibeScore && filters.vibeScore !== 'All') {
      const minScore = parseInt(filters.vibeScore);
      query = query.gte('vibe_score', minScore);
    }

    // Note: Technical difficulty filter will be applied after fetching
    // since it's in a related table

    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase().replace(' ', '_'));
    }

    // Niche filter - filter by target_customer
    if (filters.niche && filters.niche !== 'All') {
      query = query.ilike('target_customer', `%${filters.niche}%`);
    }

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'highest-revenue':
        // Order by revenue_range enum (pre_revenue < $1_10k < $10_50k < $50k_plus)
        // We'll need to use a custom ordering or order by a computed field
        // For now, order by created_at and we'll sort in memory
        query = query.order('created_at', { ascending: false });
        break;
      case 'most-vibe-coded':
        query = query.order('vibe_score', { ascending: false });
        break;
      case 'easiest-build':
        // Order by technical difficulty (low < medium < high)
        // We'll need to sort in memory since it's in a related table
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // For now, fetch all matching startups (we'll paginate after filtering/sorting)
    // This is necessary because some filters (technical difficulty, search with founder) need in-memory processing
    const { data: startups, error, count } = await query;

    if (error) {
      console.error('Error fetching startups:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: error.message || 'Failed to fetch startups',
          code: error.code,
          details: process.env.NODE_ENV === 'development' ? error.details : undefined,
        },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    let transformedStartups = (startups || []).map((startup: any) => {
      // Normalize founders to array (query returns single object for foreign key)
      const foundersArray = Array.isArray(startup.founders) 
        ? startup.founders 
        : (startup.founders ? [startup.founders] : []);
      
      return {
        id: startup.id,
        name: startup.name,
        tagline: startup.tagline || '',
        description: startup.description,
        founder: foundersArray[0] ? {
          id: foundersArray[0].id,
          name: foundersArray[0].name,
          bio: foundersArray[0].bio,
        } : null,
        vibeScore: startup.vibe_score || 0,
        revenueRange: formatRevenueRange(startup.revenue_range),
        revenueRangeRaw: startup.revenue_range || null, // Keep raw value for sorting
        technicalDifficulty: formatTechnicalDifficulty(startup.build_estimates?.[0]?.technical_difficulty || null),
        status: formatStatus(startup.status),
        logoUrl: startup.logo_url,
        websiteUrl: startup.website_url,
        launchYear: startup.launch_year,
        pricingModel: startup.pricing_model,
        targetCustomer: startup.target_customer,
        isBookmarked: bookmarkedStartupIds.has(startup.id),
      };
    });

    // Apply technical difficulty filter if specified
    if (filters.technicalDifficulty && filters.technicalDifficulty !== 'All') {
      const difficulty = filters.technicalDifficulty.toLowerCase();
      transformedStartups = transformedStartups.filter(
        (startup) => startup.technicalDifficulty?.toLowerCase() === difficulty
      );
    }

    // Apply search filter for founder name (since we can't do OR with joins in Supabase)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      transformedStartups = transformedStartups.filter((startup) => {
        const matchesStartup = 
          startup.name.toLowerCase().includes(searchLower) ||
          startup.tagline?.toLowerCase().includes(searchLower) ||
          startup.description?.toLowerCase().includes(searchLower) ||
          startup.targetCustomer?.toLowerCase().includes(searchLower);
        const matchesFounder = startup.founder?.name?.toLowerCase().includes(searchLower);
        return matchesStartup || matchesFounder;
      });
    }

    // Apply sorting that requires in-memory processing
    // First, separate bookmarked and non-bookmarked startups
    const bookmarkedStartups: typeof transformedStartups = [];
    const nonBookmarkedStartups: typeof transformedStartups = [];
    
    transformedStartups.forEach((startup) => {
      if (startup.isBookmarked) {
        bookmarkedStartups.push(startup);
      } else {
        nonBookmarkedStartups.push(startup);
      }
    });

    // Sort each group according to the selected sort option
    // Only sort in-memory for sorts that require it (highest-revenue, easiest-build)
    // For other sorts (newest, most-vibe-coded), the database already sorted them correctly
    if (filters.sort === 'highest-revenue') {
      const revenueOrder: Record<string, number> = {
        'pre_revenue': 0,
        '$1_10k': 1,
        '$10_50k': 2,
        '$50k_plus': 3,
      };
      bookmarkedStartups.sort((a, b) => {
        const aOrder = revenueOrder[a.revenueRangeRaw] ?? -1;
        const bOrder = revenueOrder[b.revenueRangeRaw] ?? -1;
        return bOrder - aOrder; // Descending
      });
      nonBookmarkedStartups.sort((a, b) => {
        const aOrder = revenueOrder[a.revenueRangeRaw] ?? -1;
        const bOrder = revenueOrder[b.revenueRangeRaw] ?? -1;
        return bOrder - aOrder; // Descending
      });
    } else if (filters.sort === 'easiest-build') {
      const difficultyOrder: Record<string, number> = {
        'low': 0,
        'medium': 1,
        'high': 2,
      };
      bookmarkedStartups.sort((a, b) => {
        const aOrder = difficultyOrder[a.technicalDifficulty?.toLowerCase() || ''] ?? 999;
        const bOrder = difficultyOrder[b.technicalDifficulty?.toLowerCase() || ''] ?? 999;
        return aOrder - bOrder; // Ascending (easiest first)
      });
      nonBookmarkedStartups.sort((a, b) => {
        const aOrder = difficultyOrder[a.technicalDifficulty?.toLowerCase() || ''] ?? 999;
        const bOrder = difficultyOrder[b.technicalDifficulty?.toLowerCase() || ''] ?? 999;
        return aOrder - bOrder; // Ascending (easiest first)
      });
    }
    // For other sorts (newest, most-vibe-coded), the database already sorted them
    // so we maintain that order by not sorting again

    // Combine: bookmarked first, then non-bookmarked
    transformedStartups = [...bookmarkedStartups, ...nonBookmarkedStartups];

    // Apply pagination after filtering and sorting
    const page = filters.page || 1;
    const limit = filters.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedStartups = transformedStartups.slice(from, to);

    return NextResponse.json({
      startups: paginatedStartups,
      pagination: {
        page,
        limit,
        total: transformedStartups.length,
        totalPages: Math.ceil(transformedStartups.length / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/startups:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}
