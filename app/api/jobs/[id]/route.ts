import { NextRequest, NextResponse } from 'next/server';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import { calculateJobMatch, determineJobStatus, type StudentProfile, type PortfolioProject, type CourseEnrollment, type Job } from '@/lib/jobs/matching';

// GET: Fetch job details by ID
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

    // Fetch job (jobs are public, but we check auth for consistency)
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

    // Try to get student profile for dynamic matching (optional - if not student, return static data)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    let matchingScore = job.matching_score || 0;
    let status = job.status;
    let skillsMissing = (job.skills_missing as string[]) || [];

    // If user is a student, calculate dynamic matching
    if (profile && profile.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('id, skills')
        .eq('profile_id', profile.id)
        .single();

      if (studentProfile) {
        // Get enrolled courses
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('course_id, progress_percentage, completed_at')
          .eq('student_profile_id', studentProfile.id);

        // Get portfolio projects
        const { data: projects } = await supabase
          .from('portfolio_projects')
          .select('id, tech_stack, title, description')
          .eq('student_profile_id', studentProfile.id);

        // Prepare data for matching
        const studentProfileData: StudentProfile = {
          id: studentProfile.id,
          skills: (studentProfile.skills as string[]) || [],
        };

        const portfolioProjectsData: PortfolioProject[] = (projects || []).map((p: any) => ({
          id: p.id,
          tech_stack: (p.tech_stack as string[]) || [],
          title: p.title,
          description: p.description,
        }));

        const enrolledCoursesData: CourseEnrollment[] = (enrollments || []).map((e: any) => ({
          course_id: e.course_id,
          progress_percentage: e.progress_percentage,
          completed_at: e.completed_at,
        }));

        const jobData: Job = {
          id: job.id,
          skills: (job.skills as string[]) || [],
          recommended_for_courses: (job.recommended_for_courses as string[]) || [],
          experience_level: job.experience_level,
        };

        const matchResult = calculateJobMatch(
          jobData,
          studentProfileData,
          enrolledCoursesData,
          portfolioProjectsData
        );

        matchingScore = matchResult.matchingScore;
        status = determineJobStatus(matchingScore);
        skillsMissing = matchResult.skillsMissing;
      }
    }

    return NextResponse.json({
      id: job.id,
      title: job.title,
      company: job.company,
      description: job.description,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      location: job.location,
      isRemote: job.is_remote,
      salaryRange: job.salary_range,
      status,
      matchingScore,
      skills: (job.skills as string[]) || [],
      skillsMissing,
      recommendedForCourses: (job.recommended_for_courses as string[]) || [],
      externalUrl: job.external_url,
      applicationDeadline: job.application_deadline,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}
