import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculateJobMatch, type Job } from '@/lib/jobs/matching';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

// Valid status values
const VALID_STATUSES = ['new', 'recommended', 'unlocked', 'locked', 'stretch'] as const;
type StatusFilter = typeof VALID_STATUSES[number];

// Valid sort options
const VALID_SORT_OPTIONS = ['best-match', 'newest', 'least-missing', 'company-az'] as const;
type SortOption = typeof VALID_SORT_OPTIONS[number];

/**
 * Validate and sanitize query parameters
 */
function validateQueryParams(request: NextRequest): {
  status?: StatusFilter[];
  matchMin?: number;
  matchMax?: number;
  skills?: string[];
  sort?: SortOption;
  search?: string;
  errors: string[];
} {
  const { searchParams } = new URL(request.url);
  const errors: string[] = [];

  // Validate status filter
  let status: StatusFilter[] | undefined;
  const statusParam = searchParams.get('status');
  if (statusParam) {
    const statusList = statusParam.split(',').map(s => s.trim()).filter(Boolean);
    const invalidStatuses = statusList.filter(s => !VALID_STATUSES.includes(s as StatusFilter));
    if (invalidStatuses.length > 0) {
      errors.push(`Invalid status values: ${invalidStatuses.join(', ')}. Valid values: ${VALID_STATUSES.join(', ')}`);
    } else {
      status = statusList as StatusFilter[];
    }
  }

  // Validate match range
  let matchMin: number | undefined;
  let matchMax: number | undefined;
  const matchMinParam = searchParams.get('matchMin');
  const matchMaxParam = searchParams.get('matchMax');
  if (matchMinParam) {
    const min = parseInt(matchMinParam, 10);
    if (isNaN(min) || min < 0 || min > 100) {
      errors.push('matchMin must be an integer between 0 and 100');
    } else {
      matchMin = min;
    }
  }
  if (matchMaxParam) {
    const max = parseInt(matchMaxParam, 10);
    if (isNaN(max) || max < 0 || max > 100) {
      errors.push('matchMax must be an integer between 0 and 100');
    } else {
      matchMax = max;
    }
  }
  if (matchMin !== undefined && matchMax !== undefined && matchMin > matchMax) {
    errors.push('matchMin must be less than or equal to matchMax');
  }

  // Validate skills filter (limit to 10 skills max)
  let skills: string[] | undefined;
  const skillsParam = searchParams.get('skills');
  if (skillsParam) {
    const skillsList = skillsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsList.length > 10) {
      errors.push('Maximum 10 skills allowed in filter');
    } else {
      // Limit individual skill length
      const invalidSkills = skillsList.filter(s => s.length > 50);
      if (invalidSkills.length > 0) {
        errors.push('Skills must be 50 characters or less');
      } else {
        skills = skillsList;
      }
    }
  }

  // Validate sort option
  let sort: SortOption | undefined;
  const sortParam = searchParams.get('sort');
  if (sortParam) {
    if (!VALID_SORT_OPTIONS.includes(sortParam as SortOption)) {
      errors.push(`Invalid sort option: ${sortParam}. Valid options: ${VALID_SORT_OPTIONS.join(', ')}`);
    } else {
      sort = sortParam as SortOption;
    }
  }

  // Validate search query (max 80 characters)
  let search: string | undefined;
  const searchParam = searchParams.get('search');
  if (searchParam) {
    if (searchParam.length > 80) {
      errors.push('Search query must be 80 characters or less');
    } else {
      search = searchParam.trim();
    }
  }

  return { status, matchMin, matchMax, skills, sort, search, errors };
}

export async function GET(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();
  
  try {
    safeLogger.info(`[${requestId}] GET /api/jobs - Request started`, {
      timestamp: new Date().toISOString(),
      url: request.url,
    });

    const supabase = await createUserSupabaseClient();
    
    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      safeLogger.error(`[${requestId}] Error getting user`, userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) {
      safeLogger.info(`[${requestId}] No user found`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    safeLogger.info(`[${requestId}] User authenticated`, { userId: user.id });

    // Validate query parameters
    const queryValidation = validateQueryParams(request);
    if (queryValidation.errors.length > 0) {
      safeLogger.warn(`[${requestId}] Invalid query parameters`, { errors: queryValidation.errors });
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryValidation.errors },
        { status: 400 }
      );
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      safeLogger.error(`[${requestId}] Error fetching profile`, profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (!profile || profile.role !== 'student') {
      safeLogger.info(`[${requestId}] User is not a student`, { role: profile?.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student profile ID
    const { data: studentProfile, error: studentProfileError } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (studentProfileError) {
      safeLogger.error(`[${requestId}] Error fetching student profile`, studentProfileError);
      return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
    }

    if (!studentProfile) {
      safeLogger.info(`[${requestId}] Student profile not found`);
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    safeLogger.info(`[${requestId}] Student profile found`, { studentProfileId: studentProfile.id });

    // Fetch student data with caching (request-scope memoization + Next.js cache)
    const studentDataStartTime = Date.now();
    let studentData;
    try {
      studentData = await getStudentDataForMatching(supabase, studentProfile.id);
      const studentDataTime = Date.now() - studentDataStartTime;
      safeLogger.info(`[${requestId}] Student data fetched`, { duration: `${studentDataTime}ms` });
    } catch (studentDataError: any) {
      safeLogger.error(`[${requestId}] Error fetching student data`, studentDataError);
      return NextResponse.json(
        { error: 'Failed to fetch student data', details: studentDataError?.message },
        { status: 500 }
      );
    }

    // Fetch all active jobs (we'll compute matching on-the-fly for all of them)
    const jobsStartTime = Date.now();
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false }) // Featured jobs first (before sorting by match)
      .order('created_at', { ascending: false }); // Then by newest

    if (jobsError) {
      safeLogger.error(`[${requestId}] Error fetching jobs from database`, {
        error: jobsError,
        code: jobsError.code,
        message: jobsError.message,
        details: jobsError.details,
      });
      return NextResponse.json(
        { error: 'Failed to fetch jobs', details: jobsError.message },
        { status: 500 }
      );
    }

    const jobsTime = Date.now() - jobsStartTime;
    safeLogger.info(`[${requestId}] Jobs fetched from database`, {
      count: jobs?.length || 0,
      duration: `${jobsTime}ms`,
    });

    // Calculate matching scores for each job (on-the-fly, no DB writes)
    const matchingStartTime = Date.now();
    const jobsWithScores = (jobs || []).map((job: any) => {
      try {
        const jobData: Job = {
          id: job.id,
          skills: Array.isArray(job.skills) ? job.skills : [],
          recommended_for_courses: Array.isArray(job.recommended_for_courses) ? job.recommended_for_courses : [],
          experience_level: job.experience_level || null,
        };

        // Compute match for this job
        const matchResult = calculateJobMatch(
          jobData,
          studentData.studentProfile,
          studentData.enrollments,
          studentData.portfolioProjects
        );

        // Return all job fields with computed matching_score, skills_missing, and status
        return {
          id: job.id,
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          job_type: job.job_type || null,
          experience_level: job.experience_level || null,
          location: job.location || null,
          is_remote: job.is_remote ?? false,
          salary_range: job.salary_range || null,
          status: matchResult.status, // Computed status: recommended/unlocked/locked/stretch/new
          matching_score: matchResult.score0to100, // Computed matching score (0-100)
          skills: jobData.skills,
          skills_missing: matchResult.missingSkills, // Computed missing skills
          recommended_for_courses: job.recommended_for_courses || [],
          external_url: job.external_url || null,
          application_deadline: job.application_deadline || null,
          is_active: job.is_active ?? true,
          is_featured: job.is_featured ?? false,
          created_at: job.created_at || null,
          updated_at: job.updated_at || null,
        };
      } catch (matchError: any) {
        safeLogger.error(`[${requestId}] Error calculating match for job ${job.id}`, matchError);
        // Return job with default match score if calculation fails
        return {
          id: job.id,
          title: job.title || '',
          company: job.company || '',
          description: job.description || '',
          job_type: job.job_type || null,
          experience_level: job.experience_level || null,
          location: job.location || null,
          is_remote: job.is_remote ?? false,
          salary_range: job.salary_range || null,
          status: 'new' as const,
          matching_score: 0,
          skills: Array.isArray(job.skills) ? job.skills : [],
          skills_missing: [],
          recommended_for_courses: Array.isArray(job.recommended_for_courses) ? job.recommended_for_courses : [],
          external_url: job.external_url || null,
          application_deadline: job.application_deadline || null,
          is_active: job.is_active ?? true,
          is_featured: job.is_featured ?? false,
          created_at: job.created_at || null,
          updated_at: job.updated_at || null,
        };
      }
    });

    const matchingTime = Date.now() - matchingStartTime;
    safeLogger.info(`[${requestId}] Matching scores calculated`, {
      count: jobsWithScores.length,
      duration: `${matchingTime}ms`,
    });

    // Sort by matching score (descending) - best matches first
    jobsWithScores.sort((a, b) => b.matching_score - a.matching_score);

    const totalTime = Date.now() - startTime;
    safeLogger.info(`[${requestId}] GET /api/jobs - Request completed`, {
      duration: `${totalTime}ms`,
      jobsCount: jobsWithScores.length,
    });

    return NextResponse.json({
      jobs: jobsWithScores,
      total: jobsWithScores.length,
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    safeLogger.error(`[${requestId}] GET /api/jobs - Unhandled error`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      duration: `${totalTime}ms`,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        requestId,
      },
      { status: 500 }
    );
  }
}
