import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar';
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
    <div className="flex h-screen" style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

