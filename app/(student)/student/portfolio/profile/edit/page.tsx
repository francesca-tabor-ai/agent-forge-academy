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

  // Get or create student profile
  let { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
    .eq('profile_id', profile.id)
    .single();

  // Create student profile if it doesn't exist
  if (!studentProfile) {
    const { data: newProfile, error: createError } = await supabase
      .from('student_profiles')
      .insert({
        profile_id: profile.id,
        headline: '',
        bio: null,
        skills: [],
        location: null,
        linkedin_url: null,
        github_url: null,
        website_url: null,
        headshot_image_url: null,
      })
      .select('id, headline, bio, skills, location, linkedin_url, github_url, website_url, headshot_image_url')
      .single();

    if (createError) {
      console.error('Failed to create student profile:', createError);
      // Still render the form with empty data rather than crashing
      studentProfile = null;
    } else {
      studentProfile = newProfile;
    }
  }

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
          headshot_image_url: studentProfile?.headshot_image_url || null,
        }}
      />
    </div>
  );
}
