import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from './LayoutWrapper';
import { getUserRole } from '@/lib/supabase/server';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, role')
    .eq('user_id', user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/auth/onboarding');
  }

  const role = await getUserRole();

  return (
    <LayoutWrapper role={role}>
      {children}
    </LayoutWrapper>
  );
}

