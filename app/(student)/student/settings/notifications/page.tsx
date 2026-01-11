import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';

interface NotificationsSettingsPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NotificationsSettingsPage({
  searchParams,
}: NotificationsSettingsPageProps) {
  const supabase = await createUserSupabaseClient();
  const params = await searchParams;
  const token = params.token;

  // If token is provided, verify it matches the user's unsubscribe_token
  if (token) {
    // Verify token and allow access without login
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id, weekly_learning_emails_enabled, weekly_jobs_emails_enabled, weekly_email_day, weekly_email_hour')
      .eq('unsubscribe_token', token)
      .single();

    if (studentProfile) {
      // Token is valid, show settings
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">Email Preferences</h1>
            <p className="text-sm text-gray-600 mt-2">
              Manage your weekly email notifications and preferences
            </p>
          </div>

          <NotificationsSettings
            studentProfileId={studentProfile.id}
            initialPreferences={{
              weeklyLearningEmailsEnabled: studentProfile.weekly_learning_emails_enabled ?? true,
              weeklyJobsEmailsEnabled: studentProfile.weekly_jobs_emails_enabled ?? true,
              weeklyEmailDay: studentProfile.weekly_email_day ?? 2,
              weeklyEmailHour: studentProfile.weekly_email_hour ?? 9,
            }}
          />
        </div>
      );
    }
  }

  // No valid token, require login
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
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

  // Get student profile with email preferences
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('id, weekly_learning_emails_enabled, weekly_jobs_emails_enabled, weekly_email_day, weekly_email_hour')
    .eq('profile_id', profile.id)
    .single();

  if (!studentProfile) {
    redirect('/');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Email Preferences</h1>
        <p className="text-sm text-gray-600 mt-2">
          Manage your weekly email notifications and preferences
        </p>
      </div>

      <NotificationsSettings
        studentProfileId={studentProfile.id}
        initialPreferences={{
          weeklyLearningEmailsEnabled: studentProfile.weekly_learning_emails_enabled ?? true,
          weeklyJobsEmailsEnabled: studentProfile.weekly_jobs_emails_enabled ?? true,
          weeklyEmailDay: studentProfile.weekly_email_day ?? 2,
          weeklyEmailHour: studentProfile.weekly_email_hour ?? 9,
        }}
      />
    </div>
  );
}
