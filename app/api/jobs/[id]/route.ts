import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateJobMatch, type Job } from '@/lib/jobs/matching';
import { getStudentDataForMatching } from '@/lib/jobs/student-data-cache';
import { safeLogger } from '@/lib/utils/redactPII';

// GET: Fetch job details by ID with computed matching
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createUserSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile (same logic as list endpoint)
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

    // Fetch job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
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

    // Compute match for this job (on-the-fly, no DB writes - identical logic to list endpoint)
    const matchResult = calculateJobMatch(
      jobData,
      studentData.studentProfile,
      studentData.enrollments,
      studentData.portfolioProjects
    );

    // Return all job fields with computed matching_score, skills_missing, and status
    // Field names match list endpoint (snake_case)
    return NextResponse.json({
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
  } catch (error) {
    safeLogger.error('Error fetching job', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
