import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GTMControlTowerClient } from '@/components/tools/gtm-control-tower/GTMControlTowerClient';

export default async function GTMControlTowerPage() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get student profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">GTM Control Tower</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage your go-to-market systems with real-time visibility into events, trade-offs, and data quality.
        </p>
      </div>

      <GTMControlTowerClient />
    </div>
  );
}
