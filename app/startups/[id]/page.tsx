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
  params: { id: string };
}) {
  const { id } = params;
  
  // Check auth first
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  // Fetch startup data directly from Supabase (simpler than API for server components)
  // We'll use the API route later once it's working
  const { data: startupData, error: startupError } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .single();

  if (startupError) {
    console.error('Error fetching startup:', startupError);
    if (startupError.code === 'PGRST116') {
      return notFound();
    }
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Startup failed to load</h1>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: '#c33' }}>
          {startupError.message || 'Failed to fetch startup'}
        </pre>
      </main>
    );
  }

  if (!startupData) {
    return notFound();
  }

  // Transform basic startup data to match expected format
  const startup = {
    id: startupData.id,
    name: startupData.name,
    tagline: startupData.tagline || '',
    description: startupData.description,
    status: formatStatus(startupData.status),
    revenueRange: formatRevenueRange(startupData.revenue_range),
    vibeScore: startupData.vibe_score || 0,
    logoUrl: startupData.logo_url,
    websiteUrl: startupData.website_url,
    launchYear: startupData.launch_year,
    pricingModel: startupData.pricing_model,
    targetCustomer: startupData.target_customer,
    // Relationships will be added back once basic fetch is confirmed working
    founder: null,
    businessModel: null,
    buildEstimate: null,
    revenuePotential: null,
    tools: [],
    prompts: [],
    courses: [],
  };

  // Use the startup data we fetched above
  // The API returns the transformed startup data
  return (
    <>
      <StartupDetailClient startup={startup} />
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
