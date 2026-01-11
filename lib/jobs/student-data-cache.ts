/**
 * Student Data Caching for Jobs Matching
 * 
 * Provides request-scope memoization for student profile, enrollments, and portfolio projects.
 * Note: Uses request-scope caching only (unstable_cache not available in API routes).
 */

import type { StudentProfile, PortfolioProject, CourseEnrollment } from './matching';
import { safeLogger } from '@/lib/utils/redactPII';

interface StudentData {
  studentProfile: StudentProfile;
  enrollments: CourseEnrollment[];
  portfolioProjects: PortfolioProject[];
}

// Request-scope cache (memoization within a single request)
const requestCache = new Map<string, Promise<StudentData>>();

/**
 * Custom error class for student profile not found
 */
export class StudentProfileNotFoundError extends Error {
  constructor(message: string = 'Student profile not found') {
    super(message);
    this.name = 'StudentProfileNotFoundError';
  }
}

/**
 * Internal function to fetch student data from database
 */
async function fetchStudentDataFromDB(
  supabase: any,
  studentProfileId: string
): Promise<StudentData> {
  // Fetch student profile (including CV text for skill extraction)
  const { data: studentProfile, error: profileError } = await supabase
    .from('student_profiles')
    .select('id, skills, cv_text')
    .eq('id', studentProfileId)
    .single();

  // Check for "not found" errors (PGRST116 is Supabase's "no rows returned" code)
  const isNotFound = profileError?.code === 'PGRST116' || 
                     profileError?.message?.includes('No rows returned') ||
                     profileError?.message?.includes('not found') ||
                     (!profileError && !studentProfile);

  if (isNotFound) {
    throw new StudentProfileNotFoundError('Student profile not found');
  }

  // If there's a real database error (not just "not found"), throw it
  if (profileError) {
    safeLogger.error('Database error fetching student profile', {
      error: profileError,
      code: profileError.code,
      message: profileError.message,
    });
    throw new Error(`Database error: ${profileError.message || 'Failed to fetch student profile'}`);
  }

  if (!studentProfile) {
    throw new StudentProfileNotFoundError('Student profile not found');
  }

  // Fetch enrollments (non-critical, continue with empty array on error)
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select('course_id, progress_percentage, completed_at')
    .eq('student_profile_id', studentProfileId);

  if (enrollmentsError) {
    safeLogger.error('Error fetching enrollments', enrollmentsError);
    // Continue with empty array if error (non-critical)
  }

  // Fetch portfolio projects (non-critical, continue with empty array on error)
  const { data: projects, error: projectsError } = await supabase
    .from('portfolio_projects')
    .select('id, tech_stack, title, description')
    .eq('student_profile_id', studentProfileId);

  if (projectsError) {
    safeLogger.error('Error fetching portfolio projects', projectsError);
    // Continue with empty array if error (non-critical)
  }

  return {
    studentProfile: {
      id: studentProfile.id,
      skills: (studentProfile.skills as string[]) || [],
      cv_text: studentProfile.cv_text || null,
    },
    enrollments: (enrollments || []).map((e: any) => ({
      course_id: e.course_id,
      progress_percentage: e.progress_percentage,
      completed_at: e.completed_at,
    })),
    portfolioProjects: (projects || []).map((p: any) => ({
      id: p.id,
      tech_stack: (p.tech_stack as string[]) || [],
      title: p.title,
      description: p.description,
    })),
  };
}

/**
 * Fetch student data with request-scope caching
 * 
 * Uses request-scope memoization to prevent duplicate fetches within the same request.
 * This is safe for API routes and works across all Next.js environments.
 * 
 * @param supabase - Supabase client
 * @param studentProfileId - Student profile ID
 * @returns Student data (profile, enrollments, portfolio projects)
 */
export async function getStudentDataForMatching(
  supabase: any,
  studentProfileId: string
): Promise<StudentData> {
  // Request-scope memoization: if already fetched in this request, return cached promise
  const cacheKey = `student-data-${studentProfileId}`;
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }

  // Fetch data and cache the promise
  const dataPromise = fetchStudentDataFromDB(supabase, studentProfileId);

  // Store in request cache for memoization
  requestCache.set(cacheKey, dataPromise);

  // Clean up after request completes (prevent memory leak)
  dataPromise.finally(() => {
    requestCache.delete(cacheKey);
  });

  return dataPromise;
}

/**
 * Invalidate student data cache (for cache invalidation scenarios)
 * Note: This requires revalidateTag from next/cache
 */
export async function invalidateStudentDataCache(studentProfileId: string): Promise<void> {
  // In a real implementation, you would use revalidateTag
  // import { revalidateTag } from 'next/cache';
  // revalidateTag(`student-data:${studentProfileId}`);
  
  // For now, this is a placeholder for future cache invalidation
  console.log(`Cache invalidation requested for student: ${studentProfileId}`);
}
