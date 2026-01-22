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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Fetch startup with all related data
    // Try with founders join first, fallback to without if founders table doesn't exist
    let startup, error;
    
    const queryWithFounders = supabase
      .from('startups')
      .select(`
        *,
        founders:founder_id (
          id,
          name,
          bio,
          twitter_url,
          youtube_url,
          website
        ),
        business_models (
          revenue_streams,
          pricing_details,
          distribution_channels,
          key_metrics,
          growth_notes
        ),
        build_estimates (
          technical_difficulty,
          estimated_build_time_days,
          estimated_build_cost_usd,
          maintenance_cost_usd_monthly,
          solo_friendly
        ),
        revenue_potential (
          conservative_mrr,
          realistic_mrr,
          breakout_mrr,
          assumptions
        ),
        startup_tools (
          usage_notes,
          vibe_tools (
            id,
            name,
            category,
            cost_model,
            description,
            website_url
          )
        ),
        vibe_prompts (
          id,
          prompt_type,
          prompt_text,
          difficulty
        ),
        startup_courses (
          id,
          title,
          level,
          price,
          access_tier,
          description
        )
      `)
      .eq('id', id)
      .single();

    const resultWithFounders = await queryWithFounders;
    startup = resultWithFounders.data;
    error = resultWithFounders.error;

    // If error is about missing table/relation, try without founders join
    if (error && (error.message?.includes('relation') || error.message?.includes('does not exist') || error.code === '42P01')) {
      console.warn('Founders table not found, fetching startup without founders join:', error.message);
      
      const queryWithoutFounders = supabase
        .from('startups')
        .select(`
          *,
          business_models (
            revenue_streams,
            pricing_details,
            distribution_channels,
            key_metrics,
            growth_notes
          ),
          build_estimates (
            technical_difficulty,
            estimated_build_time_days,
            estimated_build_cost_usd,
            maintenance_cost_usd_monthly,
            solo_friendly
          ),
          revenue_potential (
            conservative_mrr,
            realistic_mrr,
            breakout_mrr,
            assumptions
          ),
          startup_tools (
            usage_notes,
            vibe_tools (
              id,
              name,
              category,
              cost_model,
              description,
              website_url
            )
          ),
          vibe_prompts (
            id,
            prompt_type,
            prompt_text,
            difficulty
          ),
          startup_courses (
            id,
            title,
            level,
            price,
            access_tier,
            description
          )
        `)
        .eq('id', id)
        .single();

      const resultWithoutFounders = await queryWithoutFounders;
      startup = resultWithoutFounders.data;
      error = resultWithoutFounders.error;
    }

    if (error) {
      console.error('Error fetching startup:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Startup not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message || 'Failed to fetch startup' },
        { status: 500 }
      );
    }

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Normalize founders to array (query returns single object for foreign key)
    // Handle case where founders table doesn't exist
    const foundersArray = startup.founders 
      ? (Array.isArray(startup.founders) 
          ? startup.founders 
          : [startup.founders])
      : [];

    // Normalize business_models to array (query returns array for one-to-many relationship)
    const businessModelsArray = Array.isArray(startup.business_models)
      ? startup.business_models
      : (startup.business_models ? [startup.business_models] : []);
    const businessModel = businessModelsArray[0] ?? null;

    // Normalize revenue_potential to array (query returns array for one-to-many relationship)
    const revenuePotentialArray = Array.isArray(startup.revenue_potential)
      ? startup.revenue_potential
      : (startup.revenue_potential ? [startup.revenue_potential] : []);
    const revenuePotential = revenuePotentialArray[0] ?? null;

    // Transform data
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
      founder: foundersArray[0] ? {
        id: foundersArray[0].id,
        name: foundersArray[0].name,
        bio: foundersArray[0].bio,
        twitterUrl: foundersArray[0].twitter_url,
        youtubeUrl: foundersArray[0].youtube_url,
        website: foundersArray[0].website,
      } : null,
      businessModel: businessModel ? {
        revenueStreams: businessModel.revenue_streams,
        pricingDetails: businessModel.pricing_details,
        distributionChannels: businessModel.distribution_channels,
        keyMetrics: businessModel.key_metrics,
        growthNotes: businessModel.growth_notes,
      } : null,
      buildEstimate: startup.build_estimates?.[0] ? {
        technicalDifficulty: formatTechnicalDifficulty(startup.build_estimates[0].technical_difficulty),
        estimatedBuildTimeDays: startup.build_estimates[0].estimated_build_time_days,
        estimatedBuildCostUsd: startup.build_estimates[0].estimated_build_cost_usd,
        maintenanceCostUsdMonthly: startup.build_estimates[0].maintenance_cost_usd_monthly,
        soloFriendly: startup.build_estimates[0].solo_friendly,
      } : null,
      revenuePotential: revenuePotential ? {
        conservativeMrr: revenuePotential.conservative_mrr,
        realisticMrr: revenuePotential.realistic_mrr,
        breakoutMrr: revenuePotential.breakout_mrr,
        assumptions: revenuePotential.assumptions,
      } : null,
      tools: (startup.startup_tools || []).map((st: any) => ({
        id: st.vibe_tools.id,
        name: st.vibe_tools.name,
        category: st.vibe_tools.category,
        costModel: st.vibe_tools.cost_model,
        description: st.vibe_tools.description,
        websiteUrl: st.vibe_tools.website_url,
        usageNotes: st.usage_notes,
      })),
      prompts: (startup.vibe_prompts || []).map((vp: any) => ({
        id: vp.id,
        promptType: vp.prompt_type,
        promptText: vp.prompt_text,
        difficulty: vp.difficulty,
      })),
      courses: (startup.startup_courses || []).map((sc: any) => ({
        id: sc.id,
        title: sc.title,
        level: sc.level,
        price: sc.price,
        accessTier: sc.access_tier,
        description: sc.description,
      })),
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
