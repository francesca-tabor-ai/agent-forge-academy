import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { safeLogger } from '@/lib/utils/redactPII';
import { JobOpportunitiesPage } from '@/components/jobs/JobOpportunitiesPage';

export default async function JobsPage() {
  const reqId = headers().get('x-vercel-id') ?? headers().get('x-request-id') ?? `local-${Date.now()}`;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      safeLogger.error('[JobsPage] Auth error', {
        reqId,
        error: authError.message,
        code: authError.status,
      });
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      redirect('/auth/login');
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      safeLogger.error('[JobsPage] Profile query error', {
        reqId,
        userId: user.id,
        error: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    if (!profile || profile.role !== 'student') {
      redirect('/');
    }

    // Get student profile ID
    let studentProfileId: string | null = null;
    if (profile) {
      const { data: studentProfile, error: studentProfileError } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profile.id)
        .single();

      if (studentProfileError) {
        // This is not necessarily an error - student profile might not exist yet
        safeLogger.warn('[JobsPage] Student profile not found (may be expected)', {
          reqId,
          userId: user.id,
          profileId: profile.id,
          error: studentProfileError.message,
          code: studentProfileError.code,
        });
        studentProfileId = null;
      } else {
        studentProfileId = studentProfile?.id || null;
      }
    }

    return <JobOpportunitiesPage studentProfileId={studentProfileId} />;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    
    safeLogger.error('[JobsPage] Server render error', {
      reqId,
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause,
    });

    // Re-throw to trigger error boundary
    throw e;
  }
}
