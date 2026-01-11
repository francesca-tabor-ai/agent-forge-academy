/**
 * Job-aware advisor tools
 * 
 * Provides tool functions for the AI advisor to fetch and analyze job matches
 */

import { calculateJobMatch, type Job, type StudentProfile, type PortfolioProject, type CourseEnrollment } from './matching';
import { getStudentDataForMatching } from './student-data-cache';

export interface JobMatch {
  id: string;
  title: string;
  company: string;
  matchingScore: number;
  status: 'recommended' | 'unlocked' | 'locked' | 'stretch' | 'new';
  skills: string[];
  skillsMissing: string[];
  explanation: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  isRemote?: boolean;
  salaryRange?: string;
  recommendedForCourses?: string[];
}

/**
 * Get top job matches for a student with explanations
 * 
 * @param supabase - Supabase client
 * @param studentProfileId - Student profile ID
 * @param limit - Maximum number of matches to return (default: 5)
 * @returns Array of top job matches with explanations
 */
export async function getTopJobMatches(
  supabase: any,
  studentProfileId: string,
  limit: number = 5
): Promise<JobMatch[]> {
  try {
    // Get student data with caching
    const studentData = await getStudentDataForMatching(supabase, studentProfileId);

    // Fetch all active jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (jobsError || !jobs || jobs.length === 0) {
      return [];
    }

    // Calculate matches for all jobs
    const jobsWithMatches: JobMatch[] = jobs.map((job: any) => {
      const jobData: Job = {
        id: job.id,
        skills: (job.skills as string[]) || [],
        recommended_for_courses: (job.recommended_for_courses as string[]) || [],
        experience_level: job.experience_level,
      };

      const matchResult = calculateJobMatch(
        jobData,
        studentData.studentProfile,
        studentData.enrollments,
        studentData.portfolioProjects
      );

      return {
        id: job.id,
        title: job.title,
        company: job.company,
        matchingScore: matchResult.score0to100,
        status: matchResult.status,
        skills: jobData.skills,
        skillsMissing: matchResult.missingSkills,
        explanation: matchResult.explanation,
        jobType: job.job_type,
        experienceLevel: job.experience_level,
        location: job.location,
        isRemote: job.is_remote,
        salaryRange: job.salary_range,
        recommendedForCourses: job.recommended_for_courses || [],
      };
    });

    // Sort by matching score (descending) and return top matches
    return jobsWithMatches
      .sort((a: JobMatch, b: JobMatch) => b.matchingScore - a.matchingScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getTopJobMatches:', error);
    return [];
  }
}

/**
 * Format job matches for LLM context
 * 
 * @param matches - Array of job matches
 * @returns Formatted string for LLM context
 */
export function formatJobMatchesForLLM(matches: JobMatch[]): string {
  if (matches.length === 0) {
    return 'No matching job opportunities found at this time.';
  }

  return matches
    .map((job, idx) => {
      return `**${idx + 1}. ${job.title} at ${job.company}**
- **Match Score:** ${job.matchingScore}% (${job.status})
- **Match Explanation:** ${job.explanation}
- **Required Skills:** ${job.skills.join(', ') || 'Not specified'}
${job.skillsMissing.length > 0 ? `- **Missing Skills:** ${job.skillsMissing.join(', ')}` : ''}
${job.experienceLevel ? `- **Experience Level:** ${job.experienceLevel}` : ''}
${job.location ? `- **Location:** ${job.location}${job.isRemote ? ' (Remote available)' : ''}` : ''}
${job.salaryRange ? `- **Salary Range:** ${job.salaryRange}` : ''}
${job.recommendedForCourses && job.recommendedForCourses.length > 0 
  ? `- **Recommended Courses:** ${job.recommendedForCourses.join(', ')}` 
  : ''}`;
    })
    .join('\n\n');
}
