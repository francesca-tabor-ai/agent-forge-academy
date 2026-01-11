import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateJobMatch, type Job } from '@/lib/jobs/matching';
import { getStudentDataForMatching, StudentProfileNotFoundError } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

// GET: Fetch job details by ID with computed matching
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      safeLogger.info(`[${requestId}] Unauthenticated request`);
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          },
          requestId 
        },
        { status: 401 }
      );
    }

    // Get student profile (same logic as list endpoint)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'student') {
      safeLogger.info(`[${requestId}] User is not a student`, { role: profile?.role });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'FORBIDDEN',
            message: 'Access denied. Student role required.'
          },
          requestId 
        },
        { status: 403 }
      );
    }

    // Get student profile ID
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    const isNotFound = studentProfileError?.code === 'PGRST116' || 
                       studentProfileError?.message?.includes('No rows returned') ||
                       (!studentProfileError && !studentProfile);

    if (isNotFound) {
      safeLogger.info(`[${requestId}] Student profile not found`);
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'NOT_FOUND',
            message: 'Student profile not found'
          },
          requestId 
        },
        { status: 404 }
      );
    }

    if (studentProfileError) {
      safeLogger.error(`[${requestId}] Error fetching student profile`, {
        error: studentProfileError,
        code: studentProfileError.code,
        message: studentProfileError.message,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Failed to fetch student profile'
          },
          requestId 
        },
        { status: 500 }
      );
    }

    // Fetch student data with caching (request-scope memoization + Next.js cache)
    let studentData;
    try {
      studentData = await getStudentDataForMatching(supabase, studentProfile.id);
    } catch (studentDataError: any) {
      const isNotFound = studentDataError?.name === 'StudentProfileNotFoundError' ||
                         studentDataError?.message?.includes('not found');
      
      if (isNotFound) {
        safeLogger.info(`[${requestId}] Student data not found`);
        return NextResponse.json(
          { 
            ok: false,
            error: { 
              code: 'NOT_FOUND',
              message: 'Student profile data not found'
            },
            requestId 
          },
          { status: 404 }
        );
      }
      
      safeLogger.error(`[${requestId}] Error fetching student data`, {
        error: studentDataError,
        message: studentDataError?.message,
        stack: studentDataError?.stack,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Failed to fetch student data'
          },
          requestId 
        },
        { status: 500 }
      );
    }

    // Fetch job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !job) {
      safeLogger.info(`[${requestId}] Job not found`, { jobId: params.id, error: error?.message });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'NOT_FOUND',
            message: 'Job not found'
          },
          requestId 
        },
        { status: 404 }
      );
    }

    // Prepare job data for matching (identical to list endpoint)
    const jobData: Job = {
      id: job.id,
      skills: (job.skills as string[]) || [],
      recommended_for_courses: (job.recommended_for_courses as string[]) || [],
      experience_level: job.experience_level,
    };

    // Defensive check: ensure studentData is valid
    if (!studentData || !studentData.studentProfile) {
      safeLogger.warn(`[${requestId}] Invalid student data`);
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'NOT_FOUND',
            message: 'Student profile data not found'
          },
          requestId 
        },
        { status: 404 }
      );
    }

    // Compute match for this job (on-the-fly, no DB writes - identical logic to list endpoint)
    const matchResult = calculateJobMatch(
      jobData,
      studentData.studentProfile,
      studentData.enrollments || [],
      studentData.portfolioProjects || []
    );

    // Return all job fields with computed matching_score, skills_missing, and status
    // Field names match list endpoint (snake_case)
    safeLogger.info(`[${requestId}] Job fetched successfully`, { jobId: params.id });
    return NextResponse.json({
      ok: true,
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      job_type: job.job_type,
      experience_level: job.experience_level,
      location: job.location,
      is_remote: job.is_remote,
      salary_range: job.salary_range,
      status: matchResult.status, // Computed status: recommended/unlocked/locked/stretch/new
      matching_score: matchResult.score0to100, // Computed matching score (0-100)
      skills: jobData.skills,
      skills_missing: matchResult.missingSkills, // Computed missing skills
      recommended_for_courses: job.recommended_for_courses || [],
      external_url: job.external_url,
      application_deadline: job.application_deadline,
      is_active: job.is_active,
      is_featured: job.is_featured,
      created_at: job.created_at,
      updated_at: job.updated_at,
    });
  } catch (error: any) {
    safeLogger.error(`[${requestId}] Unhandled error fetching job`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      jobId: params?.id,
    });
    return NextResponse.json(
      { 
        ok: false,
        error: { 
          code: 'SERVER_ERROR',
          message: 'Internal server error'
        },
        requestId,
        // Only include error details in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: error?.message 
        }),
      },
      { status: 500 }
    );
  }
}
