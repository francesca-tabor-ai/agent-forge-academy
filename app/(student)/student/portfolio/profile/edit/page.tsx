import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from '@/components/portfolio/ProfileEditForm';

export default async function ProfileEditPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Get student profile
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url')
    .eq('profile_id', profile.id)
    .single();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Edit Profile</h1>
      <ProfileEditForm
        initialData={{
          headline: studentProfile?.headline || '',
          bio: studentProfile?.bio || '',
          skills: (studentProfile?.skills as string[]) || [],
          location: studentProfile?.location || '',
          linkedin_url: studentProfile?.linkedin_url || '',
          github_url: studentProfile?.github_url || '',
          website_url: studentProfile?.website_url || '',
        }}
      />
    </div>
  );
}
