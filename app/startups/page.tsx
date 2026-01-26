import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StartupsPageClient } from '@/components/startups/StartupsPageClient';

// Force dynamic rendering - this page uses cookies for authentication
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
