import { createUserSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { safeLogger } from '@/lib/utils/redactPII';
import { PortfolioSettingsForm } from '@/components/portfolio/PortfolioSettingsForm';

export default async function PortfolioSettingsPage() {
  const reqId = headers().get('x-vercel-id') ?? headers().get('x-request-id') ?? `local-${Date.now()}`;

  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      safeLogger.error('[PortfolioSettingsPage] Auth error', {
        reqId,
        error: authError.message,
        code: authError.status,
      });
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!user) {
      redirect('/auth/login');
    }

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      safeLogger.error('[PortfolioSettingsPage] Profile query error', {
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

    // Get student profile with visibility
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id, visibility')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError) {
      if (studentProfileError.code === 'PGRST116') {
        // Student profile doesn't exist yet - redirect to portfolio page
        safeLogger.warn('[PortfolioSettingsPage] Student profile not found, redirecting', {
          reqId,
          profileId: profile.id,
        });
        redirect('/student/portfolio');
      } else {
        safeLogger.error('[PortfolioSettingsPage] Student profile query error', {
          reqId,
          userId: user.id,
          profileId: profile.id,
          error: studentProfileError.message,
          code: studentProfileError.code,
          details: studentProfileError.details,
          hint: studentProfileError.hint,
        });
        throw new Error(`Failed to fetch student profile: ${studentProfileError.message}`);
      }
    }

    if (!studentProfile) {
      redirect('/student/portfolio');
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Portfolio Settings</h1>
          <p className="text-sm text-gray-600">
            Control who can see your portfolio and profile information
          </p>
        </div>
        <PortfolioSettingsForm
          currentVisibility={studentProfile.visibility}
          studentProfileId={studentProfile.id}
        />
      </div>
    );
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    
    safeLogger.error('[PortfolioSettingsPage] Server render error', {
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
