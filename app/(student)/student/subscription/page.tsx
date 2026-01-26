import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SubscriptionPage } from '@/components/subscription/SubscriptionPage';
import { getSubscriptionData } from '@/lib/subscription/getSubscriptionData';

// Force dynamic rendering - this page uses cookies for authentication
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubscriptionPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}

export default async function SubscriptionPageServer(props: SubscriptionPageProps) {
  const searchParams = await props.searchParams;
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  // Fetch subscription data server-side (direct DB fetch - preferred approach)
  // This provides best performance and SEO compared to client-side API calls
  // Errors will be caught by error.tsx boundary
  const subscriptionData = await getSubscriptionData();

  if (!subscriptionData) {
    // User not authenticated (shouldn't happen due to redirect above)
    redirect('/auth/login');
  }

  // Check for success/cancel query params from Stripe redirects
  const showSuccess = searchParams.success === 'true';
  const showCanceled = searchParams.canceled === 'true';

  // Pass data to client component
  return (
    <SubscriptionPage 
      subscriptionData={subscriptionData}
      userEmail={user.email || ''}
      showSuccess={showSuccess}
      showCanceled={showCanceled}
    />
  );
}
