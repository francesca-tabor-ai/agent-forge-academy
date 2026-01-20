import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/supabase/server';
import { StartupsAdminClient } from '@/components/admin/StartupsAdminClient';

export default async function AdminStartupsPage() {
  const isAdmin = await hasRole('admin');

  if (!isAdmin) {
    redirect('/');
  }

  // Fetch all startups with related data for admin view
  const supabase = await createUserSupabaseClient();
  const { data: startups, error } = await supabase
    .from('startups')
    .select(`
      id,
      name,
      tagline,
      description,
      status,
      revenue_range,
      vibe_score,
      launch_year,
      pricing_model,
      target_customer,
      logo_url,
      website_url,
      is_featured,
      created_at,
      founders:founder_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching startups:', error);
  }

  // Fetch all founders for dropdown
  const { data: founders } = await supabase
    .from('founders')
    .select('id, name')
    .order('name');

  return (
    <StartupsAdminClient 
      initialStartups={startups || []} 
      founders={founders || []}
    />
  );
}
