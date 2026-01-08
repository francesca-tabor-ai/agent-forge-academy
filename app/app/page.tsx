import { redirect } from 'next/navigation';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/supabase/server';

export default async function AppPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's role and redirect to appropriate dashboard
  const role = await getUserRole();

  switch (role) {
    case 'student':
      redirect('/student/dashboard');
    case 'instructor':
      redirect('/tutor/dashboard');
    case 'recruiter':
      redirect('/recruiter/directory');
    case 'admin':
      // TODO: Create admin dashboard
      redirect('/student/dashboard'); // Fallback for now
    default:
      // If no role or unknown role, redirect to onboarding
      redirect('/auth/onboarding');
  }
}
