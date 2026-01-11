import { createUserSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { calculateJobMatch, type Job } from '@/lib/jobs/matching';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createUserSupabaseClient();
    
    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get student profile ID
    const { data: studentProfile } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Fetch student data with caching (request-scope memoization + Next.js cache)
    const studentData = await getStudentDataForMatching(supabase, studentProfile.id);

    // Fetch all active jobs (we'll compute matching on-the-fly for all of them)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false }) // Featured jobs first (before sorting by match)
      .order('created_at', { ascending: false }); // Then by newest

    if (error) {
      safeLogger.error('Error fetching jobs', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Calculate matching scores for each job (on-the-fly, no DB writes)
    const jobsWithScores = (jobs || []).map((job: any) => {
      const jobData: Job = {
        id: job.id,
        skills: (job.skills as string[]) || [],
        recommended_for_courses: (job.recommended_for_courses as string[]) || [],
        experience_level: job.experience_level,
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
      };
    });

    // Sort by matching score (descending) - best matches first
    jobsWithScores.sort((a, b) => b.matching_score - a.matching_score);

    return NextResponse.json({ jobs: jobsWithScores });
  } catch (error) {
    safeLogger.error('Error in jobs API', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
