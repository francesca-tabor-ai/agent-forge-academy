import { redirect } from 'next/navigation';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if user already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, role')
    .eq('user_id', user.id)
    .single();

  // If onboarding is completed, redirect to appropriate dashboard
  if (profile?.onboarding_completed) {
    const role = profile.role;
    if (role === 'student') {
      redirect('/student/dashboard');
    } else if (role === 'instructor') {
      redirect('/tutor/dashboard');
    } else if (role === 'recruiter') {
      redirect('/recruiter/directory');
    } else if (role === 'admin') {
      redirect('/admin');
    }
    redirect('/app');
  }

  return <OnboardingClient />;
}

