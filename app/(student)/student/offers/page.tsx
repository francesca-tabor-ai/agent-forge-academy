import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OffersPageClient } from '@/components/offers/OffersPageClient';

interface Offer {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: 'api' | 'hosting' | 'monitoring' | 'data' | 'tools' | 'services' | 'database' | 'vector_database' | 'ai_llm' | 'observability' | 'analytics' | 'ml_tools';
  discount_text: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_credits' | 'extended_trial' | 'tier_upgrade';
  discount_value: number | null;
  discount_code: string | null;
  external_url: string | null;
  eligibility: string | null;
  recommended_for_courses: string[] | null;
  original_price: string | null;
  discounted_price: string | null;
  features: string[] | null;
  is_recommended: boolean;
  expiration_date: string | null;
  usage_count: number;
  max_usage: number | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
}

export default async function OffersPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile to check enrollments
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile ID
  let studentProfileId: string | null = null;
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('profile_id', profile.id)
    .single();
  studentProfileId = studentProfile?.id || null;

  if (!studentProfileId) {
    redirect('/');
  }

  // Get active courses for recommendations
  let enrolledCourseSlugs: string[] = [];
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_profile_id', studentProfileId);

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses } = await supabase
        .from('courses')
        .select('slug')
        .in('id', courseIds);
      
      enrolledCourseSlugs = (courses || []).map(c => c.slug).filter(Boolean);
  }

  // Fetch all active offers
  const { data: offers, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('is_recommended', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching offers:', error);
  }

  const allOffers: Offer[] = (offers || []) as Offer[];

  // Get portfolio projects
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('id, title, description, github_url, demo_url')
    .eq('student_profile_id', studentProfileId)
    .order('created_at', { ascending: false });

  const portfolioProjects: Project[] = (projects || []).map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    github_url: p.github_url,
    demo_url: p.demo_url,
  }));

  // Get saved offers
  const { data: savedOffers } = await supabase
    .from('saved_offers')
    .select('offer_id')
    .eq('student_profile_id', studentProfileId);

  const savedOfferIds: string[] = (savedOffers || []).map(so => so.offer_id);

  // Get claimed offers
  const { data: claims } = await supabase
    .from('offer_claims')
    .select('offer_id, status')
    .eq('student_profile_id', studentProfileId);

  const claimedOfferIds: Record<string, 'claimed' | 'not_claimed' | 'requires_verification'> = {};
  (claims || []).forEach(claim => {
    claimedOfferIds[claim.offer_id] = claim.status as 'claimed' | 'not_claimed' | 'requires_verification';
  });

  // Get linked offers (offers linked to projects)
  let linkedOffers: Record<string, { projectId: string; projectTitle: string }[]> = {};
  
  if (portfolioProjects.length > 0) {
    const { data: projectOffers } = await supabase
      .from('project_offers')
      .select(`
        offer_id,
        project_id,
        portfolio_projects!inner(id, title)
      `)
      .in('project_id', portfolioProjects.map(p => p.id));

    // Create a map of offer_id to project info
    (projectOffers || []).forEach(po => {
      const offerId = po.offer_id;
      const project = (po.portfolio_projects as any);
      if (!linkedOffers[offerId]) {
        linkedOffers[offerId] = [];
      }
      linkedOffers[offerId].push({
        projectId: project.id,
        projectTitle: project.title,
      });
    });
  }

  return (
    <OffersPageClient
      offers={allOffers}
      enrolledCourseSlugs={enrolledCourseSlugs}
      projects={portfolioProjects}
      savedOfferIds={savedOfferIds}
      claimedOfferIds={claimedOfferIds}
      linkedOffers={linkedOffers}
      studentProfileId={studentProfileId}
    />
  );
}
