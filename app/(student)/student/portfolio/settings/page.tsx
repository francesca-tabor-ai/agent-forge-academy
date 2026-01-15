import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PortfolioSettingsForm } from '@/components/portfolio/PortfolioSettingsForm';

export default async function PortfolioSettingsPage() {
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

  // Get student profile with visibility
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, visibility')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    redirect('/student/portfolio');
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Portfolio Settings</h1>
        <p className="text-sm text-gray-600">
          Control who can see your portfolio and profile information
        </p>
      </div>
      <PortfolioSettingsForm
        currentVisibility={studentProfile.visibility}
        studentProfileId={studentProfile.id}
      />
    </div>
  );
}
