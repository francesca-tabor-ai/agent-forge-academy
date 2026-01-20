import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { StartupDetailClient } from '@/components/startups/StartupDetailClient';
import { StartupIdeationChat } from '@/components/startups/StartupIdeationChat';

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

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Get user profile for progress tracking
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  // Fetch startup with all related data
  const { data: startup, error } = await supabase
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
        description,
        course_modules (
          id,
          title,
          order_index,
          content
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !startup) {
    notFound();
  }

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
    founder: startup.founders ? {
      id: startup.founders.id,
      name: startup.founders.name,
      bio: startup.founders.bio,
      twitterUrl: startup.founders.twitter_url,
      youtubeUrl: startup.founders.youtube_url,
      website: startup.founders.website,
    } : null,
    businessModel: startup.business_models ? {
      revenueStreams: startup.business_models.revenue_streams,
      pricingDetails: startup.business_models.pricing_details,
      distributionChannels: startup.business_models.distribution_channels,
      keyMetrics: startup.business_models.key_metrics,
      growthNotes: startup.business_models.growth_notes,
    } : null,
    buildEstimate: startup.build_estimates?.[0] ? {
      technicalDifficulty: formatTechnicalDifficulty(startup.build_estimates[0].technical_difficulty),
      estimatedBuildTimeDays: startup.build_estimates[0].estimated_build_time_days,
      estimatedBuildCostUsd: startup.build_estimates[0].estimated_build_cost_usd,
      maintenanceCostUsdMonthly: startup.build_estimates[0].maintenance_cost_usd_monthly,
      soloFriendly: startup.build_estimates[0].solo_friendly,
    } : null,
    revenuePotential: startup.revenue_potential ? {
      conservativeMrr: startup.revenue_potential.conservative_mrr,
      realisticMrr: startup.revenue_potential.realistic_mrr,
      breakoutMrr: startup.revenue_potential.breakout_mrr,
      assumptions: startup.revenue_potential.assumptions,
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
    courses: await (async () => {
      const coursesData = [];
      for (const sc of startup.startup_courses || []) {
        // Fetch user progress for this course
        let userProgress = null;
        if (profile) {
          const { data: progress } = await supabase
            .from('startup_progress_tracking')
            .select('progress_percent, started_at, updated_at')
            .eq('user_id', user.id)
            .eq('course_id', sc.id)
            .single();
          userProgress = progress;
        }

        coursesData.push({
          id: sc.id,
          title: sc.title,
          level: sc.level,
          price: sc.price,
          accessTier: sc.access_tier,
          description: sc.description,
          modules: (sc.course_modules || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((cm: any) => ({
              id: cm.id,
              title: cm.title,
              orderIndex: cm.order_index,
              content: cm.content,
            })),
          userProgress: userProgress ? {
            progressPercent: userProgress.progress_percent,
            startedAt: userProgress.started_at,
            updatedAt: userProgress.updated_at,
          } : null,
        });
      }
      return coursesData;
    })(),
  };

  return (
    <>
      <StartupDetailClient startup={transformedStartup} />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <StartupIdeationChat 
          startup={{ id: startup.id, name: startup.name, tagline: startup.tagline || '' }} 
          userId={user.id}
          embedded={true}
        />
      </div>
    </>
  );
}
