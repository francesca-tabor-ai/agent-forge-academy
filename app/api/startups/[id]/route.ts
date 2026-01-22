import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch startup - start with basic data only to avoid 500 errors
    // We'll add relationships back gradually once basic fetch works
    const { data: startup, error } = await supabase
      .from('startups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching startup:', error);
      // Return detailed error for debugging
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Startup not found', code: error.code },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { 
          error: error.message || 'Failed to fetch startup',
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Transform basic startup data (no relationships for now)
    const transformedStartup = {
      id: startup.id,
      name: startup.name,
      tagline: startup.tagline || '',
      description: startup.description,
      status: formatStatus(startup.status),
      revenueRange: formatRevenueRange(startup.revenue_range),
      vibeScore: startup.vibe_score || 0,
      logoUrl: startup.logo_url,
      websiteUrl: startup.website_url,
      launchYear: startup.launch_year,
      pricingModel: startup.pricing_model,
      targetCustomer: startup.target_customer,
      // Relationships will be added back once basic fetch is confirmed working
      founder: null,
      businessModel: null,
      buildEstimate: null,
      revenuePotential: null,
      tools: [],
      prompts: [],
      courses: [],
    };

    return NextResponse.json({ startup: transformedStartup });
  } catch (error) {
    console.error('Error in GET /api/startups/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
