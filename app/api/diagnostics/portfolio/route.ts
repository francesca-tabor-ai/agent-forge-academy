import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * Diagnostics endpoint for Portfolio page
 * Returns environment and data access status
 * 
 * GET /api/diagnostics/portfolio
 * 
 * Response:
 * {
 *   envVarsPresent: boolean,      // Whether required env vars are set
 *   canFetchProfile: boolean,      // Whether profile can be fetched
 *   canFetchProjects: boolean,     // Whether projects can be fetched
 *   hasProfile: boolean,           // Whether user has a profile
 *   hasStudentProfile: boolean,    // Whether user has a student profile
 *   projectsCount: number,         // Number of projects (if accessible)
 *   timestamp: string              // ISO timestamp
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const diagnostics: {
      envVarsPresent: boolean;
      canFetchProfile: boolean;
      canFetchProjects: boolean;
      hasProfile: boolean;
      hasStudentProfile: boolean;
      projectsCount: number;
      error?: string;
      timestamp: string;
    } = {
      envVarsPresent: false,
      canFetchProfile: false,
      canFetchProjects: false,
      hasProfile: false,
      hasStudentProfile: false,
      projectsCount: 0,
      timestamp: new Date().toISOString(),
    };

    // Check environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    diagnostics.envVarsPresent = hasSupabaseUrl && hasAnonKey && hasServiceKey;

    if (!diagnostics.envVarsPresent) {
      const missing: string[] = [];
      if (!hasSupabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!hasAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      if (!hasServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      diagnostics.error = `Missing environment variables: ${missing.join(', ')}`;
      
      return NextResponse.json(diagnostics, {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Try to create Supabase client
    try {
      const supabase = await createUserSupabaseClient();
      
      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        diagnostics.error = 'Not authenticated';
        return NextResponse.json(diagnostics, {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        });
      }

      // Try to fetch profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          diagnostics.error = `Profile query error: ${profileError.message} (code: ${profileError.code})`;
          return NextResponse.json(diagnostics, {
            status: 200, // Still return 200 to show diagnostic results
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          });
        }

        diagnostics.canFetchProfile = true;
        diagnostics.hasProfile = !!profile;

        if (profile && profile.role === 'student') {
          // Try to fetch student profile
          try {
            const { data: studentProfile, error: studentProfileError } = await supabase
              .from('student_profiles')
              .select('id')
              .eq('profile_id', profile.id)
              .single();

            if (!studentProfileError || studentProfileError.code === 'PGRST116') {
              // PGRST116 is "not found" which is acceptable
              diagnostics.hasStudentProfile = !!studentProfile;

              if (studentProfile) {
                // Try to fetch projects count
                try {
                  const { data: projects, error: projectsError } = await supabase
                    .from('portfolio_projects')
                    .select('id', { count: 'exact', head: true })
                    .eq('student_profile_id', studentProfile.id);

                  if (!projectsError) {
                    diagnostics.canFetchProjects = true;
                    diagnostics.projectsCount = projects?.length || 0;
                  } else {
                    diagnostics.error = `Projects query error: ${projectsError.message} (code: ${projectsError.code})`;
                  }
                } catch (projectsErr: any) {
                  diagnostics.error = `Projects query exception: ${projectsErr.message}`;
                }
              }
            } else {
              diagnostics.error = `Student profile query error: ${studentProfileError.message} (code: ${studentProfileError.code})`;
            }
          } catch (studentProfileErr: any) {
            diagnostics.error = `Student profile query exception: ${studentProfileErr.message}`;
          }
        }
      } catch (profileErr: any) {
        diagnostics.error = `Profile query exception: ${profileErr.message}`;
      }
    } catch (supabaseErr: any) {
      diagnostics.error = `Supabase client error: ${supabaseErr.message}`;
    }

    return NextResponse.json(diagnostics, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        envVarsPresent: false,
        canFetchProfile: false,
        canFetchProjects: false,
        hasProfile: false,
        hasStudentProfile: false,
        projectsCount: 0,
        error: error.message || 'Diagnostics check failed',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
