import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StudentDirectory } from '@/components/recruiter/StudentDirectory';

export default async function RecruiterDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's profile and verify recruiter role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'recruiter') {
    redirect('/');
  }

  // Get search/filter params
  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : '';
  const visibility = typeof params.visibility === 'string' ? params.visibility : 'all';

  // Build query - RLS will enforce visibility rules
  let query = supabase
    .from('student_profiles')
    .select(
      `
      id,
      visibility,
      bio,
      headshot_image_url,
      profiles!inner (
        id,
        user_id
      )
    `
    )
    .neq('visibility', 'private'); // Only show non-private profiles

  // Apply filters (server-side, respecting RLS)
  if (search) {
    // Note: Basic text search on bio
    // For production, consider full-text search or separate skills table
    query = query.ilike('bio', `%${search}%`);
  }

  if (visibility !== 'all') {
    query = query.eq('visibility', visibility);
  }

  const { data: studentProfiles, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) {
    console.error('Error fetching student profiles:', error);
  }

  return (
    <div className="recruiter-directory-page">
      <h1>Student Directory</h1>
      <p>Discover talented students and their portfolios.</p>
      <StudentDirectory
        students={studentProfiles || []}
        initialSearch={search}
        initialVisibility={visibility}
      />
    </div>
  );
}
