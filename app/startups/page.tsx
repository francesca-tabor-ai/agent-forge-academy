import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StartupsPageClient } from '@/components/startups/StartupsPageClient';

export default async function StartupsPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login');
  }

  return <StartupsPageClient />;
}
