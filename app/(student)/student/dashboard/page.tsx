import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function StudentDashboard() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get actionable items
  // TODO: Add actual queries for:
  // - Continue lesson
  // - Upcoming session
  // - Pending question
  // - Demo day reminder

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="space-y-6">
        {/* Action items - only show what user should act on */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Next Actions</h2>
          <div className="space-y-3">
            {/* Example: Continue lesson */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Continue Learning</h3>
                  <p className="text-sm text-gray-600 mt-1">Resume where you left off</p>
                </div>
                <Link
                  href="/student/lessons"
                  className="text-sm font-medium text-brand-light hover:text-brand-light/90"
                >
                  View →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

