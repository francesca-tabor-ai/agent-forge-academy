import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { JobOpportunitiesSection } from '@/components/dashboard/JobOpportunitiesSection';

export default async function JobsPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile
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
  if (profile) {
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    studentProfileId = studentProfile?.id || null;
  }

  return (
    <div>
      {/* Job Opportunities Section */}
      <JobOpportunitiesSection studentProfileId={studentProfileId} />
    </div>
  );
}
