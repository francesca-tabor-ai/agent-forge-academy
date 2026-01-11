import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { calculateJobMatch, type Job } from '@/lib/jobs/matching';
import { getStudentDataForMatching, StudentProfileNotFoundError } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';
import { logRequest, getUserIdFromRequest, getIpAddress, getUserAgent } from '@/lib/utils/request-logger';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

// Valid status values
const VALID_STATUSES = ['new', 'recommended', 'unlocked', 'locked', 'stretch'] as const;
type StatusFilter = typeof VALID_STATUSES[number];

// Valid sort options
const VALID_SORT_OPTIONS = ['best-match', 'newest', 'least-missing', 'company-az'] as const;
type SortOption = typeof VALID_SORT_OPTIONS[number];

/**
 * Parse and validate query parameters with safe defaults
 * Returns parsed params or throws error with details
 */
function parseJobsQuery(request: NextRequest): {
  status?: StatusFilter[];
  matchMin: number;
  matchMax: number;
  skills?: string[];
  sort: SortOption;
  search?: string;
} {
  const { searchParams } = new URL(request.url);
  
  // Parse status filter (optional, can be comma-separated or repeated params)
  let status: StatusFilter[] | undefined;
  const statusParam = searchParams.get('status');
  if (statusParam) {
    const statusList = statusParam.split(',').map(s => s.trim()).filter(Boolean);
    const validStatuses = statusList.filter(s => VALID_STATUSES.includes(s as StatusFilter));
    if (validStatuses.length > 0) {
      status = validStatuses as StatusFilter[];
    }
  }
  // Also check for repeated params (e.g., ?status=new&status=recommended)
  const allStatusParams = searchParams.getAll('status');
  if (allStatusParams.length > 0 && !statusParam) {
    const statusList = allStatusParams.map(s => s.trim()).filter(Boolean);
    const validStatuses = statusList.filter(s => VALID_STATUSES.includes(s as StatusFilter));
    if (validStatuses.length > 0) {
      status = validStatuses as StatusFilter[];
    }
  }

  // Parse match range with defaults (0-100)
  let matchMin = 0;
  let matchMax = 100;
  const matchMinParam = searchParams.get('matchMin');
  const matchMaxParam = searchParams.get('matchMax');
  
  if (matchMinParam) {
    const min = parseInt(matchMinParam, 10);
    if (!isNaN(min)) {
      matchMin = Math.max(0, Math.min(100, min)); // Clamp to 0-100
    }
  }
  if (matchMaxParam) {
    const max = parseInt(matchMaxParam, 10);
    if (!isNaN(max)) {
      matchMax = Math.max(0, Math.min(100, max)); // Clamp to 0-100
    }
  }
  
  // Ensure min <= max (swap if needed)
  if (matchMin > matchMax) {
    [matchMin, matchMax] = [matchMax, matchMin];
  }

  // Parse skills filter (accept comma-separated or repeated params, max 10)
  let skills: string[] | undefined;
  const skillsParam = searchParams.get('skills');
  if (skillsParam) {
    const skillsList = skillsParam.split(',').map(s => s.trim()).filter(Boolean);
    if (skillsList.length > 0 && skillsList.length <= 10) {
      // Filter out skills longer than 50 chars
      const validSkills = skillsList.filter(s => s.length <= 50);
      if (validSkills.length > 0) {
        skills = validSkills;
      }
    }
  }
  // Also check for repeated params
  const allSkillsParams = searchParams.getAll('skills');
  if (allSkillsParams.length > 0 && !skillsParam) {
    const skillsList = allSkillsParams.flatMap(s => s.split(',').map(x => x.trim())).filter(Boolean);
    if (skillsList.length > 0 && skillsList.length <= 10) {
      const validSkills = skillsList.filter(s => s.length <= 50);
      if (validSkills.length > 0) {
        skills = validSkills;
      }
    }
  }

  // Parse sort option with default
  let sort: SortOption = 'best-match';
  const sortParam = searchParams.get('sort');
  if (sortParam && VALID_SORT_OPTIONS.includes(sortParam as SortOption)) {
    sort = sortParam as SortOption;
  }

  // Parse search query (max 80 characters, normalize empty strings)
  let search: string | undefined;
  const searchParam = searchParams.get('search');
  if (searchParam && searchParam.trim().length > 0) {
    const trimmed = searchParam.trim();
    if (trimmed.length <= 80) {
      search = trimmed;
    }
  }

  return { status, matchMin, matchMax, skills, sort, search };
}

/**
 * Validate query parameters and return errors if any
 * This is a separate validation step that returns 400 for invalid params
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
    // Extract query params for logging
    const { searchParams } = new URL(request.url);
    const queryParams = {
      status: searchParams.get('status'),
      matchMin: searchParams.get('matchMin'),
      matchMax: searchParams.get('matchMax'),
      skills: searchParams.get('skills'),
      sort: searchParams.get('sort'),
      search: searchParams.get('search'),
    };

    safeLogger.info(`[${requestId}] GET /api/jobs - Request started`, {
      timestamp: new Date().toISOString(),
      url: request.url,
      queryParams,
    });

    const supabase = await createUserSupabaseClient();
    
    // Get user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      safeLogger.error(`[${requestId}] Error getting user`, {
        error: userError,
        code: userError.code,
        message: userError.message,
        stack: userError.stack,
      });
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

    if (!user) {
      safeLogger.info(`[${requestId}] No user found`);
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

    safeLogger.info(`[${requestId}] User authenticated`, { userId: user.id });

    // Validate query parameters (strict validation for 400 errors)
    const queryValidation = validateQueryParams(request);
    if (queryValidation.errors.length > 0) {
      safeLogger.warn(`[${requestId}] Invalid query parameters`, { 
        errors: queryValidation.errors,
        queryParams,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'INVALID_PARAMS',
            message: 'Invalid query parameters',
            details: queryValidation.errors
          },
          requestId 
        },
        { status: 400 }
      );
    }

    // Parse query parameters with safe defaults (after validation passes)
    const parsedParams = parseJobsQuery(request);

    // Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      safeLogger.error(`[${requestId}] Error fetching profile`, {
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        stack: profileError.stack || new Error().stack,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Failed to fetch profile'
          },
          requestId 
        },
        { status: 500 }
      );
    }

    if (!profile || profile.role !== 'student') {
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

    if (studentProfileError) {
      // Check if it's a "not found" error (PGRST116) vs a real DB error
      const isNotFound = studentProfileError.code === 'PGRST116' || 
                         studentProfileError.message?.includes('No rows returned');
      
      if (isNotFound) {
        safeLogger.info(`[${requestId}] Student profile not found - returning empty list`, {
          profileId: profile.id,
        });
        // Return 200 with empty list and reason (healthy empty state)
        return NextResponse.json({
          ok: true,
          jobs: [],
          total: 0,
          reason: 'PROFILE_INCOMPLETE',
          missingFields: ['student_profile'],
        });
      }
      
      safeLogger.error(`[${requestId}] Error fetching student profile`, {
        error: studentProfileError,
        code: studentProfileError.code,
        message: studentProfileError.message,
        details: studentProfileError.details,
        hint: studentProfileError.hint,
        stack: studentProfileError.stack || new Error().stack,
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

    if (!studentProfile) {
      safeLogger.info(`[${requestId}] Student profile not found - returning empty list`);
      // Return 200 with empty list and reason (healthy empty state)
      return NextResponse.json({
        ok: true,
        jobs: [],
        total: 0,
        reason: 'PROFILE_INCOMPLETE',
        missingFields: ['student_profile'],
      });
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
      const studentDataTime = Date.now() - studentDataStartTime;
      safeLogger.error(`[${requestId}] Error fetching student data`, {
        error: studentDataError,
        message: studentDataError?.message,
        stack: studentDataError?.stack,
        name: studentDataError?.name,
        code: studentDataError?.code,
        duration: `${studentDataTime}ms`,
      });
      
      // Check if it's a "not found" error (StudentProfileNotFoundError or message contains "not found")
      const isNotFound = studentDataError?.name === 'StudentProfileNotFoundError' ||
                         studentDataError?.message?.includes('not found') ||
                         studentDataError?.message?.includes('No rows returned') ||
                         studentDataError?.code === 'PGRST116';
      
      if (isNotFound) {
        safeLogger.info(`[${requestId}] Student data not found - returning empty list with PROFILE_INCOMPLETE`);
        return NextResponse.json({
          ok: true,
          jobs: [],
          total: 0,
          reason: 'PROFILE_INCOMPLETE',
          missingFields: ['student_data'],
        });
      }
      
      // For other errors, return 500 with requestId
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

    // Fetch all active jobs (we'll compute matching on-the-fly for all of them)
    const jobsStartTime = Date.now();
    let jobs: any[] | null = null;
    let jobsError: any = null;
    
    try {
      const result = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false }) // Featured jobs first (before sorting by match)
        .order('created_at', { ascending: false }); // Then by newest
      
      jobs = result.data;
      jobsError = result.error;
    } catch (dbError: any) {
      safeLogger.error(`[${requestId}] Database query exception`, {
        error: dbError?.message || 'Unknown database error',
        stack: dbError?.stack || new Error().stack,
        name: dbError?.name,
        code: dbError?.code,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Database query failed'
          },
          requestId 
        },
        { status: 500 }
      );
    }

    if (jobsError) {
      safeLogger.error(`[${requestId}] Error fetching jobs from database`, {
        error: jobsError,
        code: jobsError.code,
        message: jobsError.message,
        details: jobsError.details,
        hint: jobsError.hint,
        stack: jobsError.stack || new Error().stack,
      });
      return NextResponse.json(
        { 
          ok: false,
          error: { 
            code: 'SERVER_ERROR',
            message: 'Failed to fetch jobs'
          },
          requestId 
        },
        { status: 500 }
      );
    }

    // Defensive: handle null jobs array
    if (!jobs) {
      safeLogger.warn(`[${requestId}] Jobs query returned null, using empty array`);
      jobs = [];
    }

    const jobsTime = Date.now() - jobsStartTime;
    safeLogger.info(`[${requestId}] Jobs fetched from database`, {
      count: jobs?.length || 0,
      duration: `${jobsTime}ms`,
    });

    // Defensive check: ensure studentData is valid before processing jobs
    if (!studentData || !studentData.studentProfile) {
      safeLogger.warn(`[${requestId}] Invalid student data - returning empty list`);
      return NextResponse.json({
        ok: true,
        jobs: [],
        total: 0,
        reason: 'PROFILE_INCOMPLETE',
        missingFields: ['student_data'],
      });
    }

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

        // Compute match for this job (with defensive checks)
        const matchResult = calculateJobMatch(
          jobData,
          studentData.studentProfile,
          studentData.enrollments || [],
          studentData.portfolioProjects || []
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
      dbQueryTime: `${jobsTime}ms`,
      matchingTime: `${matchingTime}ms`,
    });

    const totalTime = Date.now() - startTime;
    const status = 200;
    
    // Log successful request
    const userId = await getUserIdFromRequest(request);
    await logRequest({
      requestId,
      userId,
      path: '/api/jobs',
      method: 'GET',
      status,
      duration: totalTime,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json({
      ok: true,
      jobs: jobsWithScores,
      total: jobsWithScores.length,
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    const status = 500;
    
    safeLogger.error(`[${requestId}] GET /api/jobs - Unhandled error`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack || new Error().stack,
      name: error?.name,
      code: error?.code,
      duration: `${totalTime}ms`,
      url: request.url,
    });

    // Log error request
    const userId = await getUserIdFromRequest(request);
    await logRequest({
      requestId,
      userId,
      path: '/api/jobs',
      method: 'GET',
      status,
      duration: totalTime,
      errorStack: error?.stack || null,
      errorMessage: error?.message || 'Unknown error',
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
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
